import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EndpointConfig, Environment, ENVIRONMENT_CONFIG } from '../../_types';
import {
  GetAccountsForSalesUserOperation,
  GetAccountsForSalesUserVariables,
  GetSalesTerritoriesOperation,
  GetSalesTerritoriesVariables,
  SalesTerritoryFilterInput,
} from './_classes';
import {
  GetAccountsForSalesUserOptions,
  GetAccountsForSalesUserResponse,
  SearchSalesTerritoriesOptions,
} from './_types';
import { GetSalesTerritoriesResponse } from './_types';
import { BaseGraphQLApiService } from '../base-graphql-api-service';
import { StandardResponse } from '../standard-response.class';
import { SALES_HIERARCHY_API } from '../api-constants';
import { LoggerService } from '../../_services';

@Injectable({
  providedIn: 'root',
})
export class SalesHierarchyApiService extends BaseGraphQLApiService {
  private readonly _apiUrl: string;

  static override readonly API_NAME: string = SALES_HIERARCHY_API;

  constructor(@Inject(ENVIRONMENT_CONFIG) environment: Environment, _http: HttpClient, loggerService: LoggerService) {
    const endpointConfig: EndpointConfig = environment.endpoints[SalesHierarchyApiService.API_NAME];
    super(endpointConfig, _http, loggerService);
    this._apiUrl = endpointConfig.baseUrl;
  }

  public getAccountsForSalesUser$(
    options: GetAccountsForSalesUserOptions,
  ): Observable<StandardResponse<GetAccountsForSalesUserResponse>> {
    const accountsForSalesUserOperation = new GetAccountsForSalesUserOperation({
      ...options,
    });

    return this.executeOperation<GetAccountsForSalesUserVariables, GetAccountsForSalesUserResponse>(
      `${this._apiUrl}graphql`,
      accountsForSalesUserOperation,
    );
  }

  public getSalesTerritories$(
    options: SearchSalesTerritoriesOptions,
  ): Observable<StandardResponse<GetSalesTerritoriesResponse>> {
    let where: SalesTerritoryFilterInput;

    if (options.searchText !== undefined) {
      where = this.buildPartialMatchVariables(options.searchText);
    } else if (options.territoryCodes) {
      where = this.buildTerritoryCodeMatchVariables(options.territoryCodes);
    } else {
      throw new Error('Either searchText or territoryCodes must be provided.');
    }

    const first: number = options.first ?? 50;
    const after = options.after;

    const operation = new GetSalesTerritoriesOperation({ where, first, after });

    return this.executeOperation<GetSalesTerritoriesVariables, GetSalesTerritoriesResponse>(
      `${this._apiUrl}graphql`,
      operation,
    );
  }

  private buildPartialMatchVariables(searchText: string): SalesTerritoryFilterInput {
    return {
      or: [
        { territoryName: { startsWith: searchText, neq: '' } },
        { salesUserFirstName: { startsWith: searchText } },
        { salesUserLastName: { startsWith: searchText } },
      ],
    };
  }

  private buildTerritoryCodeMatchVariables(territoryCodes: string[]): SalesTerritoryFilterInput {
    return { territoryName: { in: territoryCodes } };
  }
}
