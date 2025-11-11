import { TestBed } from '@angular/core/testing';
import { MockInstance, ngMocks } from 'ng-mocks';
import { DealerPortalService } from './dealer-portal.service';

describe('DealerPortalService', () => {
  MockInstance.scope('suite');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DealerPortalService],
    });
  });

  afterEach(() => ngMocks.flushTestBed());

  it('Construct service', () => {
    // Act
    const repository = TestBed.inject(DealerPortalService);

    // Assert
    expect(repository).toBeTruthy();
  });
});
