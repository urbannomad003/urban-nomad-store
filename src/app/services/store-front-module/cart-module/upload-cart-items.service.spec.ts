import { TestBed } from '@angular/core/testing';

import { UploadCartItemsService } from './upload-cart-items.service';

describe('UploadCartItemsService', () => {
  let service: UploadCartItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UploadCartItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
