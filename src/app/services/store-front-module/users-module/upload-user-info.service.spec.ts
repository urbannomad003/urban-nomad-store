import { TestBed } from '@angular/core/testing';

import { UploadUserInfoService } from './upload-user-info.service';

describe('UploadUserInfoService', () => {
  let service: UploadUserInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UploadUserInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
