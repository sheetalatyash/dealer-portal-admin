import { TestBed } from '@angular/core/testing';
import { User } from '@classes';
import { UserAdministrationApiService, UserAdministrationService } from '@services';
import { MockInstance, ngMocks } from 'ng-mocks';

describe('UserAdministrationService', () => {
  const user: User = new User();
  let userRepositoryMock: UserAdministrationApiService;

  MockInstance.scope('suite');

  beforeEach(() => {
    userRepositoryMock = jasmine.createSpyObj('UserAdministrationRepository', ['getUsers']);
    TestBed.configureTestingModule({
      providers: [UserAdministrationService, { provide: UserAdministrationApiService, useValue: userRepositoryMock }],
    });
  });

  afterEach(() => ngMocks.flushTestBed());

  it('should be created', () => {
    // act
    const service = TestBed.inject(UserAdministrationService);

    // assert
    expect(service).toBeTruthy();
  });






});
