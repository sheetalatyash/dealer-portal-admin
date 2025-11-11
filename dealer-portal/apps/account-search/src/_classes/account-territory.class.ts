import { AccountTerritoryEntity } from '@dealer-portal/polaris-core';

export class AccountTerritory {
  public polarisManager?: string = '';
  public salesBusinessUnit?: string = '';
  public salesRole?: string = '';

  constructor(private _entity: Partial<AccountTerritoryEntity> = {}) {
    this.polarisManager = _entity?.polarisManager ? _entity?.polarisManager : "Not Available";
    this.salesBusinessUnit = _entity.salesBusinessUnit;
    this.salesRole = _entity.salesforceRole ? _entity?.salesforceRole : "N/A";
  }
}
