import { Injectable } from '@angular/core';
import {
  DealerPortalApiService,
  LoggerService,
  StandardResponse,
  ImpersonateAccount,
} from '@dealer-portal/polaris-core';
import { RedirectEntity } from '@types';
import { Observable, map, tap } from 'rxjs';

@Injectable()
export class DealerPortalService {

  constructor(
    private _dealerPortalApiService: DealerPortalApiService,
    private _loggerService: LoggerService,
  ) {}

  public switchAccount$(impersonatedAccount: ImpersonateAccount): Observable<string> {
    return this._dealerPortalApiService.impersonateAdminInternal$(impersonatedAccount)
      .pipe(
        tap(({ success, error }: StandardResponse<RedirectEntity>) => {
          if (!success) {
            this._loggerService.logError('Failed to impersonate account: ', {impersonatedAccount,error});
          }
        }),
        map(({ success, data }: StandardResponse<RedirectEntity>) => {
          return (success && data?.redirectUrl) ? data.redirectUrl : '';
        })
    );
  }
}
