import { Component, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { PolarisUiBase } from '../polaris-ui-base';
import { PolarisCardActionsDirective, PolarisCardSubtitleDirective, PolarisCardTitleDirective } from './_directives';

@Component({
  selector: 'polaris-card',
  imports: [
    CommonModule,
    MatCardModule,
  ],
  templateUrl: './polaris-card.component.html',
  styleUrl: './polaris-card.component.scss',
})
export class PolarisCard extends PolarisUiBase {
  @ContentChild(PolarisCardTitleDirective) title?: PolarisCardTitleDirective;
  @ContentChild(PolarisCardSubtitleDirective) subtitle?: PolarisCardSubtitleDirective;
  @ContentChild(PolarisCardActionsDirective) actions?: PolarisCardActionsDirective;
}
