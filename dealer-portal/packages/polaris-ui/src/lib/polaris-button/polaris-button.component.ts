import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { PolarisUiBase } from '../polaris-ui-base';

/**
 * This class represents a Polaris button component. It extends the base Polaris UI component and
 * applies the appropriate theme class to the button based on the provided theme.
 *
 * @example
 * <polaris-button ui-theme="secondary">Click Me</polaris-button>
 */
@Component({
    selector: 'polaris-button',
    imports: [
        CommonModule,
        MatButtonModule,
    ],
    templateUrl: './polaris-button.component.html',
    styleUrl: './polaris-button.component.scss'
})
export class PolarisButton extends PolarisUiBase implements OnInit {
  /**
   * Whether to use the compact version of the button.
   * @type {boolean}
   * @default false
   */
  @Input() compact: boolean = false;

  /**
   * The CSS class representing the button's theme.
   * Initialized to 'polaris-button-theme-primary'.
   */
  public buttonThemeClass: string = 'polaris-button-theme-primary';

  /**
   * Angular lifecycle hook that is called when the component is initialized.
   * Calls the private method `_setButtonThemeClass` to set the button's theme class.
   */
  public ngOnInit(): void {
    this._setButtonThemeClass();
  }

  /**
   * Private method that sets the button's theme class based on the provided theme
   * and compact mode. The theme class is constructed by concatenating
   * 'polaris-button-theme-' with the theme value, and optionally adding
   * 'polaris-button-compact' if compact is true.
   */
  private _setButtonThemeClass(): void {
    const classes: string[] = [`polaris-button-theme-${this.theme}`];

    if (this.compact) {
      classes.push('polaris-button-compact');
    }

    this.buttonThemeClass = classes.join(' ');
  }
}
