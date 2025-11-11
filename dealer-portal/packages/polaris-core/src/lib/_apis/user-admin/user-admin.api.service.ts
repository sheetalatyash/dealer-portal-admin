import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ENVIRONMENT_CONFIG, EndpointConfig, Environment } from '../../_types';
import { BaseApiService, StandardResponse } from '..';
import { AccountUserResponse, DealerEmployeeDict } from './_models';
import { GetUsersOptions } from './_types';
import { USER_ADMIN_API } from '../api-constants';
import { LoggerService } from '../../_services';

/**
 * Service for interacting with the User Admin API.
 *
 * @remarks
 * This service provides methods to retrieve admin user and user information
 * from the User Admin API.
 *
 * @example
 * ```typescript
 * constructor(private userAdminApiService: UserAdminApiService) {}
 *
 * this.userAdminApiService.getAdminUser$('12345').subscribe(response => {
 *   console.log(response);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class UserAdminApiService extends BaseApiService {
  /**
   * URL for retrieving accounts.
   *
   * @private
   */
  private readonly _getAccountsUrl: string = '';

  static override readonly API_NAME: string = USER_ADMIN_API;

  /**
   * Initializes a new instance of the UserAdminApiService class.
   *
   * @param environment - The environment configuration.
   * @param _http - The HTTP client.
   */
  constructor(@Inject(ENVIRONMENT_CONFIG) environment: Environment, _http: HttpClient, loggerService: LoggerService) {
    const endpointConfig: EndpointConfig = environment.endpoints[UserAdminApiService.API_NAME];
    super(endpointConfig, _http, loggerService);
    this._getAccountsUrl = `${endpointConfig.baseUrl}accounts/`;
  }

  /**
   * Retrieves the admin user for a given account number.
   *
   * @param accountNumber - The account number to retrieve the admin user for.
   * @returns An observable of the standard response containing the admin user information.
   */
  public getAdminUser$(accountNumber?: string): Observable<StandardResponse<AccountUserResponse>> {
    return this.get<AccountUserResponse>(`${this._getAccountsUrl}${accountNumber}/admin-user`);
  }

  /**
   * TODO (3/31/25): This is a placeholder function.
   * Due to limitations of the DealerEmployee API, fetching account status is delayed until we import the employee data from CRM.
   *
   * Retrieves users by their email addresses for given dealer IDs.
   *
   * @param accountEmails - A dictionary mapping dealer IDs to lists of email addresses.
   * @returns An observable of the standard response containing the user information.
   */
  public getUsersByEmail$(accountEmails: DealerEmployeeDict): Observable<StandardResponse<AccountUserResponse[]>> {
    const accountUserResponses: AccountUserResponse[] = [];

    for (const dealerId in accountEmails) {
      if (accountEmails.hasOwnProperty(dealerId)) {
        const emails = accountEmails[dealerId];
        emails.forEach((email) => {
          accountUserResponses.push({
            active: true,
            emailAddress: email,
            dealers: [
              {
                dealerName: crypto.randomUUID(),
                dealerId,
              },
            ],
          } as AccountUserResponse);
        });
      }
    }

    return of({ data: accountUserResponses } as StandardResponse<AccountUserResponse[]>);
  }

  /**
   * Retrieves the users for a given account number.
   *
   * @param accountNumber - The account number to retrieve users for.
   * @param onlyActive - Whether to retrieve only active users. Defaults to true.
   * @returns An observable of the standard response containing the user information.
   */
  /**
   * Retrieves the users for a given account number with options.
   *
   * @param accountNumber - The account number to retrieve users for.
   * @param options - Options to filter users (onlyActive, onlyInactive).
   * @returns An observable of the standard response containing the user information.
   */
  public getUsers$(
    accountNumber: string,
    options: GetUsersOptions = { onlyActive: true },
  ): Observable<StandardResponse<AccountUserResponse[]>> {
    const url: string = `${this._getAccountsUrl}${accountNumber}/users`;
    const params: Record<string, boolean> = {};
    if (options.onlyActive !== undefined) {
      params['onlyActive'] = options.onlyActive;
    }
    if (options.onlyInactive !== undefined) {
      params['onlyInactive'] = options.onlyInactive;
    }
    return this.get<AccountUserResponse[]>(url, { params });
  }
}
