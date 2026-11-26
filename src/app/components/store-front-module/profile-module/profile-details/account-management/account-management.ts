import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  Auth,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signOut,
  User,
} from '@angular/fire/auth';
import { deleteDoc, doc, Firestore } from '@angular/fire/firestore';

type DeleteStep = 'idle' | 'confirm' | 'verify';

@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-management.html',
  styleUrl: './account-management.css',
})
export class AccountManagement implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  readonly requiredPhrase = 'URBAN-NOMAD';

  step = signal<DeleteStep>('idle');
  typedPhrase = signal('');
  passwordForReauth = signal('');
  needsReauth = signal(false);
  isDeleting = signal(false);
  errorMessage = signal<string | null>(null);
  currentUserEmail = signal<string | null>(null);

  private resetViewState(): void {
    this.step.set('idle');
    this.typedPhrase.set('');
    this.passwordForReauth.set('');
    this.needsReauth.set(false);
    this.isDeleting.set(false);
    this.errorMessage.set(null);
  }

  async ngOnInit(): Promise<void> {
    this.resetViewState();

    const user = await this.getCurrentUser();
    this.currentUserEmail.set(user?.email ?? null);
    if (!user) {
      this.errorMessage.set('You are not signed in.');
    }
  }

  ngOnDestroy(): void {
    this.resetViewState();
  }

  startDeleteFlow(): void {
    this.errorMessage.set(null);
    this.typedPhrase.set('');
    this.passwordForReauth.set('');
    this.needsReauth.set(false);
    this.step.set('confirm');
  }

  confirmYes(): void {
    this.errorMessage.set(null);
    this.typedPhrase.set('');
    this.step.set('verify');
  }

  cancelDeleteFlow(): void {
    if (this.isDeleting()) return;
    this.resetViewState();
  }

  onPhraseInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.typedPhrase.set(input.value);
    this.errorMessage.set(null);
  }

  onPasswordInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.passwordForReauth.set(input.value);
    this.errorMessage.set(null);
  }

  blockClipboardAction(event: ClipboardEvent | DragEvent): void {
    event.preventDefault();
    this.errorMessage.set('Copy and paste are disabled. Please type URBAN-NOMAD manually.');
  }

  isPhraseMatching(): boolean {
    return this.typedPhrase().trim() === this.requiredPhrase;
  }

  private getCurrentUser(): Promise<User | null> {
    if (this.auth.currentUser) {
      return Promise.resolve(this.auth.currentUser);
    }

    return new Promise((resolve) => {
      const unsub = onAuthStateChanged(this.auth, (user) => {
        unsub();
        resolve(user);
      });
    });
  }

  async confirmAccountDeletion(): Promise<void> {
    if (!this.isPhraseMatching()) {
      this.errorMessage.set(`Please type ${this.requiredPhrase} to confirm account deletion.`);
      return;
    }

    const user = await this.getCurrentUser();
    if (!user) {
      this.errorMessage.set('No active authenticated session found. Please sign in again.');
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set(null);

    try {
      if (this.needsReauth()) {
        const enteredPassword = this.passwordForReauth();
        if (!user.email || !enteredPassword) {
          this.errorMessage.set('Please enter your current password to verify your identity.');
          this.isDeleting.set(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email, enteredPassword);
        await reauthenticateWithCredential(user, credential);
      }

      const uid = user.uid;
      await deleteDoc(doc(this.firestore, `users/${uid}`));
      await deleteUser(user);
      await signOut(this.auth);

      this.resetViewState();
      await this.router.navigate(['/']);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';

      if (code === 'auth/requires-recent-login') {
        this.needsReauth.set(true);
        this.errorMessage.set(
          'For security, please enter your password below to re-authenticate and complete deletion.',
        );
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        this.errorMessage.set('Incorrect password. Please try again.');
      } else {
        console.error('[AccountManagement] Failed to delete account:', err);
        this.errorMessage.set('Could not complete account deletion. Please try again.');
      }
    } finally {
      this.isDeleting.set(false);
    }
  }
}