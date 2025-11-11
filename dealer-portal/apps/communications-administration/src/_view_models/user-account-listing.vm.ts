import { AccountUserResponse, CommunicationAccount } from '@dealer-portal/polaris-core';
import { AccountStatusFilter } from '@enums/account-status-filter.enum';
import { SelectDeleteTableBaseEntity } from './select-delete-table-base-entity';

// TODO: Update accordingly when API information is available.
export class UserAccountListingVm extends SelectDeleteTableBaseEntity {
  public emailAddress!: string;
  public accountName?: string;
  public accountId!: string;

  constructor(private _account: Partial<AccountUserResponse> = {}) {
    super();
    Object.assign(this, _account);

    this.accountName = _account?.dealers?.[0]?.dealerName,
    this.accountId = _account?.dealers?.[0]?.dealerId ?? '',
    this.id = this.emailAddress;
    this.status = this._determineAccountStatus(_account.active);
  }

  public toCommunicationUserAccountEntity(communicationGuid: string): CommunicationAccount {
    return new CommunicationAccount({
      communicationGuid,
      emailAddress: this.emailAddress,
      accountNumber: this.accountId
    });
  }

  private _determineAccountStatus(status: boolean | undefined): AccountStatusFilter {
    return status !== undefined ? (status ? AccountStatusFilter.Active : AccountStatusFilter.Inactive) : AccountStatusFilter.NotFound;
  }
}
