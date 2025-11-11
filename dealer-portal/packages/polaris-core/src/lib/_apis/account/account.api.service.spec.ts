import { TestBed } from '@angular/core/testing';
import { MockInstance, ngMocks } from 'ng-mocks';
import { AccountApiService } from './account.api.service';

describe('AccountApiService', () => {
  MockInstance.scope('suite');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccountApiService],
    });
  });

  afterEach(() => ngMocks.flushTestBed());

  it('Construct service', () => {
    // Act
    const repository = TestBed.inject(AccountApiService);

    // Assert
    expect(repository).toBeTruthy();
  });
});
