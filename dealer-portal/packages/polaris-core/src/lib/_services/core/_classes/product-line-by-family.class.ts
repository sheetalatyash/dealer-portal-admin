import { ProductLineByFamilyEntity } from '../../../_apis/core/core.service.api.types';
import { ProductLine } from './product-line.class';

export class ProductLineByFamily {
  public productFamily?: string;
  public productLines: ProductLine[] = [];

  constructor(private _entity: Partial<ProductLineByFamilyEntity> = {}) {
    Object.assign(this, _entity);
  }
}
