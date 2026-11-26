import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyAccountForm } from './verify-account-form';

describe('VerifyAccountForm', () => {
  let component: VerifyAccountForm;
  let fixture: ComponentFixture<VerifyAccountForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyAccountForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyAccountForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
