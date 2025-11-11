import { ProductLineByBusinessUnitEntity } from '../../../_apis/core/core.service.api.types';
import { ProductLine } from './product-line.class';

export class ProductLineByBusinessUnit {
  public salesBusinessUnit?: string;
  public salesBusinessSort?: number;
  public productLines: ProductLine[] = [];

  constructor(private _entity: Partial<ProductLineByBusinessUnitEntity> = {}) {
    Object.assign(this, _entity);
  }
}
