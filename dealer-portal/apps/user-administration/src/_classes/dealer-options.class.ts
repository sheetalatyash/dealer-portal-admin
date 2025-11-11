import { BaseEntity } from './base-entity.class';
import { ProductLine } from './product-line.class';

export class DealerOptions {
  [key: string]: BaseEntity[] | ProductLine[];

  public departments: BaseEntity[] = [];
  public employmentTypes: BaseEntity[] = [];
  public productLines: ProductLine[] = [];
  public serviceStaffRoles: BaseEntity[] = [];
  public staffRoles: BaseEntity[] = [];

  constructor(data: Partial<DealerOptions> = {}) {
    Object.assign(this, data);
  }
}
