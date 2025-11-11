import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BaseApiService } from './base-api.service';
import { StandardResponse, PaginationResponse } from './';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

describe('BaseApiService', () => {
  let service: BaseApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BaseApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BaseApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createParams', () => {
    it('should create HttpParams from an object', () => {
      const params = { param1: 'value1', param2: 'value2' };
      const httpParams = service['createParams'](params);
      expect(httpParams.get('param1')).toBe('value1');
      expect(httpParams.get('param2')).toBe('value2');
    });

    it('should create HttpParams from an object with array values', () => {
      const params = { param1: ['value1', 'value2'], param2: 'value3' };
      const httpParams = service['createParams'](params);
      expect(httpParams.getAll('param1')).toEqual(['value1', 'value2']);
      expect(httpParams.get('param2')).toBe('value3');
    });
  });

  describe('handleResponse', () => {
    it('should wrap response in StandardResponse', () => {
      const response = { data: 'test' };
      const result = service['handleResponse'](response);
      expect(result).toEqual(new StandardResponse({ data: response, success: true }));
    });
  });

  describe('handleError', () => {
    it('should wrap error in StandardResponse', () => {
      const error = new Error('test error');
      service['handleError']<any>(error).subscribe((result) => {
        expect(result).toEqual(new StandardResponse({ error, success: false }));
      });
    });
  });

  describe('handlePaginationError', () => {
    it('should wrap error in PaginationResponse', () => {
      const error = new Error('test error');
      service['handlePaginationError']<any>(error).subscribe((result) => {
        expect(result).toEqual(new PaginationResponse({ error, success: false }));
      });
    });
  });

  describe('get', () => {
    it('should make a GET request and return StandardResponse', async () => {
      // Arrange
      const mockResponse = { data: 'test' };
      const expected = new StandardResponse({ data: mockResponse, success: true });

      // Act
      const responsePromise = firstValueFrom(service.get<string>('test-url'));
      const req = httpMock.expectOne('test-url');
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('GET');
      expect(await responsePromise).toEqual(expected);
    });

    it('should handle error in GET request', async () => {
      // Arrange
      const mockError = { message: 'Network error' };

      // Act
      const responsePromise = firstValueFrom(service.get<string>('test-url'));
      const req = httpMock.expectOne('test-url');
      req.flush(mockError, { status: 500, statusText: 'Server Error' });

      // Assert
      const response = await responsePromise;
      expect(response.success).toBe(false);
    });
  });

  describe('post', () => {
    it('should make a POST request and return StandardResponse', async () => {
      // Arrange
      const mockResponse = { data: 'test' };
      const expected = new StandardResponse({ data: mockResponse, success: true });

      // Act
      const responsePromise = firstValueFrom(service.post<string>('test-url', { key: 'value' }));
      const req = httpMock.expectOne('test-url');
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('POST');
      expect(await responsePromise).toEqual(expected);
    });

    it('should handle error in POST request', async () => {
      // Arrange
      const mockError = { message: 'Network error' };

      // Act
      const responsePromise = firstValueFrom(service.post<string>('test-url', { key: 'value' }));
      const req = httpMock.expectOne('test-url');
      req.flush(mockError, { status: 500, statusText: 'Server Error' });

      // Assert
      const response = await responsePromise;
      expect(response.success).toBe(false);
    });
  });

  describe('put', () => {
    it('should make a PUT request and return StandardResponse', async () => {
      // Arrange
      const mockResponse = { data: 'test' };
      const expected = new StandardResponse({ data: mockResponse, success: true });

      // Act
      const responsePromise = firstValueFrom(service.put<string>('test-url', { key: 'value' }));
      const req = httpMock.expectOne('test-url');
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('PUT');
      expect(await responsePromise).toEqual(expected);
    });

    it('should handle error in PUT request', async () => {
      // Arrange
      const mockError = { message: 'Network error' };

      // Act
      const responsePromise = firstValueFrom(service.put<string>('test-url', { key: 'value' }));
      const req = httpMock.expectOne('test-url');
      req.flush(mockError, { status: 500, statusText: 'Server Error' });

      // Assert
      const response = await responsePromise;
      expect(response.success).toBe(false);
    });
  });

  describe('delete', () => {
    it('should make a DELETE request and return StandardResponse', async () => {
      // Arrange
      const mockResponse = { data: 'test' };
      const expected = new StandardResponse({ data: mockResponse, success: true });

      // Act
      const responsePromise = firstValueFrom(service.delete<string>('test-url'));
      const req = httpMock.expectOne('test-url');
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('DELETE');
      expect(await responsePromise).toEqual(expected);
    });

    it('should handle error in DELETE request', async () => {
      // Arrange
      const mockError = { message: 'Network error' };

      // Act
      const responsePromise = firstValueFrom(service.delete<string>('test-url'));
      const req = httpMock.expectOne('test-url');
      req.flush(mockError, { status: 500, statusText: 'Server Error' });

      // Assert
      const response = await responsePromise;
      expect(response.success).toBe(false);
    });
  });

  describe('getPaginated', () => {
    it('should make a GET request with pagination and return PaginationResponse', async () => {
      // Arrange
      const mockResponse = { data: ['test'], pageNumber: 1, pageSize: 10, totalCount: 100, success: true };
      const expected = new PaginationResponse<string>(mockResponse);

      // Act
      const responsePromise = firstValueFrom(service.getPaginated<string>('test-url', 1, 10));
      const req = httpMock.expectOne(
        (request) => request.url === 'test-url' && request.params.has('pageNumber') && request.params.has('pageSize')
      );
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('GET');
      expect(await responsePromise).toEqual(expected);
    });

    it('should handle error in GET request with pagination', async () => {
      // Arrange
      const mockError = { message: 'Network error' };

      // Act
      const responsePromise = firstValueFrom(service.getPaginated<string>('test-url', 1, 10));
      const req = httpMock.expectOne(
        (request) => request.url === 'test-url' && request.params.has('pageNumber') && request.params.has('pageSize')
      );
      req.flush(mockError, { status: 500, statusText: 'Server Error' });

      // Assert
      const response = await responsePromise;
      expect(response.success).toBe(false);
    });
  });
});
