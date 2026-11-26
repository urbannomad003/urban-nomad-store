import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltyMembershipInfo } from './loyalty-membership-info';

describe('LoyaltyMembershipInfo', () => {
  let component: LoyaltyMembershipInfo;
  let fixture: ComponentFixture<LoyaltyMembershipInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyMembershipInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoyaltyMembershipInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
