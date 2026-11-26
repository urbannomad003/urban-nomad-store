import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { doc, Firestore, onSnapshot, Unsubscribe } from '@angular/fire/firestore';
import { LoyaltyMemberDetailsModel } from '../../../../models/store-front-module/user-info/loyalty-member-details.model';

@Component({
  selector: 'app-loyalty-membership-info',
  templateUrl: './loyalty-membership-info.html',
  styleUrl: './loyalty-membership-info.css',
})
export class LoyaltyMembershipInfo implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  private unsubscribeAuth: Unsubscribe | null = null;
  private unsubscribeDoc: Unsubscribe | null = null;

  protected isLoyaltyMember = false;
  protected loyaltyMemberDetails: LoyaltyMemberDetailsModel | null = null;
  protected signupDate: string | null = null;
  protected isFlipped = false;

  ngOnInit(): void {
    this.unsubscribeAuth = onAuthStateChanged(this.auth, (user) => {
      this.unsubscribeDoc?.();
      this.unsubscribeDoc = null;

      if (!user) {
        this.isLoyaltyMember = false;
        this.loyaltyMemberDetails = null;
        this.signupDate = null;
        this.isFlipped = false;
        return;
      }

      const userRef = doc(this.firestore, `users/${user.uid}`);
      this.unsubscribeDoc = onSnapshot(
        userRef,
        (snapshot) => {
          const data = snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : null;
          const details =
            (data?.['loyaltyMemberDetails'] as LoyaltyMemberDetailsModel | null | undefined) ?? null;
          const memberFlag = data?.['isLoyaltyMember'] === true && !!details;

          this.isLoyaltyMember = memberFlag;
          this.loyaltyMemberDetails = details;
          this.signupDate =
            typeof data?.['loyaltyJoinedDate'] === 'string' ? data['loyaltyJoinedDate'] : null;

          if (!memberFlag) {
            this.isFlipped = false;
          }
        },
        (err) => {
          console.error('[LoyaltyMembershipInfo] Failed to load loyalty member details:', err);
        }
      );
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeDoc?.();
    this.unsubscribeAuth?.();
  }

  protected get hasMembership(): boolean {
    return this.isLoyaltyMember === true && !!this.loyaltyMemberDetails;
  }

  protected get memberFullName(): string {
    if (!this.hasMembership || !this.loyaltyMemberDetails) return '';
    const first = this.loyaltyMemberDetails.firstName?.trim() ?? '';
    const last = this.loyaltyMemberDetails.lastName?.trim() ?? '';
    return `${first} ${last}`.trim();
  }

  protected get memberEmail(): string {
    if (!this.hasMembership || !this.loyaltyMemberDetails) return '';
    return this.loyaltyMemberDetails.emailAddress?.trim() ?? '';
  }

  protected get memberNumber(): string {
    if (!this.hasMembership || !this.loyaltyMemberDetails) return '';
    return this.loyaltyMemberDetails.memberNo?.trim() ?? '';
  }

  protected toggleFlip(): void {
    if (!this.hasMembership) return;
    this.isFlipped = !this.isFlipped;
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (!this.hasMembership) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleFlip();
    }
  }
}