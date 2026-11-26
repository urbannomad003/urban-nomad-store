import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedProductsOnSaleListWidget } from './featured-products-on-sale-list-widget';

describe('FeaturedProductsOnSaleListWidget', () => {
  let component: FeaturedProductsOnSaleListWidget;
  let fixture: ComponentFixture<FeaturedProductsOnSaleListWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedProductsOnSaleListWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedProductsOnSaleListWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
