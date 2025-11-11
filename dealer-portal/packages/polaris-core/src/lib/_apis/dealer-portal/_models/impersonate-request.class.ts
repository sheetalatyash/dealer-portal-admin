/**
 * Represents an account that can be impersonated.
 */
export class ImpersonateRequest {
  /**
   * The account number of the impersonated account.
   */
  public accountNumber?: String;

  /**
   * The name of the impersonated account.
   */
  public accountName?: string;

  /**
   * The city and state of the impersonated account.
   */
  public cityState?: string;

    /**
   * The portal authentication ID associated with the impersonated account.
   */
  public portalAuthenticationId?: string;

  /**
   * The portal system ID associated with the impersonated account.
   */
  public systemId?: string;

  /**
   * The username associated with the impersonated account.
   */
  public userName?: string;

  /**
   * Creates an instance of ImpersonateAccount.
   *
   * @param accountNumber - The account number of the impersonated account.
   * @param accountName - The name of the impersonated account.
   * @param cityState - The city and state of the impersonated account.
   * @param userName - The username associated with the impersonated account.
   * @param portalAuthenticationId - The portal authentication ID associated with the impersonated account.
   * @param systemId - The portal system ID associated with the impersonated account.
   */
  constructor(accountNumber?: string, accountName?: string, cityState?: string, userName?: string, portalAuthenticationId?: string, systemId?: string) {
    this.accountNumber = accountNumber;
    this.accountName = accountName;
    this.cityState = cityState;
    this.userName = userName;
    this.portalAuthenticationId = portalAuthenticationId;
  }
}
