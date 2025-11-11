import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisUiBase } from '../polaris-ui-base';

/**
 * Component representing a tooltip in the Polaris UI library.
 *
 * This component is essentially a wrapper for the tooltip string provided by the user.
 * This component does not have any functionality other than to display the provided tooltip content.
 * Please see the PolarisTooltipDirective for more detailed usage.
 *
 * @note strings are sanitized by Angular to prevent potential XSS attacks.
 * @note strings will render as HTML, not as plain text.
 */
@Component({
    selector: 'polaris-tooltip',
    imports: [CommonModule],
    templateUrl: './polaris-tooltip.component.html',
    styleUrl: './polaris-tooltip.component.scss'
})
export class PolarisTooltip extends PolarisUiBase {
  /**
   * The HTML content to be displayed inside the tooltip.
   *
   * @type {string}
   */
  @Input() htmlContent: string = '';
}
