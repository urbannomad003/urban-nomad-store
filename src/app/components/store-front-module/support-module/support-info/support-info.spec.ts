import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportInfo } from './support-info';

describe('SupportInfo', () => {
  let component: SupportInfo;
  let fixture: ComponentFixture<SupportInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
