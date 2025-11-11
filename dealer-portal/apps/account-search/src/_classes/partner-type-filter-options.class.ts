import { FormControl, FormGroup } from '@angular/forms';
import { PartnerType } from '@dealer-portal/polaris-core';
import { PolarisGroupOption } from '@dealer-portal/polaris-ui';
import { BaseFilterOptions } from '.';

export class PartnerTypeFilterOptions extends BaseFilterOptions<PartnerType> {
  constructor(filters?: PartnerType[], formGroup?: FormGroup) {
    super(filters);

    filters?.forEach((item) => {
      this.options?.push(
        new PolarisGroupOption<PartnerType>({
          data: item,
          label: item.name,
          value: item.name,
          formControlName: item.name,
        })
      );
      formGroup?.addControl(item.name ?? '', new FormControl(false));
    });
  }
}
