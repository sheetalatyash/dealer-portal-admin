import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisUiBase } from '../polaris-ui-base';
import { MatChipsModule } from '@angular/material/chips';
import { PolarisIcon } from '../polaris-icon';

@Component({
    selector: 'polaris-chip',
    imports: [CommonModule, MatChipsModule, PolarisIcon],
    templateUrl: './polaris-chip.component.html',
    styleUrl: './polaris-chip.component.scss'
})
export class PolarisChip extends PolarisUiBase {
  @Input() selectable = true;
  @Input() isSelected = false;
  @Output() selectionChange = new EventEmitter<boolean>();

  public onChipClicked(): void {
    if (this.selectable) {
      this.isSelected = !this.isSelected;
      this.selectionChange.emit(this.isSelected);
    }
  }
}
