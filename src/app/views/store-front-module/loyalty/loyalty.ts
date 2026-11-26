import { Component } from '@angular/core';
import { LoyaltyMembershipInfo } from '../../../components/store-front-module/loyalty-module/loyalty-membership-info/loyalty-membership-info';
import { LoyaltyMembershipSignUpForm } from '../../../components/store-front-module/loyalty-module/loyalty-membership-sign-up-form/loyalty-membership-sign-up-form';

@Component({
  selector: 'app-loyalty',
  imports: [
    LoyaltyMembershipInfo,
    LoyaltyMembershipSignUpForm,
  ],
  templateUrl: './loyalty.html',
  styleUrl: './loyalty.css',
})
export class Loyalty {}