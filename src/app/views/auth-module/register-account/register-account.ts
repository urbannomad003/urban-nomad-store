import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  RegisterAccountForm,
  RegisterPayload,
} from '../../../components/auth-module/register-account-form/register-account-form';

@Component({
  selector: 'app-register-account',
  imports: [RegisterAccountForm],
  templateUrl: './register-account.html',
  styleUrl: './register-account.css',
})
export class RegisterAccount {
  private router = inject(Router);

  onRegister(payload: RegisterPayload) {
    void payload;
    this.router.navigate(['/verify-account']);
  }
}