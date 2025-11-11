import { AccessControlLevel, AccessLevel } from '@dealer-portal/polaris-core';
import { User } from './user.class';

export class ExtendedUser extends User {
  public accessLevel: AccessLevel;

  constructor(user: Partial<User> = {}) {
    super(user);

    // Initialize accessLevel, defaulting to 'none' if not provided
    // this.accessLevel = accessLevel || new AccessLevel();
    const access = user.permissions?.[0]?.access as AccessControlLevel;
    this.accessLevel = (access) ? {
        none: access === AccessControlLevel.None,
        readOnly: access === AccessControlLevel.Read,
        readWrite: access === AccessControlLevel.ReadWrite,
    } : new AccessLevel();

    // initialize role and department
    this['roleString'] = user.role || '';
    this['departmentString']= user.departments?.join(", ") || '';

    // Merge user properties into this instance
    Object.assign(this, user);

    // Ensure email is always lowercase
    this.email = this.email.toLowerCase();
    this.emailAddress = this.emailAddress.toLowerCase();
  }
}
