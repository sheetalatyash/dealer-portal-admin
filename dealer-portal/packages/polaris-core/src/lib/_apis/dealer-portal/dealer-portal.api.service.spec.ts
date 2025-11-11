import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DealerPortalApiService } from './dealer-portal.api.service';
import { ENVIRONMENT_CONFIG } from '../../_types';
import { ImpersonateRequest, ImpersonateResponse } from './_models';
import { ImpersonateAdminInternalRequest } from './_models/impersonate-admin-internal-request.class';
import { StandardResponse } from '../standard-response.class';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

describe('DealerPortalApiService', () => {
  let service: DealerPortalApiService;
  let httpMock: HttpTestingController;
  const environment= {
    endpoints: {
      dealerPortalApiUrl: 'https://api-opti-unit-test.polarisportal.com/',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DealerPortalApiService,
        { provide: ENVIRONMENT_CONFIG, useValue: environment },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DealerPortalApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('impersonate$', () => {
    it('should send a POST request to impersonate an account', async () => {
      // Arrange
      const impersonateRequest: ImpersonateRequest = { accountName: 'fakeName', accountNumber: 'fakeNumber', cityState: 'fakeCityState', userName: 'fakeUserName' };
      const mockResponse: ImpersonateResponse = { redirectUrl: 'fakeUrl' };
      const expected: StandardResponse<ImpersonateResponse> = new StandardResponse<ImpersonateResponse>({
        data: mockResponse,
        success: true,
      });

      // Act
      const impersonatePromise = firstValueFrom(service.impersonate$(impersonateRequest));
      const req = httpMock.expectOne(`${environment.endpoints.dealerPortalApiUrl}impersonate`);
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(impersonateRequest);
      expect(await impersonatePromise).toEqual(expected);
    });
  });

  describe('impersonateAdminInternal$', () => {
    it('should send a POST request to impersonate an admin internally', async () => {
      // Arrange
      const impersonateAdminInternalRequest: ImpersonateAdminInternalRequest = { accountName: 'fakeName', accountNumber: 'fakeNumber' };
      const mockResponse: ImpersonateResponse = { redirectUrl: 'fakeUrl' };
      const expected: StandardResponse<ImpersonateResponse> = new StandardResponse<ImpersonateResponse>({
        data: mockResponse,
        success: true,
      });

      // Act
      const impersonateAdminInternalPromise = firstValueFrom(service.impersonateAdminInternal$(impersonateAdminInternalRequest));
      const req = httpMock.expectOne(`${environment.endpoints.dealerPortalApiUrl}impersonate-admin-internal`);
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(impersonateAdminInternalRequest);
      expect(await impersonateAdminInternalPromise).toEqual(expected);
    });
  });
});