import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCatalogueListWidget } from './product-catalogue-list-widget';

describe('ProductCatalogueListWidget', () => {
  let component: ProductCatalogueListWidget;
  let fixture: ComponentFixture<ProductCatalogueListWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCatalogueListWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCatalogueListWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
