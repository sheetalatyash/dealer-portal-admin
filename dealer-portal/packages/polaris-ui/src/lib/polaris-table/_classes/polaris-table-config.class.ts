import { Sort } from '@angular/material/sort';
import { PolarisTableColumnConfig } from './polaris-table-column-config.class';
import { PolarisTablePagination } from './polaris-table-pagination.class';

export class PolarisTableConfig<T> {
  public columns: PolarisTableColumnConfig<T>[] = [];
  public pagination: PolarisTablePagination = new PolarisTablePagination();
  public columnCaseInsensitive: boolean = true;
  public customSort?: (sort: Sort) => void;

  constructor(polarisTableConfig: Partial<PolarisTableConfig<T>> = {}) {
    Object.assign(this, polarisTableConfig);
  }
}
