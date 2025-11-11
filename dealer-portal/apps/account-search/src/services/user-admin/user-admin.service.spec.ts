import { TestBed } from '@angular/core/testing';
import { MockInstance, ngMocks } from 'ng-mocks';
import { UserAdminService } from './user-admin.service';

describe('AccountService', () => {
  MockInstance.scope('suite');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserAdminService],
    });
  });

  afterEach(() => ngMocks.flushTestBed());

  it('Construct service', () => {
    // Act
    const repository = TestBed.inject(UserAdminService);

    // Assert
    expect(repository).toBeTruthy();
  });
});
