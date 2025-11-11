import { PermissionPage } from '../../../_classes';

export class AccountPermission {
  public account: string = '';
  public email: string = '';
  public permissions: Partial<PermissionPage>[] = [];

  constructor(options: Partial<AccountPermission> = {}) {
    Object.assign(this, options);
  }
}
