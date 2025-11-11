import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { PaginationResponseEntity } from './pagination-response-entity.type';
import { PaginationResponse } from './pagination-response.class';
import { StandardResponse } from './standard-response.class';
import { EndpointConfig } from '../_types';
import { LoggerService } from '../_services';

export abstract class BaseApiService {
  static API_NAME: string = '';

  constructor(
    private _endpointConfig: EndpointConfig,
    private _httpClient: HttpClient,
    private _loggerService: LoggerService,
  ) {
    if (!_endpointConfig) {
      // Endpoint Configuration must be defined
      const error = `Endpoint configuration for ${(<typeof BaseApiService>(
        this.constructor
      )).API_NAME.toUpperCase()} API is missing.`;
      // Log as a critical error as the service cannot function without it
      this._loggerService.logCritical(error);
      // Throw and error to prevent further execution
      throw new Error(error);
    }
  }

  /**
   * Creates HttpParams from an object.
   * @param params - The parameters to be converted to HttpParams.
   * @returns HttpParams object.
   */
  protected createParams(params: { [key: string]: any }): HttpParams {
    let httpParams: HttpParams = new HttpParams();

    Object.keys(params).forEach((key: string): void => {
      if (Array.isArray(params[key])) {
        params[key].forEach((value: string): void => {
          httpParams = httpParams.append(key, value);
        });
      } else {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return httpParams;
  }

  /**
   * Creates HttpHeaders for requests
   * @param additionalHeaders Additional headers to include.
   * @returns HttpHeaders instance.
   */
  protected createHeaders(
    additionalHeaders: { [key: string]: string | number | (string | number)[] } = {},
  ): HttpHeaders {
    let headers: HttpHeaders = new HttpHeaders(additionalHeaders);

    if (this._endpointConfig.apimSubscriptionKey) {
      headers = headers.set('Ocp-Apim-Subscription-Key', this._endpointConfig.apimSubscriptionKey);
    }

    return headers;
  }

  /**
   * Handles the API response and wraps it in a StandardResponse.
   * @param response - The response from the API.
   * @returns StandardResponse object containing the response data.
   */
  protected handleResponse<R>(response: any): StandardResponse<R> {
    return new StandardResponse<R>({ data: response, success: true });
  }

  /**
   * Handles errors from the API and wraps them in a StandardResponse.
   * @param error - The error thrown by the API.
   * @returns Observable of StandardResponse containing the error.
   */
  protected handleError<R>(error: Error): Observable<StandardResponse<R>> {
    return of(new StandardResponse<R>({ error, success: false }));
  }

  /**
   * Handles the pagination API response and wraps it in a PaginationResponse.
   * @param response - The pagination response from the API.
   * @returns PaginationResponse object containing the response data.
   */
  protected handlePaginationResponse<R>(response: any): PaginationResponse<R> {
    return new PaginationResponse<R>({ ...response, success: true });
  }

  /**
   * Handles pagination errors from the API and wraps them in a PaginationResponse.
   * @param error - The error thrown by the API.
   * @returns Observable of PaginationResponse containing the error.
   */
  protected handlePaginationError<R>(error: Error): Observable<PaginationResponse<R>> {
    return of(new PaginationResponse<R>({ error, success: false }));
  }

  /**
   * Makes a GET request to the specified URL.
   * @param url Endpoint URL.
   * @param options Optional params and headers.
   * @returns Observable of StandardResponse.
   */
  get<T>(
    url: string,
    options: {
      params?: { [key: string]: any };
      headers?: { [key: string]: string | number | (string | number)[] };
    } = {},
  ): Observable<StandardResponse<T>> {
    const params: HttpParams = this.createParams(options.params ?? {});
    const headers: HttpHeaders = this.createHeaders(options.headers ?? {});

    return this._httpClient.get<T>(url, { params, headers }).pipe(
      map((response: T) => this.handleResponse<T>(response)),
      catchError(this.handleError<T>),
    );
  }

  /**
   * Makes a POST request to the specified URL.
   * @param url Endpoint URL.
   * @param body Request body.
   * @param options Optional params and headers.
   * @returns Observable of StandardResponse.
   */
  post<T>(
    url: string,
    body: any,
    options: {
      params?: { [key: string]: any };
      headers?: { [key: string]: string | number | (string | number)[] };
    } = {},
  ): Observable<StandardResponse<T>> {
    const params: HttpParams = this.createParams(options.params ?? {});
    const headers: HttpHeaders = this.createHeaders(options.headers ?? {});

    return this._httpClient.post<T>(url, body, { params, headers }).pipe(
      map((response: T) => this.handleResponse<T>(response)),
      catchError(this.handleError<T>),
    );
  }

  /**
   * Makes a PUT request to the specified URL.
   * @param url Endpoint URL.
   * @param body Request body.
   * @param options Optional params and headers.
   * @returns Observable of StandardResponse.
   */
  put<T>(
    url: string,
    body: any,
    options: {
      params?: { [key: string]: any };
      headers?: { [key: string]: string | number | (string | number)[] };
    } = {},
  ): Observable<StandardResponse<T>> {
    const params: HttpParams = this.createParams(options.params ?? {});
    const headers: HttpHeaders = this.createHeaders(options.headers ?? {});

    return this._httpClient.put<T>(url, body, { params, headers }).pipe(
      map((response: T): StandardResponse<T> => this.handleResponse<T>(response)),
      catchError(this.handleError<T>),
    );
  }

  /**
   * Makes a PATCH request to the specified URL.
   * @param url Endpoint URL.
   * @param body Request body.
   * @param options Optional params and headers.
   * @returns Observable of StandardResponse.
   */
  public patch<T>(
    url: string,
    body: unknown,
    options: {
      params?: { [key: string]: any };
      headers?: { [key: string]: string | number | (string | number)[] };
    } = {},
  ): Observable<StandardResponse<T>> {
    const params: HttpParams = this.createParams(options.params ?? {});
    const headers: HttpHeaders = this.createHeaders(options.headers ?? {});

    return this._httpClient.patch<T>(url, body, { params, headers }).pipe(
      map((response: T): StandardResponse<T> => this.handleResponse<T>(response)),
      catchError(this.handleError<T>),
    );
  }

  /**
   * Makes a DELETE request to the specified URL.
   * @param url Endpoint URL.
   * @param options Optional params and headers.
   * @param body Optional request body.
   * @returns Observable of StandardResponse.
   */
  public delete<T>(
    url: string,
    options: {
      params?: { [key: string]: any };
      headers?: { [key: string]: string | number | (string | number)[] };
    } = {},
    body?: any,
  ): Observable<StandardResponse<T>> {
    const params: HttpParams = this.createParams(options.params ?? {});
    const headers: HttpHeaders = this.createHeaders(options.headers ?? {});

    return this._httpClient.delete<T>(url, { params, body, headers }).pipe(
      map((response: T) => this.handleResponse<T>(response)),
      catchError(this.handleError<T>),
    );
  }

  /**
   * Makes a GET request with pagination parameters.
   * @param url Endpoint URL.
   * @param pageNumber Page number for pagination.
   * @param pageSize Page size for pagination.
   * @param options Optional params and headers.
   * @returns Observable of PaginationResponse.
   */
  public getPaginated<T>(
    url: string,
    pageNumber: number,
    pageSize: number,
    options: {
      params?: { [key: string]: any };
      headers?: { [key: string]: string | number | (string | number)[] };
    } = {},
  ): Observable<PaginationResponse<T>> {
    const params: HttpParams = this.createParams({ ...options.params, pageNumber, pageSize });
    const headers: HttpHeaders = this.createHeaders(options.headers ?? {});

    return this._httpClient
      .get<PaginationResponseEntity<T>>(url, { params, headers })
      .pipe(map(this.handlePaginationResponse<T>), catchError(this.handlePaginationError<T>));
  }
}
