
/**
 * Represents a paginated response.
 * 
 * @template T - The type of data items.
 */
export class PagingResponse<T> {
    /**
     * Gets or sets the list of data items.
     */
    data?: T[];

    /**
     * Gets or sets the current page number.
     */
    pageNumber: number;

    /**
     * Gets or sets the number of items per page.
     */
    pageSize: number;

    /**
     * Gets or sets the total count of items.
     */
    totalCount: number;

    /**
     * Initializes a new instance of the PagingResponse class.
     * 
     * @param data - The list of data items.
     * @param pageNumber - The current page number. Default is 1.
     * @param pageSize - The number of items per page. Default is 10.
     * @param totalCount - The total count of items. Default is 0.
     */
    constructor(
        data?: T[],
        pageNumber: number = 1,
        pageSize: number = 10,
        totalCount: number = 0
    ) {
        this.data = data;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.totalCount = totalCount;
    }
}