import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { StandardResponse } from '../standard-response.class';
import {
  GraphQLError,
  GraphQLOperation,
  GraphQLFileOperation,
  GraphQLResponse,
  GraphQLVariables,
} from './base-graphql-api.service.types';
import { EndpointConfig } from '../../_types';
import { LoggerService } from '../../_services';

export abstract class BaseGraphQLApiService {
  static API_NAME: string = '';

  constructor(
    private _endpointConfig: EndpointConfig,
    private _httpClient: HttpClient,
    private _loggerService: LoggerService,
  ) {
    if (!_endpointConfig) {
      // Endpoint Configuration must be defined
      const error = `Endpoint configuration for ${(<typeof BaseGraphQLApiService>(
        this.constructor
      )).API_NAME.toUpperCase()} API is missing.`;
      // Log as a critical error as the service cannot function without it
      this._loggerService.logCritical(error);
      // Throw and error to prevent further execution
      throw new Error(error);
    }
  }

  /**
   * Creates HttpHeaders from an object.
   * @param additionalHeaders - The headers to be added to the request.
   * @returns HttpHeaders object.
   */
  protected createHeaders(
    additionalHeaders: { [key: string]: string | number | (string | number)[] } = {},
  ): HttpHeaders {
    // Use recommended GraphQL Accept header and fallback to application/json
    const defaultHeaders: { [key: string]: string | number | (string | number)[] } = {
      Accept: 'application/graphql-response+json, application/json',
    };

    let headers = new HttpHeaders({ ...defaultHeaders, ...additionalHeaders });

    if (this._endpointConfig.apimSubscriptionKey) {
      headers = headers.set('Ocp-Apim-Subscription-Key', this._endpointConfig.apimSubscriptionKey);
    }

    return headers;
  }

  /**
   * Handles the Graph API response and wraps it in a StandardResponse.
   * If GraphQL errors are present, wraps them in a GraphQLError.
   * Returns both data and error if both are present.
   */
  protected handleResponse<R>(response: GraphQLResponse<R>): StandardResponse<R> {
    const data = response?.data;
    if (response?.errors?.length) {
      const graphQLError = new GraphQLError(response.errors[0]?.message || 'GraphQL error', response.errors);
      return new StandardResponse<R>({ data, error: graphQLError, success: false });
    }
    return new StandardResponse<R>({ data, success: true });
  }

  /**
   * Handles non-GraphQL errors and wraps them in a StandardResponse.
   */
  protected handleError<R>(error: Error): Observable<StandardResponse<R>> {
    return of(new StandardResponse<R>({ error, success: false }));
  }

  /**
   * Executes a Graph API query.
   * @note Prefer using executeOperation for type safety and maintainability over direct use of executeQuery or executeMutation.
   * @param url - The Graph API endpoint URL.
   * @param query - The GraphQL query string.
   * @param variables - Optional variables for the GraphQL query.
   * @param options - Optional object containing headers.
   * @returns Observable of StandardResponse containing the response data.
   */
  executeQuery<T>(
    url: string,
    query: string,
    variables?: GraphQLVariables,
    options?: { headers?: { [key: string]: string | number | (string | number)[] } },
  ): Observable<StandardResponse<T>> {
    const body = {
      query,
      variables,
    };
    const headers = this.createHeaders({
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    });
    return this._httpClient.post<GraphQLResponse<T>>(url, body, { headers }).pipe(
      map((response: any) => this.handleResponse<T>(response)),
      catchError((error) => this.handleError<T>(error)),
    );
  }

  /**
   * Executes a Graph API mutation.
   * @note Prefer using executeOperation for type safety and maintainability over direct use of executeMutation or executeQuery.
   * @param url - The Graph API endpoint URL.
   * @param mutation - The GraphQL mutation string.
   * @param variables - Optional variables for the GraphQL mutation.
   * @param options - Optional object containing headers.
   * @returns Observable of StandardResponse containing the response data.
   */
  executeMutation<T>(
    url: string,
    mutation: string,
    variables?: GraphQLVariables,
    options?: { headers?: { [key: string]: string | number | (string | number)[] } },
  ): Observable<StandardResponse<T>> {
    return this.executeQuery<T>(url, mutation, variables, options);
  }

  /**
   * Executes a GraphQL file upload operation (multipart/form-data).
   */
  private executeFileOperation<T>(
    url: string,
    operation: GraphQLFileOperation<any, T>,
    options?: { headers?: { [key: string]: string | number | (string | number)[] } },
  ): Observable<StandardResponse<T>> {
    const formData = operation.toFormData();
    const uploadHeaders = this.createHeaders({
      'GraphQL-preflight': '1',
      'X-Skip-Content-Type': 'true',
      ...(options?.headers || {}),
    });
    return this._httpClient.post<GraphQLResponse<T>>(url, formData, { headers: uploadHeaders }).pipe(
      map((response: any) => this.handleResponse<T>(response)),
      catchError((error) => this.handleError<T>(error)),
    );
  }

  /**
   * Executes a GraphQLOperation and enforces type safety between variables and response.
   * This is the preferred method of interacting with GraphQL operations for type safety.
   * @param url - The Graph API endpoint URL.
   * @param operation - The GraphQLOperation instance.
   * @param options - Optional object containing headers.
   * @returns Observable of StandardResponse containing the response data.
   */
  executeOperation<V extends GraphQLVariables | undefined, R>(
    url: string,
    operation: GraphQLOperation<V, R>,
    options?: { headers?: { [key: string]: string | number | (string | number)[] } },
  ): Observable<StandardResponse<R>> {
    const isFileMutation = operation instanceof GraphQLFileOperation;
    if (isFileMutation) {
      return this.executeFileOperation<R>(url, operation as GraphQLFileOperation<any, R>, options);
    }

    const isMutation = operation.query.trim().startsWith('mutation');
    if (isMutation) {
      return this.executeMutation<R>(url, operation.query, operation.variables as any, options);
    }

    return this.executeQuery<R>(url, operation.query, operation.variables, options);
  }
}
