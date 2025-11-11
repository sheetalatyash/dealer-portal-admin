import { AccessControlLevel } from '../_enums';

export class PageAccessoryCategory {
  [key: string]: string | undefined;

  public displayName: string = '';
  public value: AccessControlLevel = AccessControlLevel.None;

  constructor(pageAccessCategory: Partial<PageAccessoryCategory> = {}) {
    Object.assign(this, pageAccessCategory);
  }
}
