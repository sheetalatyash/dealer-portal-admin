import { TestBed } from '@angular/core/testing';
import { MockInstance, ngMocks } from 'ng-mocks';
import { SalesAccountService } from './sales-account.service';

describe('AccountService', () => {
  MockInstance.scope('suite');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SalesAccountService],
    });
  });

  afterEach(() => ngMocks.flushTestBed());

  it('Construct service', () => {
    // Act
    const repository = TestBed.inject(SalesAccountService);

    // Assert
    expect(repository).toBeTruthy();
  });
});
