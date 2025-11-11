import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { EndpointConfig, Environment, ENVIRONMENT_CONFIG } from '../../_types';
import { Observable } from 'rxjs';
import { ACCOUNT_CONNECTOR_API, BaseApiService, StandardResponse } from '..';
import { FollowUp } from './_types/follow-up.type';
import { RetailGoal } from './_types/retail-goal.type';
import { LoggerService } from '../../_services';

@Injectable({
  providedIn: 'root',
})
export class AccountConnectorApiService extends BaseApiService {
  private readonly _baseUrl: string;

  static override readonly API_NAME: string = ACCOUNT_CONNECTOR_API;

  constructor(
    @Inject(ENVIRONMENT_CONFIG) environment: Environment,
    httpClient: HttpClient,
    loggerService: LoggerService,
  ) {
    const endpointConfig: EndpointConfig = environment.endpoints[AccountConnectorApiService.API_NAME];
    super(endpointConfig, httpClient, loggerService);
    this._baseUrl = endpointConfig.baseUrl;
  }

  public getFollowUps$(forceClearCache: boolean = false): Observable<StandardResponse<FollowUp[]>> {
    return this.get<FollowUp[]>(`${this._baseUrl}followup/follow-ups?forceClearCache=${forceClearCache}`);
  }

  public getMonthlyRetailGoals$(): Observable<StandardResponse<RetailGoal[]>> {
    return this.get<RetailGoal[]>(`${this._baseUrl}businessplan/monthly-retail-goals`);
  }
}
