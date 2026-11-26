import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedProductsOnSale } from './featured-products-on-sale';

describe('FeaturedProductsOnSale', () => {
  let component: FeaturedProductsOnSale;
  let fixture: ComponentFixture<FeaturedProductsOnSale>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedProductsOnSale]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedProductsOnSale);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
