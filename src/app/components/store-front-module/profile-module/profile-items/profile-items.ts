import { Component, input, output } from '@angular/core';

export type ProfileSection =
  | 'account-details'
  | 'account-management'
  | 'address-book'
  | 'security'
  | 'logout';

interface ProfileNavItem {
  id: ProfileSection;
  label: string;
}

@Component({
  selector: 'app-profile-items',
  standalone: true,
  templateUrl: './profile-items.html',
  styleUrl: './profile-items.css',
})
export class ProfileItems {
  activeSection = input<ProfileSection>('account-details');
  sectionSelected = output<ProfileSection>();

  items: ProfileNavItem[] = [
    { id: 'account-details', label: 'Account Details' },
    { id: 'account-management', label: 'Account Management' },
    { id: 'address-book', label: 'Address Book' },
    { id: 'security', label: 'Security' },
    { id: 'logout', label: 'Log Out' },
  ];

  onSelect(section: ProfileSection): void {
    this.sectionSelected.emit(section);
  }
}