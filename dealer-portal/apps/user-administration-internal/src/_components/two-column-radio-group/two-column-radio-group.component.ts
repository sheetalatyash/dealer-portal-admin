import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatLabel } from '@angular/material/form-field';
import { PolarisGroupOption, PolarisRadioGroup } from '@dealer-portal/polaris-ui';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [
    PolarisRadioGroup,
    TranslatePipe,
    MatLabel
  ],
  selector: 'uai-two-column-radio-group',
  templateUrl: './two-column-radio-group.component.html',
  styleUrl: './two-column-radio-group.component.scss'
})
export class TwoColumnRadioGroupComponent<T> {

  @Input() label!: string;
  @Input() formControl!: FormControl;
  @Input() options!: PolarisGroupOption<T>[];
}
