export class ImpersonateAccount {
  public accountNumber?: string = '';
  public accountName?: string = '';
  public userName?: string = '';
  public portalAuthenticationId?: string = '';
  public systemId?: string = '';

  constructor(accountNumber?: string, accountName?: string, userName?: string, portalAuthenticationId?: string, systemId?: string) {
    this.accountNumber = accountNumber;
    this.accountName = accountName;
    this.userName = userName;
    this.portalAuthenticationId = portalAuthenticationId;
    this.systemId = systemId;
  }
}
