import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisUiBase } from '../polaris-ui-base';
import { PolarisChip } from '../polaris-chip';
import { PolarisChipListItem } from './polaris-chip-list-item.class';

@Component({
    selector: 'polaris-chip-list',
    imports: [CommonModule, PolarisChip],
    templateUrl: './polaris-chip-list.component.html',
    styleUrl: './polaris-chip-list.component.scss'
})
export class PolarisChipList<T> extends PolarisUiBase {
  @Input() chips: PolarisChipListItem<T>[] = [];
  @Output() onChipSelect: EventEmitter<PolarisChipListItem<T>> = new EventEmitter<PolarisChipListItem<T>>();

  public onChipChange(chip: PolarisChipListItem<T>): void {
    chip.selected = !chip.selected;
    this.onChipSelect.emit(chip);
  }
}
