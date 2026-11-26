import { TestBed } from '@angular/core/testing';

import { UploadWishlistItemsService } from './upload-wishlist-items.service';

describe('UploadWishlistItemsService', () => {
  let service: UploadWishlistItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UploadWishlistItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
