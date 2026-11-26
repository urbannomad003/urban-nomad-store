import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RegisterAccountService } from '../../../services/auth-module/register-account.service';

export interface VerifyAccountPayload {
  verified?: boolean;
}

@Component({
  selector: 'app-verify-account-form',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-account-form.html',
  styleUrl: './verify-account-form.css',
  host: { class: 'block font-sans' },
})
export class VerifyAccountForm {
  private router = inject(Router);
  private registerAccountService = inject(RegisterAccountService);

  submitted = output<VerifyAccountPayload>();
  verified = output<void>();
  resent = output<void>();

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  resentMessage = signal<string | null>(null);

  goBackToHome(): void {
    this.router.navigate(['/']);
  }

  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  setError(message: string | null): void {
    this.errorMessage.set(message);
  }

  async onCheckVerification(): Promise<void> {
    if (this.isLoading()) return;
    this.errorMessage.set(null);
    this.resentMessage.set(null);
    this.isLoading.set(true);

    try {
      const isVerified = await this.registerAccountService.refreshVerificationStatus();
      if (isVerified) {
        this.verified.emit();
        this.submitted.emit({ verified: true });
        this.router.navigate(['/login']);
      } else {
        this.errorMessage.set(
          'Your email is not verified yet. Please click the link in your inbox first.',
        );
      }
    } catch {
      this.errorMessage.set(
        'Could not check verification status. Please sign in and try again.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  async onResend(): Promise<void> {
    if (this.isLoading()) return;
    this.errorMessage.set(null);
    this.resentMessage.set(null);
    this.isLoading.set(true);

    try {
      await this.registerAccountService.resendVerificationEmail();
      this.resent.emit();
      this.resentMessage.set(
        'A new verification email has been sent. Check your inbox and spam folder.',
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not resend verification email. Please try again.';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}