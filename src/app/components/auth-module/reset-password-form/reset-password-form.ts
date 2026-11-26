import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, output, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ResetPasswordService } from '../../../services/auth-module/reset-password.service';

export interface ResetPasswordPayload {
  email: string;
}

export interface ConfirmNewPasswordPayload {
  oobCode: string;
  password: string;
}

@Component({
  selector: 'app-reset-password-form',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reset-password-form.html',
  styleUrl: './reset-password-form.css',
  host: { class: 'block font-sans' },
})
export class ResetPasswordForm implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private resetPasswordService = inject(ResetPasswordService);

  submitted = output<ResetPasswordPayload>();
  passwordSaved = output<ConfirmNewPasswordPayload>();

  email = signal('');
  oobCode = signal<string | null>(null);
  isConfirmStep = signal(false);

  newPassword = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  sentMessage = signal<string | null>(null);

  get isFormValid(): boolean {
    if (this.isConfirmStep()) {
      return this.resetPasswordService.isNewPasswordFormValid(
        this.newPassword(),
        this.confirmPassword(),
      );
    }
    return this.resetPasswordService.isEmailValid(this.email());
  }

  async ngOnInit(): Promise<void> {
    const code = this.route.snapshot.queryParamMap.get('oobCode');
    if (!code) return;

    this.oobCode.set(code);
    this.isConfirmStep.set(true);
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const accountEmail = await this.resetPasswordService.verifyResetCode(code);
      this.email.set(accountEmail);
    } catch (err) {
      this.errorMessage.set(this.resetPasswordService.mapResetError(err));
    } finally {
      this.isLoading.set(false);
    }
  }

  goBackToHome(): void {
    this.router.navigate(['/']);
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  setError(message: string | null): void {
    this.errorMessage.set(message);
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (this.isConfirmStep()) {
      await this.handleConfirmNewPassword();
      return;
    }

    await this.handleSendResetEmail();
  }

  private async handleSendResetEmail(): Promise<void> {
    const validation = this.resetPasswordService.validateEmailInput(this.email());

    if (!validation.valid || !validation.email) {
      this.errorMessage.set(
        validation.errorMessage ?? 'Please enter the email address associated with your account.',
      );
      this.sentMessage.set(null);
      return;
    }

    this.errorMessage.set(null);
    this.sentMessage.set(null);
    this.isLoading.set(true);

    const payload: ResetPasswordPayload = { email: validation.email };
    this.submitted.emit(payload);

    try {
      await this.resetPasswordService.sendResetEmail(validation.email);
      this.sentMessage.set(
        `If an account exists for ${validation.email}, a password reset link has been sent. Open the link to set your new password.`,
      );
    } catch (err) {
      this.errorMessage.set(this.resetPasswordService.mapResetError(err));
    } finally {
      this.isLoading.set(false);
    }
  }

  private async handleConfirmNewPassword(): Promise<void> {
    const code = this.oobCode();
    if (!code) {
      this.errorMessage.set('Missing reset code. Please request a new password reset link.');
      return;
    }

    const validation = this.resetPasswordService.validateNewPasswordInput(
      this.newPassword(),
      this.confirmPassword(),
    );

    if (!validation.valid || !validation.password) {
      this.errorMessage.set(
        validation.errorMessage ?? 'Please enter and confirm your new password.',
      );
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    try {
      await this.resetPasswordService.saveNewPassword(code, validation.password);
      this.passwordSaved.emit({ oobCode: code, password: validation.password });
      await this.router.navigate(['/login']);
    } catch (err) {
      this.errorMessage.set(this.resetPasswordService.mapResetError(err));
    } finally {
      this.isLoading.set(false);
    }
  }
}