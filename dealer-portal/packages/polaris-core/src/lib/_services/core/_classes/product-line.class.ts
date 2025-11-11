import { ProductLineEntity } from '../../../_apis';

export class ProductLine {
  public productGUID?: string;
  public id?: string;
  public name?: string;
  public description?: string;
  public productFamily?: string;
  public salesBusinessUnit?: string;
  public defaultSortOrder?: number;
  public status?: string;

  constructor(private _entity: Partial<ProductLineEntity> = {}) {
    Object.assign(this, _entity);
  }
}
