import { BaseEntity, Dealer, ProductLine } from '@classes';
import { AccessLevel, PermissionPage } from '@dealer-portal/polaris-core';

export type UserValueType = string | boolean | number | AccessLevel | BaseEntity | Array<BaseEntity | Dealer | ProductLine | Partial<PermissionPage>>;

export class User {
  [key: string]: UserValueType;

  public active: boolean = false;
  public admin: boolean = false;
  public dealerId: string = '';
  public dealers: Dealer[] = [];
  public departments: BaseEntity[] = [];
  public department: string = ''
  public dexView: BaseEntity = new BaseEntity();
  public email: string = '';
  public emailAddress: string = '';
  public employeeStatusCode: number = 0;
  public employmentType: BaseEntity = new BaseEntity();
  public employmentTypeString: string = '';
  public firstName: string = '';
  public isPrimaryCommunicationContact: boolean = false;
  public jobTitle: string = '';
  public lastName: string = '';
  public permissions: Partial<PermissionPage>[] = [];
  public phone: string = '';
  public pointsEligible: boolean = false;
  public portalAuthenticationId: string = '';
  public salesFlag: boolean = false;
  public serviceEmployee: boolean = false;
  public serviceStaffRoles: BaseEntity[] = [];
  public shareToWebInfinity: boolean = false;
  public spiffEligible: boolean = false;
  public userName: string = '';
  public staffRole: BaseEntity = new BaseEntity();
  public role: string = '';
  public productLines: ProductLine[] = [];

  constructor(user: Partial<User> = {}) {
    Object.assign(this, user);
  }
}
