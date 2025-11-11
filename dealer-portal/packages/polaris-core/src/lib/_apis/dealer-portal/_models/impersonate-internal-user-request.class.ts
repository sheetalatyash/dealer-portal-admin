/**
 * Represents an internal user account that can be impersonated.
 */
export class ImpersonateInternalUserRequest {
  /**
   * The account number of the impersonated account.
   */
  public accountNumber?: String;

  /**
   * The email address associated with the impersonated account.
   */
  public emailAddress?: string;

  /**
   * Creates an instance of ImpersonateInternalUserRequest.
   * 
   * @param accountNumber - The account number of the impersonated account.
   * @param emailAddress - The email address associated with the impersonated account.
   */
  constructor(accountNumber?: string, emailAddress?: string) {
    this.accountNumber = accountNumber;
    this.emailAddress = emailAddress;
  }
}
