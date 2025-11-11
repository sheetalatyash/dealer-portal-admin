export class CommunicationAccount {
  public accountId?: number;
  public parentAccountId?: number;
  public communicationGuid?: string;
  public number?: string;
  public name?: string;
  public accountNumber?: string;
  public emailAddress?: string;

  constructor(private _account: Partial<CommunicationAccount> = {}) {
    Object.assign(this, _account);
  }
}
