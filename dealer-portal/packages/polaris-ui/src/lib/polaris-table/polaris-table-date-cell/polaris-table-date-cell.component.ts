import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisTableBaseCell } from '../polaris-table-base-cell/polaris-table-base-cell.component';
import { PolarisTableCustomCellDirective } from '../polaris-table-custom-cell.directive';

@Component({
    selector: 'polaris-table-date-cell',
    imports: [CommonModule, PolarisTableCustomCellDirective],
    providers: [{ provide: PolarisTableBaseCell, useExisting: PolarisTableDateCell }],
    templateUrl: './polaris-table-date-cell.component.html',
    styleUrl: './polaris-table-date-cell.component.scss'
})
export class PolarisTableDateCell extends PolarisTableBaseCell {
  @Input('dateFormat') inputFormat: 'short' | 'long' | 'shortTime' | 'longTime' | 'shortDate' | 'longDate' = 'short';

  public get format() {
    switch (this.inputFormat) {
      case 'shortDate':
        return 'MM/dd/yyyy';
      case 'long':
        return 'MM/dd/yyyy h:mm:ss a';
      default:
        return this.inputFormat;
    }
  }
}
