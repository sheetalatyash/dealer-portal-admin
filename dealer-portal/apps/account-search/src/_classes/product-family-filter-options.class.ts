import { FormControl, FormGroup } from '@angular/forms';
import { ProductLineByFamily } from '@dealer-portal/polaris-core';
import { BaseFilterOptions } from '.';
import { PolarisGroupOption } from '@dealer-portal/polaris-ui';

export class ProductFamilyFilterOptions extends BaseFilterOptions<ProductLineByFamily> {

  constructor(filters?: ProductLineByFamily[], formGroup?: FormGroup) {
    super(filters);

    filters?.forEach((family) => {
      const familyName = family.productFamily ?? '';
      this.options?.push(
        new PolarisGroupOption<ProductLineByFamily>({
          data: family,
          label:  familyName,
          value: familyName,
          formControlName: familyName,
        })
      );
      formGroup?.addControl(familyName, new FormControl(false));
    });
  }
}
