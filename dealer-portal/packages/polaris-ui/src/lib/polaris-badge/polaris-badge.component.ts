import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisUiBase } from '../polaris-ui-base';
import { PolarisBadgeColor, PolarisBadgeSizeSquare } from './_enums';

@Component({
    selector: 'polaris-badge',
    imports: [CommonModule],
    templateUrl: './polaris-badge.component.html',
    styleUrl: './polaris-badge.component.scss'
})
export class PolarisBadge extends PolarisUiBase {
  /**
   * Represents the color applied to a Polaris badge component.
   * This variable specifies the visual appearance of the badge using
   * a pre-defined value from the PolarisBadgeColor enumeration.
   *
   * The color property determines the badge's styling and visual priority.
   */
  @Input() color: PolarisBadgeColor = PolarisBadgeColor.Primary;

  /**
   * Represents the size of a square badge in the Polaris design system.
   *
   * This optional property determines the specific dimensions of the badge
   * when given a size value. It adheres to the `PolarisBadgeSizeSquare` type,
   * which defines the allowed size options for square badges within the UI.
   */
  @Input() sizeSquare?: PolarisBadgeSizeSquare;

  /**
   * Gets the CSS class pertaining to the badge color based on the current color value.
   *
   * @return {string} The CSS class name for the badge color, formatted as `polaris-badge-color-{color}`.
   */
  public get badgeColorClass(): string {
    return `polaris-badge-color-${this.color as string}`;
  }

  /**
   * Retrieves the CSS class name for the badge size based on a square size property.
   * The class name is dynamically constructed if `sizeSquare` is defined.
   *
   * @return {string} The CSS class name for the badge size when `sizeSquare` is set; otherwise, an empty string.
   */
  public get badgeSizeClass(): string {
    return this.sizeSquare ? `polaris-badge-size-square-${this.sizeSquare}` : '';
  }
}
