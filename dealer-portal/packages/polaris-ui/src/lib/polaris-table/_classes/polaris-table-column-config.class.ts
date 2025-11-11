import { POLARIS_BREAKPOINTS, PolarisAlignment, PolarisBreakpoint } from '../../_types';
import { PolarisTableColumnType } from '../_types';

export class PolarisTableColumnConfig<T> {
  public key: keyof T | string = '';
  public id: string = '';
  public label: string = '';
  public sortable: boolean = true;
  public alignHeader: PolarisAlignment = 'start';
  public alignContent: PolarisAlignment = 'start';
  public columnType: PolarisTableColumnType = 'text';
  public columnVisibility: PolarisBreakpoint[] = POLARIS_BREAKPOINTS;

  constructor(polarisTableColumnConfig: Partial<PolarisTableColumnConfig<T>>) {
    Object.assign(this, polarisTableColumnConfig);
  }
}
