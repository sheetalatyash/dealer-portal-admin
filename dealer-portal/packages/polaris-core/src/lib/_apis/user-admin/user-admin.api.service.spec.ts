import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserAdminApiService } from './user-admin.api.service';
import { ENVIRONMENT_CONFIG } from '../../_types';
import { AccountUserResponse } from './_models';
import { StandardResponse } from '../standard-response.class';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

describe('UserAdminApiService', () => {
  let service: UserAdminApiService;
  let httpMock: HttpTestingController;
  const environment = {
    endpoints: {
      userAdminApiUrl: 'https://api-opti-unit-test.polarisportal.com/',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserAdminApiService,
        { provide: ENVIRONMENT_CONFIG, useValue: environment },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UserAdminApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAdminUser$', () => {
    it('should send a GET request to retrieve the admin user for a given account number', async () => {
      // Arrange
      const accountNumber = '12345';
      const mockResponse: AccountUserResponse = {
        active:true,
        admin: true,
        dealers: [{
          dealerId: "dealerIdString",
          dealerName: "dealerNameString",
          systemId: "systemIdString"
        }],
        departmentString: 'departmentString',
        emailAddress: 'emailAddress',
        employeeStatusCode: 1234,
        employmentTypeString: 'employmentTypeString',
        firstName: 'firstName',
        isPrimaryCommunicationContact: true,
        lastName: 'lastName',
        pointsEligible: true,
        portalAuthenticationId: 'portalAuthenticationId',
        roleString: 'roleString',
        spiffEligible: true,

      };
      const expected: StandardResponse<AccountUserResponse> = new StandardResponse<AccountUserResponse>({
        data: mockResponse,
        success: true,
      });

      // Act
      const adminUserPromise = firstValueFrom(service.getAdminUser$(accountNumber));
      const req = httpMock.expectOne(`${environment.endpoints.userAdminApiUrl}accounts/${accountNumber}/admin-user`);
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('GET');
      expect(await adminUserPromise).toEqual(expected);
    });
  });

  describe('getUsers$', () => {
    it('should send a GET request to retrieve users for a given account number', async () => {
      // Arrange
      const accountNumber = '12345';
      const onlyActive = true;
      const mockResponse: AccountUserResponse[] = [/* mock response data */];
      const expected: StandardResponse<AccountUserResponse[]> = new StandardResponse<AccountUserResponse[]>({
        data: mockResponse,
        success: true,
      });

      // Act
      const usersPromise: Promise<StandardResponse<AccountUserResponse[]>> = firstValueFrom(service.getUsers$(accountNumber, {onlyActive}));
      const req = httpMock.expectOne(`${environment.endpoints.userAdminApiUrl}accounts/${accountNumber}/users?onlyActive=${onlyActive}`);
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('GET');
      expect(await usersPromise).toEqual(expected);
    });
  });
});
