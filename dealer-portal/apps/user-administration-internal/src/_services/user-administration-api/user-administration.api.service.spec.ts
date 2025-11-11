import { TestBed } from '@angular/core/testing';
import { User } from '@classes';
import { LoggerService } from '@dealer-portal/polaris-core';
import { MockInstance, ngMocks } from 'ng-mocks';
import { UserAdministrationApiService } from '@services';
import { MockUsers } from './mock-users';
import { take } from 'rxjs';

describe('UserAdministrationRepository', () => {
  const user = {
    DealerNumber: '',
    Name: '',
    FirstName: '',
    LastName: '',
    EmployeeID: '',
    EmailAddress: '',
    BusinessPhoneNumber: '',
    HomePhoneNumber: null,
    CellPhoneNumber: null,
    Service: false,
    SpiffEligible: false,
    Sales: false,
    PointsEligible: false,
    JobTitle: '',
    PortalAuthenticationId: '',
    ContactId: '',
    Msd: [],
    StatusCode: 0,
    StateCode: 0,
    Role: '',
    EmploymentType: '',
    Departments: [],
    ServiceStaffRoles: [],
    Admin: false,
    DepartmentsString: '',
    AdminString: '',
    SpiffEligibleString: '',
    PointsEligibleString: '',
  };
  let loggerServiceMock: jest.Mock<LoggerService>;
  let peopleMock: MockUsers;
  MockInstance.scope('suite');

  beforeEach(() => {
    loggerServiceMock = jasmine.createSpyObj('LoggerService', ['logError']);
    peopleMock = jasmine.createSpyObj('People', ['data']);
    TestBed.configureTestingModule({
      providers: [
        UserAdministrationApiService,
        { provide: LoggerService, useValue: loggerServiceMock },
        { provide: MockUsers, useValue: peopleMock },
      ],
    });
  });

  afterEach(() => ngMocks.flushTestBed());

  it('Construct repository', () => {
    // Act
    const repository = TestBed.inject(UserAdministrationApiService);

    // Assert
    expect(repository).toBeTruthy();
  });

  it('Return empty dataset', () => {
    // arrange
    peopleMock.data = [];

    // act
    const repository = TestBed.inject(UserAdministrationApiService);
    repository
      .getUsers$('')
      .pipe(take(1))
      .subscribe((users: User[]) => {
        expect(users).not.toBeNull();
        expect(users.length).toEqual(0);
      });
  });

  it('getUsers returns one result', () => {
    // arrange
    peopleMock.data = [user];

    // act
    const repository = TestBed.inject(UserAdministrationApiService);
    repository
      .getUsers$('')
      .pipe(take(1))
      .subscribe((users: User[]) => {
        // assert
        expect(users).not.toBeNull();
        expect(users.length).toEqual(1);
      });
  });

  it('getUsers returns two results', () => {
    // arrange
    peopleMock.data = [user, user];

    // act
    const repository = TestBed.inject(UserAdministrationApiService);
    repository
      .getUsers$('')
      .pipe(take(1))
      .subscribe((users: User[]) => {
        // assert
        expect(users).not.toBeNull();
        expect(users.length).toEqual(2);
      });
  });
});
