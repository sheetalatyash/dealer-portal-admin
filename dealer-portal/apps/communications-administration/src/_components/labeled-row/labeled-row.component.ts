import { Component, Input } from '@angular/core';
import { PolarisDivider } from '../../../../../packages/polaris-ui/src';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [
    PolarisDivider,
    TranslatePipe
  ],
  selector: 'ca-labeled-row',
  templateUrl: './labeled-row.component.html',
  styleUrl: './labeled-row.component.scss'
})
export class LabeledRowComponent {
  @Input() label!: string;
  @Input() showDivider = true;
}
