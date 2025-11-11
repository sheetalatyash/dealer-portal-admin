import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  GetUsersOptions,
  PermissionPage,
  Permissions,
} from '@dealer-portal/polaris-core';
import { PermissionPayload } from '@types';
import { Observable } from 'rxjs';
import { User, DealerOptions, CommunicationCategory } from '@classes';
import { environment } from '../../_environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserAdministrationApiService {
  private readonly _apiUrl: string = environment.endpoints['userApiUrl'].baseUrl;
  private readonly _accountApiUrl: string = `${this._apiUrl}accounts/`;
  private readonly _portalApiUrl: string = environment.endpoints['portalApiUrl'].baseUrl;
  private readonly _portalPermissionsApiUrl: string = `${this._portalApiUrl}api/permissions/update`;

  // TODO: This service and types need to be migrated to polaris-core
  constructor(private readonly _http: HttpClient) {}

  // TODO: There is a method already like this in polaris-core however, migrating all the types over is a larger task
  //       so for now, duplicating the method here to avoid breaking changes
  public getUsers$(dealerId: string, options: GetUsersOptions): Observable<User[]> {
    let params: HttpParams = new HttpParams();

    if (options.onlyActive !== undefined) {
      params = params.set('onlyActive', String(options.onlyActive));
    }
    if (options.onlyInactive !== undefined) {
      params = params.set('onlyInactive', String(options.onlyInactive));
    }

    return this._http.get<User[]>(`${this._accountApiUrl}${dealerId}/users`, {
      params,
    });
  }
  public getUser$(dealerId: string, portalAuthenticationId: string): Observable<User> {
    return this._http.get<User>(`${this._accountApiUrl}${dealerId}/users/${portalAuthenticationId}`);
  }

  public updateUser$(dealerId: string, portalAuthenticationId: string, userDetails: User): Observable<User> {
    return this._http.patch<User>(`${this._accountApiUrl}${dealerId}/users/${portalAuthenticationId}`, userDetails);
  }

  public addNewUser$(dealerId: string, userDetails: User): Observable<string> {
    return this._http.post(`${this._accountApiUrl}${dealerId}/users/add`, userDetails, { responseType: 'text' });
  }

  public fetchDealerOptions$(dealerId: string): Observable<DealerOptions> {
    return this._http.get<DealerOptions>(`${this._accountApiUrl}${dealerId}`);
  }

  public getCommunicationCategories$(
    dealerId: string,
    portalAuthenticationId: string,
    userName: string,
  ): Observable<CommunicationCategory[]> {

    return this._http.get<CommunicationCategory[]>(
      `${this._accountApiUrl}${dealerId}/users/${portalAuthenticationId}/communicationcategories/${userName}`,
    );
  }

  public updateCommunicationCategories$(
    dealerId: string,
    portalAuthenticationId: string,
    communicationCategories: CommunicationCategory[],
  ): Observable<CommunicationCategory[]> {
    return this._http.post<CommunicationCategory[]>(
      `${this._accountApiUrl}${dealerId}/users/${portalAuthenticationId}/communicationcategories`,
      communicationCategories,
    );
  }

  public resendVerificationEmail$(dealerId: string, userName: string): Observable<boolean> {
    const encodedUserName: string = encodeURIComponent(userName);

    return this._http.post<boolean>(`${this._accountApiUrl}${dealerId}/resendemail/${encodedUserName}`, {});
  }

  public getPermissions$(dealerId: string, userName: string): Observable<Permissions> {
    const permissionsUrl: string = `${this._portalApiUrl}api/PortalNavigation/permissions`;
    const encodedUserName: string = encodeURIComponent(userName);

    return this._http.get<Permissions>(`${permissionsUrl}?userId=${encodedUserName}&accountId=${dealerId}`);
  }

  public updatePermissions$(
    dealerId: string,
    userName: string,
    permissions: PermissionPage[],
  ): Observable<Permissions> {
    const permissionsUrl: string = `${this._portalApiUrl}api/PortalNavigation/permissions`;
    const encodedUserName: string = encodeURIComponent(userName);

    return this._http.post<Permissions>(`${permissionsUrl}?userId=${encodedUserName}&accountId=${dealerId}`, permissions);
  }

  public updateUserPermissions$(permission: PermissionPayload): Observable<unknown> {
    return this._http.post<unknown>(this._portalPermissionsApiUrl, permission);
  }
}
