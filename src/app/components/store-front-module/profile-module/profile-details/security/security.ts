import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged, sendPasswordResetEmail } from '@angular/fire/auth';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './security.html',
  styleUrl: './security.css',
})
export class Security implements OnInit {
  private auth = inject(Auth);

  userEmail = signal<string | null>(null);
  isLoadingUser = signal(true);
  isSending = signal(false);
  resetSent = signal(false);
  errorMessage = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    this.isLoadingUser.set(true);

    try {
      const email = await new Promise<string | null>((resolve) => {
        const unsub = onAuthStateChanged(this.auth, (user) => {
          unsub();
          resolve(user?.email ?? null);
        });
      });

      this.userEmail.set(email);
    } finally {
      this.isLoadingUser.set(false);
    }
  }

  async sendResetLink(): Promise<void> {
    const email = this.userEmail()?.trim();

    if (!email) {
      this.errorMessage.set('No email address is associated with your account.');
      return;
    }

    if (this.isSending()) return;

    this.isSending.set(true);
    this.errorMessage.set(null);
    this.resetSent.set(false);

    try {
      await sendPasswordResetEmail(this.auth, email);
      this.resetSent.set(true);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';

      if (code === 'auth/too-many-requests') {
        this.errorMessage.set('Too many requests. Please wait a moment before trying again.');
      } else if (code === 'auth/network-request-failed') {
        this.errorMessage.set('Network error. Please check your connection and try again.');
      } else {
        console.error('[Security] Failed to send password reset email:', err);
        this.errorMessage.set('Could not send password reset email. Please try again.');
      }
    } finally {
      this.isSending.set(false);
    }
  }
}