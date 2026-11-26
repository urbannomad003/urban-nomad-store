import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout.html',
  styleUrl: './logout.css',
})
export class Logout {
  private auth = inject(Auth);
  private router = inject(Router);

  isLoggingOut = signal(false);
  errorMessage = signal<string | null>(null);

  async onLogout(): Promise<void> {
    if (this.isLoggingOut()) return;

    this.isLoggingOut.set(true);
    this.errorMessage.set(null);

    try {
      await signOut(this.auth);
      await this.router.navigate(['/']);
    } catch (err) {
      console.error('[Logout] Failed to sign out:', err);
      this.errorMessage.set('Could not end your session. Please try again.');
    } finally {
      this.isLoggingOut.set(false);
    }
  }
}