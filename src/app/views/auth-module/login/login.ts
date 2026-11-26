import { Component } from '@angular/core';
import { LoginForm, LoginPayload } from '../../../components/auth-module/login-form/login-form';

@Component({
  selector: 'app-login',
  imports: [LoginForm],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  onLogin(payload: LoginPayload) {
    void payload;
  }
}