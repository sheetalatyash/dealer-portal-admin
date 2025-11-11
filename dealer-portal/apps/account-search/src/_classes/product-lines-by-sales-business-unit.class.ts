import { ProductLineByBusinessUnit } from "packages/polaris-core/src/lib/_services/core/_classes/product-line-by-business-unit.class";

export class ProductLinesBySalesBusinessUnit {
  salesBusinessUnit?: string;
  salesBusinessSort?: number;
  productLines: string[] = [];

  constructor(private _entity: Partial<ProductLineByBusinessUnit> = {}) {
    Object.assign(this, _entity);
    this.productLines = _entity?.productLines?.map(productLine => productLine.description).filter((description): description is string => typeof description === 'string') ?? [];
  }
}
