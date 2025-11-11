/**
 * Represents a request to impersonate a user and redirect to an application afterwards.
 */
export class ImpersonateAndRedirectRequest {

  /**
   * The account number associated with the impersonation request.
   */
  public accountId: string;

  /**
   * The Optimizely page ID to redirect to after impersonation.
   */
  public pageId: number;

  /**
   * The username associated with the impersonation request.
   */
  public userName?: string;

  /**
   * Constructs a new instance of the ImpersonateAndRedirectRequest class.
   * 
   * @param accountNumber - The account number to be used for impersonation.
   * @param pageId - The Optimizely page ID to redirect to after impersonation.
   * @param userName - The username to be used for impersonation.
   */
  constructor(accountNumber: string, pageId: number, userName?: string) {
    this.accountId = accountNumber;
    this.pageId = pageId;
    if (userName) {
      this.userName = userName;
    }
  }
}
