import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  RegisterAccountInput,
  RegisterAccountService,
} from '../../../services/auth-module/register-account.service';

export type RegisterPayload = RegisterAccountInput;

@Component({
  selector: 'app-register-account-form',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './register-account-form.html',
  styleUrl: './register-account-form.css',
  host: { class: 'block font-sans' },
})
export class RegisterAccountForm {
  private router = inject(Router);
  private registerAccountService = inject(RegisterAccountService);

  submitted = output<RegisterPayload>();
  googleRegister = output<void>();
  facebookRegister = output<void>();
  registered = output<RegisterPayload>();

  fullName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  acceptTerms = signal(false);
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  get isFormValid(): boolean {
    return this.registerAccountService.isFormDataValid(
      this.fullName(),
      this.email(),
      this.password(),
      this.confirmPassword(),
      this.acceptTerms(),
    );
  }

  goBackToHome(): void {
    this.router.navigate(['/']);
  }

  async onGoogleRegister(): Promise<void> {
    if (this.isLoading()) return;
    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.googleRegister.emit();

    try {
      const cred = await this.registerAccountService.registerWithGoogle();
      this.registered.emit({
        fullName: cred.user.displayName ?? '',
        email: cred.user.email ?? '',
        password: '',
        acceptTerms: true,
      });
    } catch (err) {
      this.errorMessage.set(this.registerAccountService.mapRegisterError(err));
    } finally {
      this.isLoading.set(false);
    }
  }

  async onFacebookRegister(): Promise<void> {
    if (this.isLoading()) return;
    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.facebookRegister.emit();

    try {
      const cred = await this.registerAccountService.registerWithFacebook();
      this.registered.emit({
        fullName: cred.user.displayName ?? '',
        email: cred.user.email ?? '',
        password: '',
        acceptTerms: true,
      });
    } catch (err) {
      this.errorMessage.set(this.registerAccountService.mapRegisterError(err));
    } finally {
      this.isLoading.set(false);
    }
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

    const validation = this.registerAccountService.validateRegistration(
      this.fullName(),
      this.email(),
      this.password(),
      this.confirmPassword(),
      this.acceptTerms(),
    );

    if (!validation.valid || !validation.payload) {
      this.errorMessage.set(validation.errorMessage ?? 'Please complete all required fields.');
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.submitted.emit(validation.payload);

    try {
      await this.registerAccountService.registerWithEmail(validation.payload);
      this.registered.emit(validation.payload);
    } catch (err) {
      this.errorMessage.set(this.registerAccountService.mapRegisterError(err));
    } finally {
      this.isLoading.set(false);
    }
  }
}