import { TestBed } from '@angular/core/testing';

import { RetrieveCartItemsService } from './retrieve-cart-items.service';

describe('RetrieveCartItemsService', () => {
  let service: RetrieveCartItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetrieveCartItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
