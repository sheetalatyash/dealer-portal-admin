import { Inject, Injectable } from '@angular/core';
import { BaseApiService, StandardResponse, UserAccountSchema } from '..';
import { HttpClient } from '@angular/common/http';
import { AccessControlLevel } from '../../_enums';
import { EndpointConfig, Environment, ENVIRONMENT_CONFIG } from '../../_types';
import { Observable } from 'rxjs';
import { UserAccount } from './_models/user-account.class';
import { USER_INFO_API } from '../api-constants';
import { LoggerService } from '../../_services';


@Injectable({
  providedIn: 'root',
})
export class UserInfoApiService extends BaseApiService {
  private readonly _userInfoBaseUrl: string = '';
  private readonly _applicationName: string = '';

  static override readonly API_NAME: string = USER_INFO_API;

  /**
   * Initializes a new instance of the `UserInfoApiService` class.
   *
   * @param environment - The environment configuration injected from `ENVIRONMENT_CONFIG`.
   * @param httpClient - The HTTP client used for making API calls.
   */
  constructor(
    @Inject(ENVIRONMENT_CONFIG) environment: Environment,
    httpClient: HttpClient,
    loggerService: LoggerService,
  ) {
    const endpointConfig: EndpointConfig = environment.endpoints[UserInfoApiService.API_NAME];
    super(endpointConfig, httpClient, loggerService);
    this._userInfoBaseUrl = `${endpointConfig.baseUrl}api/UserInfo/`;
    this._applicationName = environment.applicationName;
  }

  public getUserClaims$(): Observable<StandardResponse<UserAccount>> {
    return this.get<UserAccount>(`${this._userInfoBaseUrl}claims`);
  }

  /*
   * Get Access Control Level
   * @returns Observable<StandardResponse<AccessControlLevel>> - Access Control Level, or undefined if error
   *
   * @example
   * this.getAccessControlLevel$().subscribe(accessControlLevel => {})
   */
  public getAccessControlLevel$(): Observable<StandardResponse<AccessControlLevel>> {
    return this.getAccessControlLevelForApplication$(this._applicationName);
  }
  /*
  * Get Access Control Level for Application
  * @param applicationName - Name of the application
  * @returns Observable<StandardResponse<AccessControlLevel>> - Access Control Level, or undefined if error
  * @example
  * this.getAccessControlLevelForApplication$('userAdministration').subscribe(accessControlLevel => {})
  * 
  * Called by getAccessControlLevelForApplication$ in user-info.service.ts.
  *
  * @return Observable<StandardResponse<AccessControlLevel>> - Access Control Level, or undefined if error
  */
  public getAccessControlLevelForApplication$(applicationName: string): Observable<StandardResponse<AccessControlLevel>> {
    return this.get<AccessControlLevel>(`${this._userInfoBaseUrl}useraccess?applicationName=${applicationName}`);
  }

  /*
   * Get User Info
   * @param schema - Schema of the user info
   * @param appendResourceParam - Resource to append to the request
   * @returns Observable<T> - Response of the user info type T
   *
   * @example
   * this.getUserInfo$(Schema.User, 'dealer123').subscribe(userInfo => {})
   */
  public getUserInfo$<T>(
    schema: UserAccountSchema = UserAccountSchema.User,
    resource?: string,
  ): Observable<StandardResponse<T>> {
    const appendResourceParam: string = resource ? `&appendResource=${resource}` : '';
    const endpoint: string = `${this._userInfoBaseUrl}?schemas=${schema}${appendResourceParam}`;

    return this.get<T>(endpoint);
  }
}
