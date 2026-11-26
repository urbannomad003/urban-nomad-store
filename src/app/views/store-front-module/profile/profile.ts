import { Component, signal } from '@angular/core';
import { AccountDetails } from '../../../components/store-front-module/profile-module/profile-details/account-details/account-details';
import { AccountManagement } from '../../../components/store-front-module/profile-module/profile-details/account-management/account-management';
import { AddressBook } from '../../../components/store-front-module/profile-module/profile-details/address-book/address-book';
import { Logout } from '../../../components/store-front-module/profile-module/profile-details/logout/logout';
import { Security } from '../../../components/store-front-module/profile-module/profile-details/security/security';
import {
  ProfileItems,
  ProfileSection,
} from '../../../components/store-front-module/profile-module/profile-items/profile-items';

export type { ProfileSection };

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ProfileItems,
    AccountDetails,
    AccountManagement,
    AddressBook,
    Security,
    Logout,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  activeSection = signal<ProfileSection>('account-details');

  selectSection(section: ProfileSection): void {
    this.activeSection.set(section);
  }
}