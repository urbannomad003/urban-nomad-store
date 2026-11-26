import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginInput, LoginService } from '../../../services/auth-module/login.service';

export type LoginPayload = LoginInput;

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
  host: { class: 'block font-sans' },
})
export class LoginForm {
  private router = inject(Router);
  private loginService = inject(LoginService);

  submitted = output<LoginPayload>();
  googleLogin = output<void>();
  facebookLogin = output<void>();
  loggedIn = output<void>();

  email = signal('');
  password = signal('');
  rememberMe = signal(false);
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  get isFormValid(): boolean {
    return this.loginService.isFormDataValid(this.email(), this.password());
  }

  goBackToHome(): void {
    this.router.navigate(['/']);
  }

  async onGoogleLogin(): Promise<void> {
    if (this.isLoading()) return;
    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.googleLogin.emit();

    try {
      await this.loginService.loginWithGoogle(this.rememberMe());
      this.loggedIn.emit();
      await this.router.navigate(['/']);
    } catch (err) {
      this.errorMessage.set(this.loginService.mapLoginError(err));
    } finally {
      this.isLoading.set(false);
    }
  }

  async onFacebookLogin(): Promise<void> {
    if (this.isLoading()) return;
    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.facebookLogin.emit();

    try {
      await this.loginService.loginWithFacebook(this.rememberMe());
      this.loggedIn.emit();
      await this.router.navigate(['/']);
    } catch (err) {
      this.errorMessage.set(this.loginService.mapLoginError(err));
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

    const validation = this.loginService.validateLogin(
      this.email(),
      this.password(),
      this.rememberMe(),
    );

    if (!validation.valid || !validation.payload) {
      this.errorMessage.set(
        validation.errorMessage ?? 'Please enter both your email address and password.',
      );
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.submitted.emit(validation.payload);

    try {
      await this.loginService.loginWithEmail(validation.payload);
      this.loggedIn.emit();
      await this.router.navigate(['/']);
    } catch (err) {
      this.errorMessage.set(this.loginService.mapLoginError(err));
    } finally {
      this.isLoading.set(false);
    }
  }
}