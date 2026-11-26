import { TestBed } from '@angular/core/testing';

import { RetrieveNotificationsService } from './retrieve-notifications.service';

describe('RetrieveNotificationsService', () => {
  let service: RetrieveNotificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetrieveNotificationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
