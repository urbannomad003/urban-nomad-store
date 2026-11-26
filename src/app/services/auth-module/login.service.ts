import { Injectable, inject } from '@angular/core';
import {
  Auth,
  browserLocalPersistence,
  browserSessionPersistence,
  FacebookAuthProvider,
  GoogleAuthProvider,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  UserCredential,
} from '@angular/fire/auth';
import { doc, Firestore, serverTimestamp, setDoc } from '@angular/fire/firestore';

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginValidationResult {
  valid: boolean;
  errorMessage?: string;
  payload?: LoginInput;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  isFormDataValid(email: string, password: string): boolean {
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed) && password.length > 0;
  }

  validateLogin(
    email: string,
    password: string,
    rememberMe = false,
  ): LoginValidationResult {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      return {
        valid: false,
        errorMessage: 'Please enter both your email address and password.',
      };
    }

    return {
      valid: true,
      payload: {
        email: trimmedEmail,
        password,
        rememberMe,
      },
    };
  }

  async loginWithEmail(input: LoginInput): Promise<UserCredential> {
    const trimmedEmail = input.email.trim();
    const persistence =
      input.rememberMe === false ? browserSessionPersistence : browserLocalPersistence;

    await setPersistence(this.auth, persistence);

    const credential = await signInWithEmailAndPassword(
      this.auth,
      trimmedEmail,
      input.password,
    );

    await credential.user.reload();

    if (!credential.user.emailVerified) {
      await signOut(this.auth);
      throw { code: 'auth/email-not-verified' };
    }

    await this.syncUserProfile(credential, 'password');
    return credential;
  }

  async loginWithGoogle(rememberMe = true): Promise<UserCredential> {
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(this.auth, persistence);

    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this.auth, provider);
    await this.syncUserProfile(credential, 'google');
    return credential;
  }

  async loginWithFacebook(rememberMe = true): Promise<UserCredential> {
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(this.auth, persistence);

    const provider = new FacebookAuthProvider();
    const credential = await signInWithPopup(this.auth, provider);
    await this.syncUserProfile(credential, 'facebook');
    return credential;
  }

  mapLoginError(err: unknown): string {
    const code = (err as { code?: string })?.code ?? '';
    const message = (err as { message?: string })?.message ?? '';

    if (code === 'permission-denied' || message.includes('Missing or insufficient permissions')) {
      return 'Firestore permission denied. Check your Firestore security rules for users/{userId}.';
    }

    switch (code) {
      case 'auth/email-not-verified':
        return 'Please verify your email address before signing in. Check your inbox or spam folder.';
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many sign-in attempts. Please wait a moment and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed before completing login.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with this email using a different sign-in method.';
      default:
        return message || 'Sign in failed. Please try again.';
    }
  }

  private async syncUserProfile(
    credential: UserCredential,
    provider: 'password' | 'google' | 'facebook',
  ): Promise<void> {
    const user = credential.user;
    if (!user?.uid) return;

    await user.getIdToken(true);
    const userRef = doc(this.firestore, `users/${user.uid}`);

    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email ?? '',
        fullName: user.displayName ?? '',
        provider,
        emailVerified: user.emailVerified,
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }
}