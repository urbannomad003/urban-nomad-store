import { TestBed } from '@angular/core/testing';

import { StorefrontProductsService } from './storefront-products.service';

describe('StorefrontProductsService', () => {
  let service: StorefrontProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorefrontProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
