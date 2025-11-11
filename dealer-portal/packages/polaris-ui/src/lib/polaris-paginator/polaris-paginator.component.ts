import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisButton } from '../polaris-button';
import { PolarisUiBase } from '../polaris-ui-base';

@Component({
    selector: 'polaris-paginator',
    imports: [
        CommonModule,
        PolarisButton,
    ],
    templateUrl: './polaris-paginator.component.html',
    styleUrl: './polaris-paginator.component.scss'
})
export class PolarisPaginator extends PolarisUiBase {
  @Input() displayedElements: number = 0;
  @Input() maxElements: number = 0;

  @Output('onLoadMore') loadMoreEmitter: EventEmitter<void> = new EventEmitter<void>();

  public onLoadMore(): void {
    this.loadMoreEmitter.emit();
  }
}
