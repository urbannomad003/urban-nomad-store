import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerMain } from './banner-main';

describe('BannerMain', () => {
  let component: BannerMain;
  let fixture: ComponentFixture<BannerMain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerMain]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannerMain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
