import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT_CONFIG } from '../../_types';
import { UserInfoManagementApiService } from './userInfo-management.api.service';
import { QueryDefinition } from '.';
import { PagingWithQueryContinuationResponse } from '.';
import { BaseUserInfo } from './_schemas/base-user-info.class';
import { provideHttpClient } from '@angular/common/http';
import { StandardResponse } from '../standard-response.class';
import { firstValueFrom } from 'rxjs';

describe('UserInfoManagementApiService', () => {
  let service: UserInfoManagementApiService;
  let httpMock: HttpTestingController;
  const environment = {
    endpoints: {
      userInfoApiUrl: 'https://api-userinfo-unit-test.polarisportal.com/',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserInfoManagementApiService,
        { provide: ENVIRONMENT_CONFIG, useValue: environment },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UserInfoManagementApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchUserInfo$', () => {
    it('should search user info with a POST to the search endpoint', async () => {
      // Arrange
      const queryDefinition: QueryDefinition = new QueryDefinition({});
      const mockResponse: PagingWithQueryContinuationResponse<BaseUserInfo<any>> = {
        data: [],
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
      };
      const expected: StandardResponse<PagingWithQueryContinuationResponse<BaseUserInfo<any>>> = new StandardResponse({
        data: mockResponse,
        success: true,
      });

      // Act
      const searchPromise = firstValueFrom(service.searchUserInfo$<any>(queryDefinition));
      const req = httpMock.expectOne(`${environment.endpoints.userInfoApiUrl}api/UserInfoMgmt/search`);
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(queryDefinition);
      expect(await searchPromise).toEqual(expected);
    });
  });
});
