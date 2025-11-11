import { AccountServiceIdentifierEntity } from '@dealer-portal/polaris-core';

export class AccountServiceIdentifier {
  public id?: string = '';
  public type?: string = '';

  constructor(private _entity: Partial<AccountServiceIdentifierEntity> = {}) {
    Object.assign(this, _entity);
  }
}
