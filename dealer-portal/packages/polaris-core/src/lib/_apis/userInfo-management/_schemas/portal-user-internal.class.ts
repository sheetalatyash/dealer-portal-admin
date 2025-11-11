import { AccessControlLevel } from "../../../_enums";
import { BooleanAsString } from "../../../_types";

/**
 * Represents the internal claims of a portal user.
 */
export class PortalUserInternalClaim {
    /**
     * Gets or sets the account name of the user.
     */
    public accountName!: string;

    /**
     * Gets or sets the account number of the user.
     */
    public accountNumber!: string;

    /**
     * Gets or sets the username of the user.
     */
    public userName!: string;

    /**
     * Gets or sets the given name of the user.
     */
    public givenName?: string;

    /**
     * Gets or sets the family name of the user.
     */
    public familyName?: string;

    /**
     * Gets or sets the email of the user.
     */
    public email!: string;

    /**
     * Gets or sets a value indicating whether the user is an internal user.
     */
    public isInternalUser: BooleanAsString = 'true';

    /**
     * Gets or sets the impersonation permission level.
     */
    public accountImpersonationPermission?: AccessControlLevel;

    /**
     * Gets or sets the impersonation permission level for internal users.
     */
    public internalImpersonationPermission?: AccessControlLevel;

    /**
     * Gets or sets the help desk ticket number.
     */
    public helpDeskNumber?: string;

    /**
     * Gets or sets a value indicating whether the user is active.
     */
    public isActive?: BooleanAsString;

    /**
     * Gets or sets the sales role of the user.
     */
    public salesRole?: string;

    /**
     * Gets or sets the sales rep ID of the user.
     */
    public salesRepId?: string;

    /**
     * Gets or sets the culture code of the user.
     */
    public cultureCode?: string;

    /**
     * Gets or sets a value indicating whether the user is an Optimizely portal admin.
     */
    public isOptimizelyPortalAdmin?: BooleanAsString = 'false';

    /**
     * Gets or sets a value indicating whether the user is an Optimizely language admin.
     */
    public isOptimizelyLanguageAdmin?: BooleanAsString = 'false';

    /**
     * Gets or sets a value indicating whether the user is an Optimizely content admin.
     */
    public isOptimizelyContentAdmin?: BooleanAsString = 'false';
}
