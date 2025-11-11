
import { AccountCoordinate } from "@classes";
import { AccountAddressEntity } from '@dealer-portal/polaris-core';

export class AccountAddress {
  public addressLine1?: string = '';
  public addressType?: string = '';
  public city?: string = '';
  public postalCode?: string = '';
  public stateProvince?: string = '';
  public coordinates?: AccountCoordinate;

  constructor(private _entity: Partial<AccountAddressEntity> = {}) {
    this.addressLine1 = _entity?.addressLine1;
    this.addressType = _entity.addressType
    this.city = _entity?.city;
    this.postalCode = _entity?.postalCode;
    this.stateProvince = _entity?.stateOrProvince;
    this.coordinates = new AccountCoordinate(_entity.coordinates);
  }

  public get Address1(): string {
    return this.addressLine1 ?? '';
  }

  public get CityState(): string {
    return this.city && this.stateProvince ? `${this.city}, ${this.stateProvince}` : '';
  }
  public get CityStatePostal(): string {
    let value: string = this.city ?? '';
    if (this.stateProvince) {
      value += `, ${this.stateProvince}`;
    }
    if (this.postalCode) {
      value += ` ${this.postalCode}`;
    }

    return value;
  }
}
