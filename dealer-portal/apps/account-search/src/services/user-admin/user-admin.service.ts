import { Injectable } from '@angular/core';
import { Account, AccountUser } from '@classes';
import { AccountUserResponse, ImpersonateResponse, StandardResponse, UserAdminApiService } from '@dealer-portal/polaris-core';
import { DealerPortalService } from '@services/dealer-portal/dealer-portal.service';
import { map, Observable, switchMap } from 'rxjs';

@Injectable()
export class UserAdminService {
  constructor(private _userAdminApiService: UserAdminApiService, private _dealerPortalService: DealerPortalService) {}

  public getUserByAccount$(accountNumber: string): Observable<AccountUser[]> {
    return this._userAdminApiService
      .getUsers$(accountNumber)
      .pipe(
        map((response: StandardResponse<AccountUserResponse[]>) => {
          if (!response.data) {
            return [];
          }

          return response.data.map((accountUserResponse: AccountUserResponse) => {
            const user = new AccountUser(accountUserResponse);

            return user;
          });
        })
      );
  }

  public getAdminUserByAccount$(account: Account): Observable<ImpersonateResponse | undefined> {

    return this._userAdminApiService.getAdminUser$(account.accountNumber)
      .pipe(
        switchMap((standardResponse: StandardResponse<AccountUserResponse>) => {
          if(!standardResponse.success || standardResponse.data === undefined) {

            return this._dealerPortalService.impersonateAdminInternal$(account.accountNumber, account.accountName, account.systemId);
          }

          return this._dealerPortalService.impersonateUser$(account.accountNumber, account.accountName, account.primaryAddress?.CityState, standardResponse.data.emailAddress, standardResponse.data.portalAuthenticationId, account.systemId);
       })
      );
  }
}
