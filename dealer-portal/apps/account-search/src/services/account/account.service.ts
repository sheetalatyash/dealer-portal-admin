import { Injectable } from '@angular/core';
import { Account } from '@classes';
import { AccountApiService, AccountFilterArguments } from '@dealer-portal/polaris-core';
import { map, Observable } from 'rxjs';

@Injectable()
export class AccountService {

  constructor(private _repository: AccountApiService) {}

  public getAccountsByFilters$(filters: AccountFilterArguments): Observable<Account[]> {
    return this._repository
      .getAccounts$(filters.toGetAccountsVariables())
      .pipe(
        map((response) => {
          if (!response?.data?.accounts?.nodes) {
            return [];
          }

          return response.data.accounts?.nodes.map((entity) => {
            const account = new Account(entity);
            account.primaryAddress = account.addresses.find((address) => address.addressType?.toLocaleLowerCase() === 'primary');
            // TODO: implement business rules provided by api
            account.owningBusinessUnit = '';
            account.parentBusinessUnit = '';

            return account;
          });
        })
      );
  }
}
