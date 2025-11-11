import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisIcon, PolarisIconSize } from '../polaris-icon';
import { PolarisUiBase } from '../polaris-ui-base';

@Component({
    selector: 'polaris-status-icon',
    imports: [
        CommonModule,
        PolarisIcon,
    ],
    templateUrl: './polaris-status-icon.component.html',
    styleUrl: './polaris-status-icon.component.scss'
})
export class PolarisStatusIcon extends PolarisUiBase {
  @Input() condition: boolean = false;
  @Input() positiveIcon: string = 'check';
  @Input() negativeIcon: string = 'close';
  @Input() positiveColor: string = 'success';
  @Input() negativeColor: string = 'danger';
  @Input() hideIconIfFalsyCondition: boolean = false;
  @Input() hideIcon: boolean = false;
  @Input() size: PolarisIconSize = 'md';

  public get iconName(): string {
    if (this.hideIcon) {
      return '';
    }

    return this.condition ? this.positiveIcon : this.hideIconIfFalsyCondition ? '' : this.negativeIcon;
  }

  public get iconColor(): string {
    return this.condition ? this.positiveColor : this.negativeColor;
  }
}
