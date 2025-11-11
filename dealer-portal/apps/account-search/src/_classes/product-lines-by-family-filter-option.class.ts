import { FormControl, FormGroup } from '@angular/forms';
import { ProductLine } from '@dealer-portal/polaris-core';
import { PolarisGroupOption } from '@dealer-portal/polaris-ui';
import { BaseFilterOptions } from '.';

export class ProductLinesByFamilyFilterOptions extends BaseFilterOptions<ProductLine> {

  public productFamily: string = '';

  constructor(family: string, filters: ProductLine[], formGroup?: FormGroup) {
    super(filters);

    this.productFamily = family;
    filters?.forEach((line) => {
      this.options?.push(
        new PolarisGroupOption<ProductLine>({
          data: line,
          label: line.description,
          value: line.name,
          formControlName: line.name,
        })
      );
      formGroup?.addControl(line.name ?? '', new FormControl(false));
    });
  }
}
