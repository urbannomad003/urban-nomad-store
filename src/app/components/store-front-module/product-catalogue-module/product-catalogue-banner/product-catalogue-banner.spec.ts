import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCatalogueBanner } from './product-catalogue-banner';

describe('ProductCatalogueBanner', () => {
  let component: ProductCatalogueBanner;
  let fixture: ComponentFixture<ProductCatalogueBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCatalogueBanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCatalogueBanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
