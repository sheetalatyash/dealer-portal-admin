/**
 * Represents a user information entity with resource, schema, claims, and update details.
 */
export class BaseUserInfo<T> {
    id: string = '';

    /**
     * Gets or sets the resource associated with the user information.
     */
    resource: string = '';

    /**
     * Gets or sets the schema associated with the user information.
     */
    schema: string = '';

    /**
     * Gets or sets the claims associated with the user information.
     */
    claims?: T;

    /**
     * Gets or sets the date and time (UTC) when the user information was last updated.
     */
    updatedOn: Date = new Date();

    /**
     * Gets or sets the identifier of the user who last updated the information.
     */
    updatedBy: string = '';

    /**
     * Gets or sets the date and time (UTC) when the user information expires.
     */
    expiresOn: Date = new Date('0001-01-01T00:00:00.000Z');

    /**
     * Gets or sets a value indicating whether the user information should not be archived.
     */
    shouldNotArchive: boolean = false;

    constructor(init?: Partial<BaseUserInfo<T>>) {
        Object.assign(this, init);
    }
}
