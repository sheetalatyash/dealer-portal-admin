import { FormControl, FormGroup } from '@angular/forms';
import { PolarisGroupOption } from '@dealer-portal/polaris-ui';
import { BaseFilterOptions } from '.';
import { Status } from './status.class';

export class StatusFilterOptions extends BaseFilterOptions<Status> {
  constructor(filters?: Status[], formGroup?: FormGroup) {
    super(filters);

    filters?.forEach((item) => {
      this.options?.push(
        new PolarisGroupOption<Status>({
          data: item,
          label: item.name,
          value: item.id,
          formControlName: item.id,
        })
      );
      formGroup?.addControl(item.id ?? '', new FormControl(false));
    });
  }
}
