import { TestBed } from '@angular/core/testing';

import { PolarisDialogService } from './polaris-dialog.service';

describe('PolarisDialogService', () => {
  let service: PolarisDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolarisDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
