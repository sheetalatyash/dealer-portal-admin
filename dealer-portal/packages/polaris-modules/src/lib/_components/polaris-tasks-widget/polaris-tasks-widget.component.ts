import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PolarisBadgeSizeSquare,
  PolarisBadge,
  PolarisHref,
  PolarisUiFormBase,
  PolarisBadgeColor,
} from '@dealer-portal/polaris-ui';
import { TranslatePipe } from '@ngx-translate/core';
import { PolarisBaseWidgetComponent } from '../polaris-base-widget/polaris-base-widget.component';

@Component({
  selector: 'polaris-tasks-widget',
  imports: [
    CommonModule,
    PolarisBadge,
    PolarisHref,
    TranslatePipe,
    PolarisBaseWidgetComponent
  ],
  templateUrl: './polaris-tasks-widget.component.html',
  styleUrl: './polaris-tasks-widget.component.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class PolarisTasksWidget<T> extends PolarisUiFormBase<T> {
  public polarisBadgeSizeSquare: typeof PolarisBadgeSizeSquare = PolarisBadgeSizeSquare;

  public mockData: Record<string, number | string>[] = [
    { count: 11, label: 'Documentation Required' },
    { count: 23, label: 'Placeholder Task 2' },
    { count: 149, label: 'Placeholder Task 3' },
  ];
  protected readonly PolarisBadgeColor = PolarisBadgeColor;
}
