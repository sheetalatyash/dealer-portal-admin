import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockInstance, ngMocks } from 'ng-mocks';
import { CoreApiService } from './core.api.service';
import { ENVIRONMENT_CONFIG } from '../../_types';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

describe('CoreApiService', () => {
  MockInstance.scope('suite');
  let service: CoreApiService;
  let httpMock: HttpTestingController;
  const environment = {
    endpoints: {
      coreApiUrl: 'http://test-api.com/',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CoreApiService,
        { provide: ENVIRONMENT_CONFIG, useValue: environment },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CoreApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    ngMocks.flushTestBed();
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCoreData$', () => {
    it('should fetch core data with default options', async () => {
      // Arrange
      const mockResponse = { data: {} }; // Mock response data

      // Act
      const responsePromise = firstValueFrom(service.getCoreData$());
      const req = httpMock.expectOne('http://test-api.com/graphql');
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('POST');

      expect(await responsePromise).toEqual(mockResponse);
    });

    it('should fetch core data with selected options', async () => {
      // Arrange
      const mockResponse = { data: {} }; // Mock response data
      const options = { countries: true, languages: true, partnerTypes: false };

      // Act
      const responsePromise = firstValueFrom(service.getCoreData$(options));
      const req = httpMock.expectOne('http://test-api.com/graphql');
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('POST');

      expect(await responsePromise).toEqual(mockResponse);
    });
  });
});
