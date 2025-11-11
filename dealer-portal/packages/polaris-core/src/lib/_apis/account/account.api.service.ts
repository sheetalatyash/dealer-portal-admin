import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { GetAccountsOperation, GetAccountsVariables, GetAccountsByFileOperation } from './_classes';
import { EndpointConfig, Environment, ENVIRONMENT_CONFIG } from '../../_types';
import { GetAccountsResponse, GetAccountsByFileResponse } from './_types';
import { Observable } from 'rxjs';
import { BaseGraphQLApiService } from '../base-graphql-api-service';
import { StandardResponse } from '../standard-response.class';
import { ACCOUNT_API } from '../api-constants';
import { LoggerService } from '../../_services';

@Injectable({
  providedIn: 'root',
})
export class AccountApiService extends BaseGraphQLApiService {
  private readonly _accountApiUrl: string;

  static override readonly API_NAME: string = ACCOUNT_API;

  constructor(
    @Inject(ENVIRONMENT_CONFIG) environment: Environment,
    readonly _http: HttpClient,
    loggerService: LoggerService,
  ) {
    const endpointConfig: EndpointConfig = environment.endpoints[AccountApiService.API_NAME];
    super(endpointConfig, _http, loggerService);
    this._accountApiUrl = endpointConfig.baseUrl;
  }

  public getAccounts$(options: GetAccountsVariables): Observable<StandardResponse<GetAccountsResponse>> {
    const operation: GetAccountsOperation = new GetAccountsOperation(options);
    return this.executeOperation(`${this._accountApiUrl}graphql`, operation);
  }

  public getAccountsByFile$(accountsFile: File): Observable<StandardResponse<GetAccountsByFileResponse>> {
    const operation: GetAccountsByFileOperation = new GetAccountsByFileOperation({ file: accountsFile });
    return this.executeOperation(`${this._accountApiUrl}graphql`, operation);
  }
}
