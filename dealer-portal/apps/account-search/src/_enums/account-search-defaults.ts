/**
 * Enum representing default values used in the account search feature.
 *
 * @enum {string}
 * @property {string} internalAccount - The default internal account number used for account searches.
 */
export enum AccountSearchDefaults {
  /**
   * the default internal account number when no specific account is provided in the search and no recently viewed accounts exist
   */
  internalAccount = '5432100'
}
