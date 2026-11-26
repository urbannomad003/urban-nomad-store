import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { RetrieveUserInfoService } from '../../../../../services/store-front-module/users-module/retrieve-user-info.service';
import { UploadUserInfoService } from '../../../../../services/store-front-module/users-module/upload-user-info.service';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-details.html',
  styleUrl: './account-details.css',
})
export class AccountDetails implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private retrieveUserInfoService = inject(RetrieveUserInfoService);
  private uploadUserInfoService = inject(UploadUserInfoService);

  detailsForm!: FormGroup;
  isLoading = signal(true);
  savingField = signal<string | null>(null);
  saveError = signal<string | null>(null);

  editStates: Record<string, boolean> = {
    title: false,
    firstName: false,
    lastName: false,
    dob: false,
  };

  private formBackup: Record<string, unknown> = {};
  private resolvedUserId: string | null = null;

  async ngOnInit(): Promise<void> {
    this.detailsForm = this.fb.group({
      title: [null],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dob: [null],
    });

    this.resolvedUserId = await new Promise<string | null>((resolve) => {
      const unsub = onAuthStateChanged(this.auth, (authUser) => {
        unsub();
        resolve(authUser?.uid ?? null);
      });
    });

    await this.loadProfile();
  }

  private async loadProfile(): Promise<void> {
    this.isLoading.set(true);

    try {
      if (!this.resolvedUserId) {
        return;
      }

      const profile = await this.retrieveUserInfoService.getUserProfile(this.resolvedUserId);

      if (profile) {
        this.detailsForm.patchValue({
          title: profile.title || null,
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          dob: profile.dateOfBirth || null,
        });
        this.backupValues();
      }
    } catch (err) {
      console.error('[AccountDetails] Failed to load profile:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleEdit(field: string): void {
    this.editStates[field] = true;
    this.saveError.set(null);
  }

  async saveField(field: string): Promise<void> {
    const control = this.detailsForm.get(field);
    if (!this.resolvedUserId) return;

    this.savingField.set(field);
    this.saveError.set(null);

    const firestoreKey = field === 'dob' ? 'dateOfBirth' : field;

    try {
      await this.uploadUserInfoService.updateUserProfile(this.resolvedUserId, {
        [firestoreKey]: control?.value ?? null,
      });
      this.editStates[field] = false;
      this.backupValues();
    } catch (err) {
      console.error(`[AccountDetails] Failed to save ${field}:`, err);
      this.saveError.set('Failed to save. Please try again.');
    } finally {
      this.savingField.set(null);
    }
  }

  cancelEdit(field: string): void {
    this.editStates[field] = false;
    this.detailsForm.get(field)?.setValue(this.formBackup[field]);
    this.saveError.set(null);
  }

  isSaving(field: string): boolean {
    return this.savingField() === field;
  }

  private backupValues(): void {
    this.formBackup = { ...this.detailsForm.value };
  }
}