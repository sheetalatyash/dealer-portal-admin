import { AccountCoordinateEntity } from '@dealer-portal/polaris-core';

export class AccountCoordinate {
  public latitude?: string = '';
  public longitude?: string = '';

  constructor(private _entity: Partial<AccountCoordinateEntity> = {}) {
    this.latitude = _entity?.latitude;
    this.longitude = _entity.longitude;
  }
}
