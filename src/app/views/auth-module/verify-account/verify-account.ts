import { Component } from '@angular/core';
import {
  VerifyAccountForm,
  VerifyAccountPayload,
} from '../../../components/auth-module/verify-account-form/verify-account-form';

@Component({
  selector: 'app-verify-account',
  imports: [VerifyAccountForm],
  templateUrl: './verify-account.html',
  styleUrl: './verify-account.css',
})
export class VerifyAccount {
  onVerify(payload: VerifyAccountPayload) {
    void payload;
  }

  onResend() {}
}