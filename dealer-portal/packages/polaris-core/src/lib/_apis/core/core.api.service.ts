import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EndpointConfig, Environment, ENVIRONMENT_CONFIG } from '../../_types';
import { CoreDataEntity, CoreDataOptions } from './core.service.api.types';
import { BaseGraphQLApiService, CORE_API, StandardResponse } from '..';
import { GetCoreDataOperation, GetCoreDataVariables } from './_classes';
import { LoggerService } from '../../_services';

@Injectable({
  providedIn: 'root',
})
export class CoreApiService extends BaseGraphQLApiService {
  private readonly _coreApiUrl: string = '';

  static override readonly API_NAME: string = CORE_API;

  constructor(@Inject(ENVIRONMENT_CONFIG) environment: Environment, _http: HttpClient, loggerService: LoggerService) {
    const endpointConfig: EndpointConfig = environment.endpoints[CoreApiService.API_NAME];
    super(endpointConfig, _http, loggerService);
    this._coreApiUrl = `${endpointConfig.baseUrl}graphql`;
  }

  public getCoreData$(
    options: CoreDataOptions = {
      countries: true,
      customerClasses: true,
      languages: true,
      partnerTypes: true,
      productLineByFamily: true,
      productLineByBusinessUnit: true,
      stateAndProvinces: true,
      departments: true,
      staffRoles: true,
      serviceStaffRoles: true,
    },
  ): Observable<StandardResponse<CoreDataEntity>> {
    const coreDataOperation = new GetCoreDataOperation({ ...options });

    return this.executeOperation<GetCoreDataVariables, CoreDataEntity>(this._coreApiUrl, coreDataOperation);
  }
}
