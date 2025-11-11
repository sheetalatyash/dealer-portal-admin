import { Injectable } from '@angular/core';
import { SalesHierarchyApiService, SalesUserAccount, GetAccountsForSalesUserResponse, StandardResponse, GetAccountsForSalesUserOptions } from '@dealer-portal/polaris-core';
import { map, Observable } from 'rxjs';

@Injectable()
export class SalesAccountService {

  constructor(private _repository: SalesHierarchyApiService) {}

  public getAccountsForSalesByFilters$(options: GetAccountsForSalesUserOptions): Observable<SalesUserAccount[]> {
    return this._repository
      .getAccountsForSalesUser$(options)
      .pipe(
        map((response: StandardResponse<GetAccountsForSalesUserResponse>) => {
          const salesUserAccounts = response?.data?.accountsForSalesUser;
          if (!salesUserAccounts || salesUserAccounts.length === 0) {
            return [];
          }

          return salesUserAccounts;
        })
      );
  }
}
