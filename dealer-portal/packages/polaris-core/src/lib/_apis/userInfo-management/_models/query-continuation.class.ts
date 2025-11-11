/**
 * Represents the continuation information for a query.
 */
export class QueryContinuation {
    /**
     * Gets or sets the continuation token.
     */
    continuationToken?: string;

    /**
     * Gets or sets the continuation point.
     */
    continuationPoint: number;

    /**
     * Gets or sets the total number of items.
     */
    totalCount: number;

    /**
     * Gets or sets a value indicating whether to disable the total items count.
     */
    disableTotalItems: boolean;

    constructor(
        continuationToken?: string,
        continuationPoint: number = 0,
        totalCount: number = 0,
        disableTotalItems: boolean = false
    ) {
        this.continuationToken = continuationToken;
        this.continuationPoint = continuationPoint;
        this.totalCount = totalCount;
        this.disableTotalItems = disableTotalItems;
    }
}