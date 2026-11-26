import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { UnUserModel } from '../../../models/store-front-module/user-info/un-user.model';

@Injectable({
  providedIn: 'root',
})
export class RetrieveUserInfoService {
  private firestore = inject(Firestore);

  async getUserProfile(userId: string): Promise<UnUserModel | null> {
    const userRef = doc(this.firestore, `users/${userId}`);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return null;
    }

    return snap.data() as UnUserModel;
  }
}