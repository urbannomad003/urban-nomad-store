import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, updateDoc, runTransaction } from '@angular/fire/firestore';
import { LoyaltyMemberDetailsModel } from '../../../models/store-front-module/user-info/loyalty-member-details.model';
import { UnUserModel } from '../../../models/store-front-module/user-info/un-user.model';

@Injectable({
  providedIn: 'root',
})
export class UploadUserInfoService {
  private firestore = inject(Firestore);

  async createUserProfile(
    userId: string,
    firstName: string,
    lastName: string,
    emailAddress: string,
  ): Promise<void> {
    const userRef = doc(this.firestore, `users/${userId}`);
    const now = new Date().toISOString();

    const newUser: UnUserModel = {
      userId,
      title: null,
      firstName,
      lastName,
      emailAddress,
      dateOfBirth: null,
      isLoyaltyMember: false,
      loyaltyMemberDetails: null,
      physicalAddress: null,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(userRef, newUser);
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<UnUserModel>,
  ): Promise<void> {
    const userRef = doc(this.firestore, `users/${userId}`);

    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  async registerLoyaltyMember(
    userId: string,
    details: Omit<LoyaltyMemberDetailsModel, 'memberNo'>,
  ): Promise<void> {
    const memberNo = await this.generateMemberNo();

    const loyaltyMemberDetails: LoyaltyMemberDetailsModel = {
      ...details,
      memberNo,
    };

    await this.updateUserProfile(userId, {
      isLoyaltyMember: true,
      loyaltyMemberDetails,
      firstName: details.firstName,
      lastName: details.lastName,
    });
  }

  private async generateMemberNo(): Promise<string> {
    const counterRef = doc(this.firestore, 'system/loyaltyCounter');
    const yearCode = new Date().getFullYear().toString().slice(-3);

    const nextSequence = await runTransaction(this.firestore, async (transaction) => {
      const snap = await transaction.get(counterRef);

      const current = snap.exists()
        ? (snap.data()['currentSequenceNumber'] as number)
        : 1000;

      const next = current + 1;

      transaction.update(counterRef, { currentSequenceNumber: next });

      return next;
    });

    return `UN-${nextSequence}-${yearCode}`;
  }
}