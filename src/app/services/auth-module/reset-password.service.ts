import { Injectable, inject } from '@angular/core';
import {
  Auth,
  confirmPasswordReset,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
} from '@angular/fire/auth';

export interface ResetEmailValidationResult {
  valid: boolean;
  errorMessage?: string;
  email?: string;
}

export interface NewPasswordValidationResult {
  valid: boolean;
  errorMessage?: string;
  password?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ResetPasswordService {
  private auth = inject(Auth);

  isEmailValid(email: string): boolean {
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  }

  isNewPasswordFormValid(password: string, confirmPassword: string): boolean {
    return password.length >= 8 && password === confirmPassword;
  }

  validateEmailInput(email: string): ResetEmailValidationResult {
    const trimmed = email.trim();

    if (!trimmed) {
      return {
        valid: false,
        errorMessage: 'Please enter the email address associated with your account.',
      };
    }

    if (!this.isEmailValid(trimmed)) {
      return {
        valid: false,
        errorMessage: 'Please enter a valid email address.',
      };
    }

    return {
      valid: true,
      email: trimmed,
    };
  }

  validateNewPasswordInput(
    password: string,
    confirmPassword: string,
  ): NewPasswordValidationResult {
    if (!password || !confirmPassword) {
      return {
        valid: false,
        errorMessage: 'Please enter and confirm your new password.',
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

    return {
      valid: true,
      password,
    };
  }

  async sendResetEmail(email: string): Promise<void> {
    const trimmed = email.trim();
    await sendPasswordResetEmail(this.auth, trimmed);
  }

  async verifyResetCode(oobCode: string): Promise<string> {
    return verifyPasswordResetCode(this.auth, oobCode);
  }

  async saveNewPassword(oobCode: string, newPassword: string): Promise<void> {
    await confirmPasswordReset(this.auth, oobCode, newPassword);
  }

  mapResetError(err: unknown): string {
    const code = (err as { code?: string })?.code ?? '';

    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/expired-action-code':
        return 'This password reset link has expired. Please request a new one.';
      case 'auth/invalid-action-code':
        return 'This password reset link is invalid or has already been used.';
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 8 characters.';
      case 'auth/too-many-requests':
        return 'Too many requests. Please wait a moment and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        return (err as { message?: string })?.message || 'Unable to process password reset. Please try again.';
    }
  }
}