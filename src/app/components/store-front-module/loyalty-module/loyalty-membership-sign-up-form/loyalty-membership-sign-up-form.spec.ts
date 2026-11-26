import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltyMembershipSignUpForm } from './loyalty-membership-sign-up-form';

describe('LoyaltyMembershipSignUpForm', () => {
  let component: LoyaltyMembershipSignUpForm;
  let fixture: ComponentFixture<LoyaltyMembershipSignUpForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyMembershipSignUpForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoyaltyMembershipSignUpForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
