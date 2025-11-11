import { PageAccessoryCategory } from './page-access-category.class';
import { PermissionPage } from './permission-page.class';


export class Permissions {
  public pages: PermissionPage[] = [];
  public pageAccessCategories: PageAccessoryCategory[] = [];


  constructor(permissions: Partial<Permissions> = {}) {
    Object.assign(this, permissions);
  }
}
