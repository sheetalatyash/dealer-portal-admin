// TODO: This may need to be a top-level polaris-ui class or be combined with the polaris-paginator component

export class PolarisTablePagination {
  public uiTestId: string = 'polaris-table-pagination-default-data-test-id';
  public totalItems: number = 0;

  constructor(polarisTablePagination: Partial<PolarisTablePagination> = {}) {
    Object.assign(this, polarisTablePagination);
  }
}
