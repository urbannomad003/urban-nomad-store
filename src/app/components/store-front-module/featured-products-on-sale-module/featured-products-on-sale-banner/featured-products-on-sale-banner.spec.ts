import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedProductsOnSaleBanner } from './featured-products-on-sale-banner';

describe('FeaturedProductsOnSaleBanner', () => {
  let component: FeaturedProductsOnSaleBanner;
  let fixture: ComponentFixture<FeaturedProductsOnSaleBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedProductsOnSaleBanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedProductsOnSaleBanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
