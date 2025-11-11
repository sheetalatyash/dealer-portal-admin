import { StandardResponse } from './standard-response.class';

export class PaginationResponse<T> extends StandardResponse<T[]> {
  /**
   * The current page number.
   */
  pageNumber: number;

  /**
   * The number of records per page.
   */
  pageSize: number;

  /**
   * The total number of records.
   */
  totalRecords: number;

  constructor(paginationResponse: Partial<PaginationResponse<T>> = {}) {
    super(paginationResponse);
    this.data = paginationResponse.data ?? [];
    this.pageNumber = paginationResponse.pageNumber ?? 0;
    this.pageSize = paginationResponse.pageSize ?? 1;
    this.totalRecords = paginationResponse.totalRecords ?? 0;
  }

  /**
   * Calculates the total number of pages.
   */
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  /**
   * Maps the data to a new type using the provided mapping function.
   * @param mapFn - The function to map the data.
   */
  mapData<U>(mapFn: (value: T) => U): PaginationResponse<U> {
    return new PaginationResponse<U>({
      data: this.data?.map(mapFn),
      error: this.error,
      success: this.success,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      totalRecords: this.totalRecords,
    });
  }
}
