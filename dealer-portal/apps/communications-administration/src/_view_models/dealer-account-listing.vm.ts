import { AccountEntity, CommunicationAccount } from '@dealer-portal/polaris-core';
import { SelectDeleteTableBaseEntity } from './select-delete-table-base-entity';
import { AccountStatusFilter } from '@enums/account-status-filter.enum';
export class DealerAccountListingVm extends SelectDeleteTableBaseEntity {
  public dealerNumber!: string;
  public name?: string;
  public city?: string;
  public stateOrProvince?: string;

  constructor(private _account: Partial<AccountEntity> = {}) {
    super();
    Object.assign(this, _account);
    const primaryAddress = _account.addresses?.[0] ?? {};
    this.city = primaryAddress.city ?? '';
    this.stateOrProvince = primaryAddress.stateOrProvince ?? '';

    this.id = this.dealerNumber;
    this.status = AccountStatusFilter[_account.dealerStatus as keyof typeof AccountStatusFilter];
  }

  public toCommunicationAccountEntity(communicationGuid: string): CommunicationAccount {
    return new CommunicationAccount({
      communicationGuid,
      number: this.dealerNumber
    });
  }
}
