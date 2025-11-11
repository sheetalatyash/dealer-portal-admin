import { FormControl, FormGroup } from '@angular/forms';
import { ProductLine, ProductLineByFamily } from '@dealer-portal/polaris-core';
import { PolarisGroupOption } from '@dealer-portal/polaris-ui';
import { BaseFilterOptions } from '.';

export class ProductLineFilterOptions extends BaseFilterOptions<ProductLine> {
  constructor(filters?: ProductLineByFamily[], formGroup?: FormGroup) {
    const productLines: ProductLine[] = [];
    filters?.forEach((item) => {
      item.productLines?.forEach((line) => {
        productLines.push(line);
      });
    });
    super(productLines);

    // TODO: visual design changes the list to family / lines instead of flat list below...
    productLines?.forEach((line) => {
      this.options?.push(
        new PolarisGroupOption<ProductLine>({
          data: line,
          label: `${line.productFamily} - ${line.description}`,
          value: line.name,
          formControlName: line.name,
        })
      );
      formGroup?.addControl(line.name ?? 'tbd', new FormControl(false));
    });
  }
}
