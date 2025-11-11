/**
 * Enum representing default values used in the account search feature.
 *
 * @enum {string}
 * @property {string} AX - the service identifier type for AX systems
 * @property {string} IBMi - the service identifier type for IBMi systems
 * @property {string} iDEX - the service identifier type for iDEX systems
 */
export enum ServiceIdentifierTypes {
  /**
   * the service identifier types for international accounts
   */
  AX = 'AX',
  IBMi = 'IBMi',
  iDEX = 'iDEX'
}
