import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { doc, Firestore, onSnapshot, setDoc, Unsubscribe } from '@angular/fire/firestore';
import { LoyaltyMemberDetailsModel } from '../../../../models/store-front-module/user-info/loyalty-member-details.model';

export interface LoyaltyUserProfile {
  isLoyaltyMember?: boolean;
  loyaltyMemberDetails?: LoyaltyMemberDetailsModel | null;
}

@Component({
  selector: 'app-loyalty-membership-sign-up-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './loyalty-membership-sign-up-form.html',
  styleUrl: './loyalty-membership-sign-up-form.css',
})
export class LoyaltyMembershipSignUpForm implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);

  private unsubscribeAuth: Unsubscribe | null = null;
  private unsubscribeDoc: Unsubscribe | null = null;

  @Input() user: LoyaltyUserProfile | null = null;

  protected isLoading = false;
  protected successMessage = '';
  protected errorMessage = '';

  protected formData: Omit<LoyaltyMemberDetailsModel, 'memberNo'> = {
    firstName: '',
    lastName: '',
    emailAddress: '',
  };

  ngOnInit(): void {
    this.unsubscribeAuth = onAuthStateChanged(this.auth, (firebaseUser) => {
      this.unsubscribeDoc?.();
      this.unsubscribeDoc = null;

      if (!firebaseUser) {
        this.user = null;
        this.cdr.detectChanges();
        return;
      }

      const userRef = doc(this.firestore, `users/${firebaseUser.uid}`);
      this.unsubscribeDoc = onSnapshot(
        userRef,
        (snapshot) => {
          this.user = snapshot.exists() ? (snapshot.data() as LoyaltyUserProfile) : null;
          this.cdr.detectChanges();
        },
        (err) => {
          console.error('[LoyaltyMembershipSignUpForm] Failed to load user profile:', err);
        }
      );
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeDoc?.();
    this.unsubscribeAuth?.();
  }

  protected get isAlreadyMember(): boolean {
    return this.user?.isLoyaltyMember === true;
  }

  protected get submitButtonLabel(): string {
    if (this.isLoading) return 'Registering...';
    if (this.isAlreadyMember) return 'Joined';
    return 'Join Now — Earn Benefits';
  }

  protected async onSubmit(form: NgForm): Promise<void> {
    if (this.isLoading || this.isAlreadyMember) return;

    this.successMessage = '';
    this.errorMessage = '';

    const firstName = this.formData.firstName.trim();
    const lastName = this.formData.lastName.trim();
    const emailAddress = this.formData.emailAddress.trim();

    if (form.invalid || !firstName || !lastName || !emailAddress) {
      form.control.markAllAsTouched();
      this.errorMessage = 'Please enter your first name, last name, and a valid email address.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      const uid = this.auth.currentUser?.uid;
      if (!uid) throw new Error('You must be logged in to register.');

      const memberNo = `UN-${Date.now().toString().slice(-6)}`;
      const loyaltyMemberDetails: LoyaltyMemberDetailsModel = {
        firstName,
        lastName,
        emailAddress,
        memberNo,
      };

      const userRef = doc(this.firestore, `users/${uid}`);
      await setDoc(
        userRef,
        {
          isLoyaltyMember: true,
          loyaltyMemberDetails,
        },
        { merge: true }
      );

      this.user = {
        ...(this.user ?? {}),
        isLoyaltyMember: true,
        loyaltyMemberDetails,
      };

      this.successMessage = `You have signed up for Urban Nomad Loyalty! Your membership number is ${memberNo}.`;
      this.resetForm(form);
    } catch (err: unknown) {
      console.error('[LoyaltyMembershipSignUpForm] Loyalty registration failed:', err);
      this.errorMessage =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private resetForm(form: NgForm): void {
    this.formData = {
      firstName: '',
      lastName: '',
      emailAddress: '',
    };
    form.resetForm(this.formData);
  }
}