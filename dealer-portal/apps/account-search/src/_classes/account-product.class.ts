import { AccountProductEntity } from '@dealer-portal/polaris-core';

export class AccountProduct {
  public classCode?: string = '';
  public classCodeDescription?: string = '';
  public productFamilyName?: string = '';
  public productLines: string[] = [];

  constructor(private _entity: Partial<AccountProductEntity> = {}) {
    // TODO: temporary solution to get the product family name
    this.productFamilyName = _entity?.description;
  }
}
