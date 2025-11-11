import { ImpersonateAccount } from './impersonate-account.class';

export class ImpersonateUser extends ImpersonateAccount {
  public cityState?: string = '';
  public firstName?: string = '';
  public lastName?: string = '';

  constructor(accountNumber?: string, accountName?: string, cityState?: string, firstName?: string, lastName?: string, userName?: string, portalAuthenticationId?: string) {
    super(accountNumber, accountName, userName, portalAuthenticationId);

    this.cityState = cityState;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
