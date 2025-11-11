import { RecentAccountEntity } from "@types";

export class RecentAccount {
  public accountNumber?: string = '';
  public accountName?: string = '';
  public cityState?: string = '';
  public firstName?: string = '';
  public lastName?: string = '';
  public userName?: string = '';
  public portalAuthenticationId: string = '';
  public impersonationDatetime?: string = '';

  constructor(entity: Partial<RecentAccountEntity>) {
    Object.assign(this, entity);
  }
}
