import { TestBed } from '@angular/core/testing';

import { RetrieveWishlistItemsService } from './retrieve-wishlist-items.service';

describe('RetrieveWishlistItemsService', () => {
  let service: RetrieveWishlistItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetrieveWishlistItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
