import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  UserCredential,
} from '@angular/fire/auth';
import { doc, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { UnUserModel } from '../../models/store-front-module/user-info/un-user.model';

export interface RegisterAccountInput {
  fullName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export interface RegisterValidationResult {
  valid: boolean;
  errorMessage?: string;
  payload?: RegisterAccountInput;
}

@Injectable({
  providedIn: 'root',
})
export class RegisterAccountService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  private pendingVerificationEmail: string | null = null;
  private pendingVerificationPassword: string | null = null;

  getPendingVerificationEmail(): string | null {
    return this.pendingVerificationEmail;
  }

  setPendingCredentials(email: string, password: string): void {
    this.pendingVerificationEmail = email.trim();
    this.pendingVerificationPassword = password;
  }

  clearPendingCredentials(): void {
    this.pendingVerificationEmail = null;
    this.pendingVerificationPassword = null;
  }

  isFormDataValid(
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    acceptTerms: boolean,
  ): boolean {
    const name = fullName.trim();
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return (
      name.length > 0 &&
      emailRegex.test(trimmedEmail) &&
      password.length >= 8 &&
      password === confirmPassword &&
      acceptTerms
    );
  }

  validateRegistration(
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    acceptTerms: boolean,
  ): RegisterValidationResult {
    const name = fullName.trim();
    const trimmedEmail = email.trim();

    if (!name || !trimmedEmail || !password) {
      return {
        valid: false,
        errorMessage: 'Please complete all required fields.',
      };
    }

    if (password.length < 8) {
      return {
        valid: false,
        errorMessage: 'Password must be at least 8 characters long.',
      };
    }

    if (password !== confirmPassword) {
      return {
        valid: false,
        errorMessage: 'Passwords do not match.',
      };
    }

    if (!acceptTerms) {
      return {
        valid: false,
        errorMessage: 'Please accept the terms and conditions to continue.',
      };
    }

    return {
      valid: true,
      payload: {
        fullName: name,
        email: trimmedEmail,
        password,
        acceptTerms,
      },
    };
  }

  async registerWithEmail(input: RegisterAccountInput): Promise<UserCredential> {
    const trimmedEmail = input.email.trim();
    const credential = await createUserWithEmailAndPassword(
      this.auth,
      trimmedEmail,
      input.password,
    );

    const trimmedName = input.fullName.trim();
    if (trimmedName) {
      await updateProfile(credential.user, { displayName: trimmedName });
    }

    await this.saveUserProfile(credential, trimmedName);
    await sendEmailVerification(credential.user);

    this.pendingVerificationEmail = trimmedEmail;
    this.pendingVerificationPassword = input.password;

    await signOut(this.auth);

    return credential;
  }

  async registerWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this.auth, provider);
    await this.saveUserProfile(credential, credential.user.displayName ?? '');
    return credential;
  }

  async registerWithFacebook(): Promise<UserCredential> {
    const provider = new FacebookAuthProvider();
    const credential = await signInWithPopup(this.auth, provider);
    await this.saveUserProfile(credential, credential.user.displayName ?? '');
    return credential;
  }

  async resendVerificationEmail(email?: string, password?: string): Promise<void> {
    if (this.auth.currentUser) {
      await sendEmailVerification(this.auth.currentUser);
      return;
    }

    const targetEmail = (email ?? this.pendingVerificationEmail)?.trim();
    const targetPassword = password ?? this.pendingVerificationPassword;

    if (!targetEmail || !targetPassword) {
      throw new Error(
        'Please sign in with your email and password to resend the verification email.',
      );
    }

    const cred = await signInWithEmailAndPassword(this.auth, targetEmail, targetPassword);
    try {
      await sendEmailVerification(cred.user);
    } finally {
      await signOut(this.auth);
    }
  }

  async refreshVerificationStatus(email?: string, password?: string): Promise<boolean> {
    const targetEmail = (email ?? this.pendingVerificationEmail)?.trim();
    const targetPassword = password ?? this.pendingVerificationPassword;

    if (this.auth.currentUser) {
      await this.auth.currentUser.reload();
      return this.auth.currentUser.emailVerified;
    }

    if (!targetEmail || !targetPassword) {
      return false;
    }

    const cred = await signInWithEmailAndPassword(this.auth, targetEmail, targetPassword);
    await cred.user.reload();
    const verified = cred.user.emailVerified;

    if (verified) {
      const userRef = doc(this.firestore, `users/${cred.user.uid}`);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        await updateDoc(userRef, { updatedAt: new Date().toISOString() });
      }
      this.clearPendingCredentials();
    } else {
      await signOut(this.auth);
    }

    return verified;
  }

  mapRegisterError(err: unknown): string {
    const code = (err as { code?: string })?.code ?? '';

    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 8 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-up popup was closed before completing registration.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with this email using a different sign-in method.';
      default:
        return 'Registration failed. Please try again.';
    }
  }

  private splitName(rawName: string): { firstName: string; lastName: string } {
    const parts = rawName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return { firstName: '', lastName: '' };
    }
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  }

  private async saveUserProfile(
    credential: UserCredential,
    fullName: string,
  ): Promise<void> {
    const user = credential.user;
    const userRef = doc(this.firestore, `users/${user.uid}`);
    const existingSnap = await getDoc(userRef);
    const now = new Date().toISOString();

    const resolvedFullName = (fullName || user.displayName || '').trim();
    const { firstName, lastName } = this.splitName(resolvedFullName);
    const emailAddress = user.email ?? '';

    if (!existingSnap.exists()) {
      const newUser: UnUserModel = {
        userId: user.uid,
        title: null,
        firstName,
        lastName,
        emailAddress,
        dateOfBirth: null,
        isLoyaltyMember: false,
        loyaltyMemberDetails: null,
        physicalAddress: null,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(userRef, newUser);
    } else {
      await updateDoc(userRef, {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(emailAddress ? { emailAddress } : {}),
        updatedAt: now,
      });
    }
  }
}