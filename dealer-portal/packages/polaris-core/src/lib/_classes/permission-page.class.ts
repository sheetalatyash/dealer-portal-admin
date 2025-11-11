import { AccessControlLevel } from '../_enums';
import { AdditionalClaim, PageAccessoryCategory } from '../_classes';

export class PermissionPage {

  public access: AccessControlLevel = AccessControlLevel.None;
  public applicationName?: string = '';
  public pageId?: number;

  // TODO: verify these are needed
  public contentId: number = 0;
  public menuName: string = '';
  public children?: PermissionPage[];
  public departments: string[] = [];
  public additionalClaims: AdditionalClaim[] = [];
  public availablePageAccessTypes: PageAccessoryCategory[] = [];

  constructor(permissionPage: Partial<PermissionPage> = {}) {
    Object.assign(this, permissionPage);
  }
}
