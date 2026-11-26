import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerPromotional } from './banner-promotional';

describe('BannerPromotional', () => {
  let component: BannerPromotional;
  let fixture: ComponentFixture<BannerPromotional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerPromotional]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannerPromotional);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
