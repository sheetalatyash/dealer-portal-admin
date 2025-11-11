import { TestBed } from '@angular/core/testing';
import { PolarisNotificationService } from './polaris-notification.service';

describe('PolarisNotificationService', () => {
  let service: PolarisNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolarisNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
