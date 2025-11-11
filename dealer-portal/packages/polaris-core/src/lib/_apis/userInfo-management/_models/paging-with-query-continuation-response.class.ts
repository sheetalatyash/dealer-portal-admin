import { PagingResponse } from './paging-response.class';
import { QueryContinuation } from './query-continuation.class';

/**
 * Represents a paginated response with query continuation information.
 * 
 * @template T - The type of items in the paginated response.
 * 
 * @extends PagingResponse<T>
 */
export class PagingWithQueryContinuationResponse<T> extends PagingResponse<T> {
    /**
     * Gets or sets the query continuation information.
     */
    queryContinuation?: QueryContinuation;

    /**
     * Initializes a new instance of the PagingWithQueryContinuationResponse class.
     * 
     * @param data - The data items for the current page.
     * @param pageNumber - The current page number. Defaults to 1.
     * @param pageSize - The number of items per page. Defaults to 10.
     * @param totalCount - The total number of items. Defaults to 0.
     * @param queryContinuation - The query continuation information.
     */
    constructor(
        data?: T[],
        pageNumber: number = 1,
        pageSize: number = 10,
        totalCount: number = 0,
        queryContinuation?: QueryContinuation
    ) {
        super(data, pageNumber, pageSize, totalCount);
        this.queryContinuation = queryContinuation;
    }
}