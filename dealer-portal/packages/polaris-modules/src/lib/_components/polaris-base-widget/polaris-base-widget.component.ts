import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisHref, PolarisIcon } from '@dealer-portal/polaris-ui';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'lib-polaris-base-widget',
  imports: [
    CommonModule,
    PolarisHref,
    PolarisIcon,
    TranslatePipe,
  ],
  templateUrl: './polaris-base-widget.component.html',
  styleUrl: './polaris-base-widget.component.scss',
})
export class PolarisBaseWidgetComponent {
  @Input() showRefresh: boolean = true;
  @Input() showDescription: boolean = false;
  @Input() blueBorder: boolean = false;

  @Output() refreshWidget: EventEmitter<void> = new EventEmitter<void>();

  public emitRefreshEvent(): void {
    this.refreshWidget.emit();
  }
}
