import { FormControl, FormGroup } from '@angular/forms';
import { Country } from '@dealer-portal/polaris-core';
import { PolarisGroupOption } from '@dealer-portal/polaris-ui';
import { BaseFilterOptions } from '.';

export class CountryFilterOptions extends BaseFilterOptions<Country> {
  constructor(filters?: Country[], formGroup?: FormGroup) {
    super(filters);

    filters?.forEach((item) => {
      this.options?.push(
        new PolarisGroupOption<Country>({ data: item, label: item.name, value: item.name, formControlName: item.name })
      );
      formGroup?.addControl(item.name ?? '', new FormControl(false));
    });
  }
}
