import { Inject, Injectable } from '@angular/core';
import { BaseApiService, StandardResponse } from '..';
import { HttpClient } from '@angular/common/http';
import { EndpointConfig, Environment, ENVIRONMENT_CONFIG } from '../../_types';
import { Observable } from 'rxjs';
import { PagingWithQueryContinuationResponse, QueryDefinition } from '.';
import { BaseUserInfo } from './_schemas/base-user-info.class';
import { USER_INFO_API } from '../api-constants';
import { LoggerService } from '../../_services';

/**
 * Service for managing user information through API calls.
 *
 * @remarks
 * This service extends the `BaseApiService` and provides methods to interact with the user information management API.
 *
 * @example
 * ```typescript
 *   public queryDefinition: QueryDefinition = new QueryDefinition({
      pageNumber: 1,
      pageSize: 10,
      queryByOperator: QueryByOperator.And,
      queryBy: [
        new QueryByFilter(QueryByOperator.And, [
            new QueryByExpression('schema', 'portal.user.internal', QueryByComparison.Equals)
        ]),
        new QueryByFilter(QueryByOperator.Or,[
            new QueryByExpression('claims.userName', '{{searchparm}}', QueryByComparison.Contains),
            new QueryByExpression('claims.email', '{{searchparm}}', QueryByComparison.Contains),
        ])
      ],
      orderBy: [
        new OrderByExpression('claims.userName', OrderByDirection.Descending)
      ]
    });
 *
 * constructor(private userInfoManagementApiService: UserInfoManagementApiService) {}
 *
 * this.userInfoManagementApiService.searchUserInfo$<UserType>(queryDefinition).subscribe(response => {
 *   // Handle the response
 * });
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class UserInfoManagementApiService extends BaseApiService {
  /**
   * The URL for the user information management search endpoint.
   * @private
   */
  private readonly _userInfoManagementSearchUrl: string = '';
  private readonly _userInfoManagementUrl: string = '';

  static override readonly API_NAME: string = USER_INFO_API;

  /**
   * Initializes a new instance of the `UserInfoManagementApiService` class.
   *
   * @param environment - The environment configuration injected from `ENVIRONMENT_CONFIG`.
   * @param httpClient - The HTTP client used for making API calls.
   * @param loggerService - The logger service used for logging API operations.
   */
  constructor(
    @Inject(ENVIRONMENT_CONFIG) environment: Environment,
    httpClient: HttpClient,
    loggerService: LoggerService,
  ) {
    const endpointConfig: EndpointConfig = environment.endpoints[UserInfoManagementApiService.API_NAME];
    super(endpointConfig, httpClient, loggerService);
    this._userInfoManagementUrl = `${endpointConfig.baseUrl}api/UserInfoMgmt`;
    this._userInfoManagementSearchUrl = `${this._userInfoManagementUrl}/search`;
  }

  /**
   * Gets the user permissions URL for a specified account and application.
   *
   * @param accountNumber - The account number for which the user permissions need to be fetched.
   * @param applicationName - The name of the application for which the user permissions need to be fetched.
   */
  private _getUserPermissionsUrl(accountNumber: string, applicationName: string): string {
    return `${this._userInfoManagementUrl}/account/${accountNumber}/application/${applicationName}/usersPermissions`;
  }

  /**
   * Get User Info
   * @param queryParams - Object containing query parameters for the request
   * @returns Observable<T> - Response of the user info type T
   *
   * @example
   * this.getUserInfo$({
   *     schema: 'portal.user.schema',
   *     resource: 'test@polaris-test.com'
   *   }).subscribe(userInfo => {})
   */
  public getUserInfo$<T>(queryParams: Record<string, string>): Observable<StandardResponse<T>> {
    const params = new URLSearchParams(queryParams);
    const endpoint = `${this._userInfoManagementUrl}?${params.toString()}`;

    return this.get<T>(endpoint);
  }

  /**
   * Deletes user info
   *
   * @pathName the optional url pathname
   * @resource the optional querystring params
   * @body the optional body payload to delete
   * @returns An `Observable` of `StandardResponse` containing `BaseUserInfo<T>`.
   */
  public delete$<T>(
    pathName?: string,
    params?: { [key: string]: unknown },
    body?: T,
  ): Observable<StandardResponse<BaseUserInfo<T>>> {

    return this.delete<BaseUserInfo<T>>(`${this._userInfoManagementUrl}${pathName}`, { params }, body);
  }

  /**
   * Searches for user information based on the provided query definition.
   *
   * @template T - The type of user information being searched.
   * @param queryDefinition - The definition of the query to execute.
   * @returns An `Observable` of `StandardResponse` containing a paginated response with query continuation of `BaseUserInfo<T>`.
   */
  public searchUserInfo$<T>(
    queryDefinition: QueryDefinition,
  ): Observable<StandardResponse<PagingWithQueryContinuationResponse<BaseUserInfo<T>>>> {
    return this.post<PagingWithQueryContinuationResponse<BaseUserInfo<T>>>(`${this._userInfoManagementSearchUrl}`, {
      ...queryDefinition,
    });
  }

  /**
   * Updates user information with the provided data and query parameters.
   *
   * @template T - The type of the user information to update.
   * @param body - The user information data to be updated.
   * @returns An `Observable` of `StandardResponse` containing the updated `BaseUserInfo<T>`.
   */
  public updateUserInfo$<T>(body: T): Observable<StandardResponse<void>> {
    return this.post<void>(this._userInfoManagementUrl, body);
  }

  /**
   * Gets the user permissions for a specified account and application.
   *
   * @template T - The type of the user permissions to be retrieved.
   * @param accountNumber - The account number for which the user permissions need to be fetched.
   * @param applicationName - The name of the application for which the user permissions need to be fetched.
   * @returns An `Observable` of `StandardResponse` containing the user permissions of type `T`.
   *
   * @example
   * this.getUserPermissions$<UserPermission>('12345', 'MyApp').subscribe(permissions => {})
   **/
  public getUserPermissions$<T>(accountNumber: string, applicationName: string): Observable<StandardResponse<T[]>> {
    return this.get<T[]>(this._getUserPermissionsUrl(accountNumber, applicationName));
  }
}
