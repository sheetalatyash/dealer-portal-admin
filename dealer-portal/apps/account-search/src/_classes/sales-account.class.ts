import { SalesUserAccount } from '@dealer-portal/polaris-core';
import { AccountUserLevel } from '@enums/account-user-level.enum';

export class SalesAccount {
  public accountNumber?: string = '';
  public accountName?: string = '';
  public city?: string = '';
  public state?: string = '';
  public plan?: string = '';
  public login?: string = '';
  public productLineCode?: string = '';
  public salesManagerName?: string = '';

  constructor(private _entity: Partial<SalesUserAccount> = {}) {
    this.accountNumber = _entity?.accountNumber;
    this.accountName = _entity.accountName;
    this.city = _entity.accountCity;
    this.state = _entity.accountStateOrProvince;
    this.productLineCode = _entity.productLineCode;
    this.salesManagerName = `${_entity.level1SalesUserFirstName ?? ''} ${_entity.level1SalesUserLastName ?? ''}`.trim();
  }

  public get AccountUserLevel(): AccountUserLevel {
    switch (this._entity.territoryTypeName) {
      case 'Level1':
        return AccountUserLevel.SalesManager;
      case 'Level2':
        return AccountUserLevel.RegionalManager;
      case 'Level3':
        return AccountUserLevel.DirectorOfSales;
      default:
        return AccountUserLevel.Unknown
    }
  }
}
