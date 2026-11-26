import { Component } from '@angular/core';
import {
  ResetPasswordForm,
  ResetPasswordPayload,
} from '../../../components/auth-module/reset-password-form/reset-password-form';

@Component({
  selector: 'app-reset-password',
  imports: [ResetPasswordForm],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  onResetPassword(payload: ResetPasswordPayload) {
    void payload;
  }
}