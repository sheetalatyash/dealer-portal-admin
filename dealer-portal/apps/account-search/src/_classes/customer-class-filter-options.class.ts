import { FormControl, FormGroup } from '@angular/forms';
import { CustomerClass } from '@dealer-portal/polaris-core';
import { PolarisGroupOption } from '@dealer-portal/polaris-ui';
import { BaseFilterOptions } from '.';

export class CustomerClassFilterOptions extends BaseFilterOptions<CustomerClass> {

  constructor(filters?: CustomerClass[], defaultCustomerClasses?: string[], formGroup?: FormGroup) {
    super(filters);

    filters?.forEach((item) => {
      this.options?.push(
        new PolarisGroupOption<CustomerClass>({
          data: item,
          label: `${item.id} (${item.name})`,
          value: item.id,
          formControlName: item.id,
        })
      );

      // default class codes initially selected
      formGroup?.addControl(
        item.id ?? '',
        new FormControl(defaultCustomerClasses?.includes(item.id)));
    });
  }

}
