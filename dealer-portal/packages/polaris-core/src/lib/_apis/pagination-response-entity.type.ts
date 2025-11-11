export type PaginationResponseEntity<T> = {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
};
