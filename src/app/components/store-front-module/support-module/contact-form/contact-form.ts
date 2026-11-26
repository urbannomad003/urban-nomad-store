import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

export interface SupportContactPayload {
  firstName: string;
  secondName: string;
  email: string;
  phone?: string;
  description: string;
}

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/moedryrk';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css',
})
export class ContactForm {
  private readonly http = inject(HttpClient);

  protected firstName = '';
  protected secondName = '';
  protected email = '';
  protected phone = '';
  protected description = '';

  protected readonly isSubmitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly errorMessage = signal('');

  protected async onSubmit(form: NgForm): Promise<void> {
    if (this.isSubmitting()) return;

    this.errorMessage.set('');
    this.submitted.set(false);

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.errorMessage.set('Please complete all required fields.');
      return;
    }

    const payload: SupportContactPayload = {
      firstName: this.firstName.trim(),
      secondName: this.secondName.trim(),
      email: this.email.trim(),
      phone: this.phone.trim() || undefined,
      description: this.description.trim(),
    };

    this.isSubmitting.set(true);

    try {
      const headers = new HttpHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      });

      await firstValueFrom(
        this.http.post(FORMSPREE_ENDPOINT, payload, { headers }),
      );

      this.submitted.set(true);
      form.resetForm();
    } catch (error) {
      console.error('[ContactForm] Formspree submission failed:', error);
      this.errorMessage.set(
        'Could not send your message right now. Please try again or email urbannomad381@gmail.com.',
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}