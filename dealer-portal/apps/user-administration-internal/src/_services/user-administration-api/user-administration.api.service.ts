import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User, DealerOptions } from '@classes';
import { Permissions, PermissionPage } from '@dealer-portal/polaris-core';
import { environment } from '../../_environments/environment';

@Injectable()
export class UserAdministrationApiService {
  private readonly _apiUrl: string = environment.endpoints['userApiUrl'].baseUrl;
  private readonly _accountApiUrl: string = `${this._apiUrl}accounts/`;
  private readonly _portalApiUrl: string = environment.endpoints['portalApiUrl'].baseUrl;

  constructor(
    private readonly _http: HttpClient,
  ) {}


  public getUser$(dealerId: string, portalAuthenticationId: string): Observable<User> {
    return this._http.get<User>(`${this._accountApiUrl}${dealerId}/users/${portalAuthenticationId}`);
  }

  public updateUser$(dealerId: string, portalAuthenticationId: string, userDetails: User): Observable<User> {
    return this._http.patch<User>(`${this._accountApiUrl}${dealerId}/users/${portalAuthenticationId}`, userDetails);
  }

  public getDealerOptions$(dealerId: string): Observable<DealerOptions> {
    return this._http.get<DealerOptions>(`${this._accountApiUrl}${dealerId}`);
  }

  public getPermissions$(dealerId: string, userName: string): Observable<Permissions> {
    const permissionsUrl: string = `${this._portalApiUrl}api/PortalNavigation/permissions`;

    return this._http.get<Permissions>(`${permissionsUrl}?userId=${userName}&accountId=${dealerId}`);
  }

  public updatePermissions$(dealerId: string, userName: string, permissions: PermissionPage[]): Observable<Permissions> {
    const permissionsUrl: string = `${this._portalApiUrl}api/PortalNavigation/permissions`;

    return this._http.post<Permissions>(`${permissionsUrl}?userId=${userName}&accountId=${dealerId}`, permissions);
  }

}
