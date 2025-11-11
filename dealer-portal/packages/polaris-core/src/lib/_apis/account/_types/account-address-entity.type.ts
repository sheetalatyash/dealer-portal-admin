import { AccountCoordinateEntity } from ".";

export interface AccountAddressEntity  {
  addressLine1?: string,
  addressType?: string,
  countryCode?: string,
  city?: string,
  coordinates?: AccountCoordinateEntity,
  postalCode?: string
  stateOrProvince?: string
}
