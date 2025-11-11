import { AccessControlLevel } from "../../../_enums";
import { BooleanAsString } from "../../../_types";
import { Account } from "./account.class";

/**
 * Represents a user account with various properties and methods for managing user information.
 */
export class UserAccount {
  /**
   * The preferred username of the user.
   */
  preferred_username?: string;

  /**
   * The account number associated with the user.
   */
  accountNumber!: string;

  /**
 * The employee Id associated with the user.
 */
  empid!: string;

  /**
   * The name of the account.
   */
  accountName!: string;

  /**
   * The system ID of the user.
   */
  systemId?: string;

  /**
   * The username of the user.
   */
  userName?: string;

  /**
   * The given name of the user.
   */
  get givenName(): string | undefined {
    return (this as any)?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"];
  }

  /**
   * The family name of the user.
   */
  get familyName(): string | undefined {
    return (this as any)?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"]
  }

  /**
   * The country code of the user.
   */
  countryCode?: string;

  /**
   * The state or province of the user.
   */
  stateOrProvince?: string;

  /**
   * The portal authentication ID of the user.
   */
  portalAuthenticationId?: string;

  /**
   * Indicates if the user can share to Web Infinity.
   */
  shareToWebInfinity: BooleanAsString = 'false';

  /**
   * The culture code of the user.
   */
  cultureCode?: string;

  /**
   * Indicates if the user is a dealer admin.
   */
  isDealerAdmin: BooleanAsString = 'false';

  /**
   * Indicates if the user is impersonating a dealer group.
   */
  isDealerGroupImpersonation: BooleanAsString = 'false';

  /**
   * Indicates if the user has access to the dealer portal.
   */
  isDealerPortal: BooleanAsString = 'false';

  /**
   * Indicates if the user is an internal user.
   */
  isInternalUser: BooleanAsString = 'false';

  /**
   * The impersonation permission level.
   */
  accountImpersonationPermission?: AccessControlLevel;

  /**
   * The impersonation permission level for internal users.
   */
  internalImpersonationPermission?: AccessControlLevel;

  /**
   * The help desk ticket number.
   */
  helpDeskNumber?: string;

  /**
   * Indicates whether the user is active.
   */
  isActive?: BooleanAsString;

  /**
   * Indicates if the user is an Optimizely portal admin.
   */
  isOptimizelyPortalAdmin?: BooleanAsString = 'false';

  /**
   * The product lines associated with the user, stored as a comma-separated string.
   * Use the `productLines` getter and setter to access this property as an array.
   */
  private _productLines?: string;

  /**
   * Sets the product lines associated with the user.
   * @param value - A comma-separated string of product lines.
   */
  set productLines(value: string | undefined) {
    this._productLines = value;
  }

  /**
   * Gets the product lines associated with the user as an array of strings.
   * @returns An array of product lines or undefined if not set.
   */
  get productLines(): string[] | undefined {
    return this._productLines ? this._productLines.split(',') : undefined;
  }

  /**
   * The class code of the user.
   */
  classCode?: string;

  /**
   * The partner type of the user.
   */
  partnerType?: string;

  /**
   * Indicates if the user is active.
   */
  active?: string;

  /**
   * The first name of the user.
   */
  firstName?: string;

  /**
   * The last name of the user.
   */
  lastName?: string;

  /**
   * The DEX security role of the user.
   */
  dexSecurityRole?: string;

  /**
   * The departments associated with the user, stored as a comma-separated string.
   * Use the `departments` getter and setter to access this property as an array of numbers.
   */
  departments?: number[];

  /**
   * The staff role of the user.
   */
  staffRole?: string;

  /**
   * The service staff roles of the user.
   */
  serviceStaffRoles?: string[];

  /**
   * The accounts associated with the user.
   */
  accounts!: Account[];

  /**
   * The portal permissions associated with the user, stored as a comma-separated string.
   * Use the `portalPermissions` getter and setter to access this property as an array of numbers.
   */
  portalPermissions?: number[];

  /**
   * The original claims of the user.
   */
  originalClaims?: UserAccount[];

  /**
   * The user that is being impersonated.
   */
  impersonatingUser?: string;

  /**
   * The original logged-in user before impersonation.
   */
  originalLoggedInUser?: string;

  /**
   * Creates an instance of UserAccount.
   * @param data - Partial data to initialize the UserAccount instance.
   */
  constructor(data: Partial<UserAccount> = {}) {
    Object.assign(this, data);
    if (typeof this.accounts === 'string') {
      this.accounts = JSON.parse(this.accounts);
    }
    if (typeof this.portalPermissions === 'string') {
      this.portalPermissions = JSON.parse(this.portalPermissions);
    }
    if (typeof this.departments === 'string') {
      this.departments = JSON.parse(this.departments);
    }
  }

  /**
   * Indicates if the user is currently impersonating another user.
   * @returns True if the user is impersonating, otherwise false.
   */
  public get isImpersonating(): boolean {
    return this.originalLoggedInUser !== undefined;
  }
}
