import { TestBed } from '@angular/core/testing';
import { MockInstance, ngMocks } from 'ng-mocks';
import { AccountFilterService } from './account-filter.service';


describe('AccountFilterService', () => {
  MockInstance.scope('suite');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccountFilterService],
    });
  });

  afterEach(() => ngMocks.flushTestBed());

  it('Construct service', () => {
    // Act
    const repository = TestBed.inject(AccountFilterService);

    // Assert
    expect(repository).toBeTruthy();
  });
});
