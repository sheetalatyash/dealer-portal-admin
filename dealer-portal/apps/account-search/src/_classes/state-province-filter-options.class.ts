import { FormControl, FormGroup } from '@angular/forms';
import { StateProvince } from '@dealer-portal/polaris-core';
import { PolarisGroupOption } from '@dealer-portal/polaris-ui';
import { BaseFilterOptions } from '.';

export class StateProvinceFilterOptions extends BaseFilterOptions<StateProvince> {
  constructor(private _filters?: StateProvince[], private _formGroup?: FormGroup) {
    super(_filters);

    _filters?.forEach((item) => {
      this.options?.push(
        new PolarisGroupOption<StateProvince>({
          data: item,
          label: item.name,
          value: item.name,
          formControlName: item.name
        })
      );
      _formGroup?.addControl(item.name ?? '', new FormControl(false));
    });
  }
}
