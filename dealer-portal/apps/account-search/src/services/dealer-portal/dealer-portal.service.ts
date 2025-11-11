import { Injectable } from '@angular/core';
import { DealerPortalApiService, ImpersonateResponse, ImpersonateRequest, StandardResponse, ImpersonateAdminInternalRequest, ImpersonateInternalUserRequest, ImpersonateAndRedirectRequest } from '@dealer-portal/polaris-core';
import { map, Observable } from 'rxjs';

@Injectable()
export class DealerPortalService {
  constructor(private _dealerPortalApiService: DealerPortalApiService) {}

  public impersonateUser$(accountNumber?: string, accountName?: string, cityState?: string, userName?: string, portalAuthenticationId?: string, systemId?: string): Observable<ImpersonateResponse | undefined>
  {
    const impersonateAccount = new ImpersonateRequest(accountNumber, accountName, cityState, userName, portalAuthenticationId, systemId);

    return this._dealerPortalApiService
      .impersonate$(impersonateAccount)
      .pipe(map((standardResponse: StandardResponse<ImpersonateResponse>) =>
        standardResponse.data
      ));
  }

  public impersonateAdminInternal$(accountNumber?: string, accountName?: string, systemId?: string): Observable<ImpersonateResponse | undefined>
  {
    const impersonateAccount = new ImpersonateAdminInternalRequest(accountNumber, accountName, systemId);

    return this._dealerPortalApiService
      .impersonateAdminInternal$(impersonateAccount)
      .pipe(map((standardResponse: StandardResponse<ImpersonateResponse>) =>
        standardResponse.data
      ));
  }

  public impersonateInternalUser$(accountNumber?: string, emailAddress?: string): Observable<ImpersonateResponse | undefined> {
    const impersonationRequest = new ImpersonateInternalUserRequest(accountNumber, emailAddress);

    return this._dealerPortalApiService
      .impersonateInternalUser$(impersonationRequest)
      .pipe(map((standardResponse: StandardResponse<ImpersonateResponse>) =>
        standardResponse.data
    ));
  }

  public impersonateAndRedirect$(accountNumber: string, pageId: number, userName?: string): Observable<void> {
    const impersonationRequest = new ImpersonateAndRedirectRequest(accountNumber, pageId, userName);

    return this._dealerPortalApiService
      .impersonateAndRedirect$(impersonationRequest)
      .pipe(map((standardResponse: StandardResponse<void>) =>
        standardResponse.data
      ));
  }

  public salesRepAccountLogin$(accountNumber: string): Observable<ImpersonateResponse | undefined> {

    return this._dealerPortalApiService
      .salesRepAccountLogin$(accountNumber)
      .pipe(map((standardResponse: StandardResponse<ImpersonateResponse>) =>
        standardResponse.data
    ));
  }
}
