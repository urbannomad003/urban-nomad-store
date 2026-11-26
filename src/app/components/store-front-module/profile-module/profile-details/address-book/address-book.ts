import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { PhysicalAddressModel } from '../../../../../models/store-front-module/user-info/physical-address.model';
import { RetrieveUserInfoService } from '../../../../../services/store-front-module/users-module/retrieve-user-info.service';
import { UploadUserInfoService } from '../../../../../services/store-front-module/users-module/upload-user-info.service';

@Component({
  selector: 'app-address-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address-book.html',
  styleUrl: './address-book.css',
})
export class AddressBook implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private retrieveUserInfoService = inject(RetrieveUserInfoService);
  private uploadUserInfoService = inject(UploadUserInfoService);

  addressForm!: FormGroup;
  isLoading = signal(true);
  isSaving = signal(false);
  isRemoving = signal(false);
  isModalOpen = signal(false);
  errorMessage = signal<string | null>(null);
  savedAddress = signal<PhysicalAddressModel | null>(null);

  private resolvedUserId: string | null = null;

  async ngOnInit(): Promise<void> {
    this.addressForm = this.fb.group({
      street: ['', [Validators.required, Validators.minLength(2)]],
      suburb: ['', [Validators.required, Validators.minLength(2)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      province: ['', [Validators.required, Validators.minLength(2)]],
      postalCode: ['', [Validators.required, Validators.minLength(3)]],
    });

    this.resolvedUserId = await new Promise<string | null>((resolve) => {
      const unsub = onAuthStateChanged(this.auth, (authUser) => {
        unsub();
        resolve(authUser?.uid ?? null);
      });
    });

    await this.loadAddress();
  }

  private async loadAddress(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      if (!this.resolvedUserId) {
        this.errorMessage.set('You must be signed in to manage your address book.');
        return;
      }

      const profile = await this.retrieveUserInfoService.getUserProfile(this.resolvedUserId);
      this.savedAddress.set(profile?.physicalAddress ?? null);
    } catch (err) {
      console.error('[AddressBook] Failed to load address:', err);
      this.errorMessage.set('Could not load saved addresses. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  openAddressModal(): void {
    this.errorMessage.set(null);
    const current = this.savedAddress();

    this.addressForm.reset({
      street: current?.street ?? '',
      suburb: current?.suburb ?? '',
      city: current?.city ?? '',
      province: current?.province ?? '',
      postalCode: current?.postalCode ?? '',
    });

    this.isModalOpen.set(true);
  }

  closeAddressModal(): void {
    if (this.isSaving()) return;
    this.isModalOpen.set(false);
    this.errorMessage.set(null);
  }

  async saveAddress(): Promise<void> {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.errorMessage.set('Please fill in all required address fields.');
      return;
    }

    if (!this.resolvedUserId) {
      this.errorMessage.set('No active authenticated user found.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const raw = this.addressForm.value;
    const addressPayload: PhysicalAddressModel = {
      street: String(raw.street ?? '').trim(),
      suburb: String(raw.suburb ?? '').trim(),
      city: String(raw.city ?? '').trim(),
      province: String(raw.province ?? '').trim(),
      postalCode: String(raw.postalCode ?? '').trim(),
    };

    try {
      await this.uploadUserInfoService.updateUserProfile(this.resolvedUserId, {
        physicalAddress: addressPayload,
      });

      this.savedAddress.set(addressPayload);
      this.isModalOpen.set(false);
    } catch (err) {
      console.error('[AddressBook] Failed to save address:', err);
      this.errorMessage.set('Failed to save address. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }

  async removeAddress(): Promise<void> {
    if (!this.resolvedUserId || this.isRemoving()) return;

    this.isRemoving.set(true);
    this.errorMessage.set(null);

    try {
      await this.uploadUserInfoService.updateUserProfile(this.resolvedUserId, {
        physicalAddress: null,
      });

      this.savedAddress.set(null);
    } catch (err) {
      console.error('[AddressBook] Failed to remove address:', err);
      this.errorMessage.set('Failed to remove address. Please try again.');
    } finally {
      this.isRemoving.set(false);
    }
  }
}