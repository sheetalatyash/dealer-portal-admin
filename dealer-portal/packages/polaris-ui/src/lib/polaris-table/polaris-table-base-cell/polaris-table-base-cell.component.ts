import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisTableCustomCellDirective } from '../polaris-table-custom-cell.directive';

@Component({
    selector: 'polaris-table-cell',
    imports: [CommonModule],
    templateUrl: './polaris-table-base-cell.component.html',
    styleUrl: './polaris-table-base-cell.component.scss'
})
export class PolarisTableBaseCell {
  @Input({ required: true }) columnName!: string;
  @Input({ required: true }) key!: string;
  @ViewChild(PolarisTableCustomCellDirective) public tableColumn!: PolarisTableCustomCellDirective;
}
