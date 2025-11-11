/**
 * Represents a request to impersonate an admin internally.
 */
export class ImpersonateAdminInternalRequest {

  /**
   * The account number associated with the impersonation request.
   */
  public accountNumber?: string;

  /**
   * The account name associated with the impersonation request.
   */
  public accountName?: string;

    /**
   * The portal authentication ID associated with the impersonation request.
   */
  public portalAuthenticationId?: string;

      /**
   * The System ID associated with the impersonation request.
   */
  public systemId?: string;

  /**
   * Constructs a new instance of the ImpersonateAdminInternalRequest class.
   *
   * @param accountNumber - The account number to be used for impersonation.
   * @param accountName - The account name to be used for impersonation.
   * @param portalAuthenticationId - The portal authentication ID to be used for impersonation.
   * @param systemId - The System ID to be used for impersonation.
   */
  constructor(accountNumber?: string, accountName?: string, systemId?: string, portalAuthenticationId?: string) {
    this.accountNumber = accountNumber;
    this.accountName = accountName;
    this.portalAuthenticationId = portalAuthenticationId;
    this.systemId = systemId;
  }
}
