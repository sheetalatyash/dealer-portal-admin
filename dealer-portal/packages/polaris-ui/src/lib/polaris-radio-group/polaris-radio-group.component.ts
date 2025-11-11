import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLabel } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { PolarisError } from '../polaris-error';
import { PolarisIcon } from '../polaris-icon';
import { PolarisGroupOption, PolarisUiFormBase } from '../polaris-ui-form-base';

/**
 * @description A component for rendering a group of radio buttons.
 *
 * @template T - The TYPE of the custom 'data' field in the PolarisGroupOption Object.
 *
 *
 * @example
 * <polaris-radio-group
 *    ui-label="Select permissions based on:"
 *    [options]="newPermissionsOptions"
 *    [ui-form-control]="newPermissionsFormControl"
 *    ui-orientation="vertical">
 * </polaris-radio-group>
 *
 *
 * @note PolarisRadioGroup uses the PolarisUiBase component to inherit its base styles and properties.
 *
 * @note PolarisRadioGroup uses the ReactiveFormsModule to handle form control functionality.
 *
 * @note PolarisRadioGroup uses the MatLabel and MatRadioModule to provide the necessary UI components.
 *
 */
@Component({
    selector: 'polaris-radio-group',
  imports: [
    CommonModule,
    MatLabel,
    MatRadioModule,
    ReactiveFormsModule,
    PolarisIcon,
    PolarisError,
  ],
    templateUrl: './polaris-radio-group.component.html',
    styleUrl: './polaris-radio-group.component.scss'
})
export class PolarisRadioGroup<T> extends PolarisUiFormBase<T> implements OnInit {
  /**
   * An array of radio button options.
   */
  @Input() public options: PolarisGroupOption<T>[] = [];

  /**
   * Whether to display truthy values as a checkmark (✔) icon
   * @default true
   */
  @Input() public displayTruthyValues: boolean = true;

  /**
   * Whether to display falsy values as a close (✖) icon
   * @default false
   */
  @Input() public displayFalsyValues: boolean = false;

  /**
   * The justify-content value for radio buttons' content.
   * @default 'center'
   */
  @Input() public justifyButtonContent: string = 'center';

  /**
   * A boolean flag that determines whether a specific element or functionality
   * should be hidden when it is disabled.
   *
   * When set to `true`, the associated element or functionality will be
   * hidden if it is not enabled or active. Defaults to `false`, meaning
   * the disabled state will not affect the visibility of the element.
   *
   * @type {boolean}
   */
  @Input() public hideIfDisabled: boolean = false;

  /**
   * The orientation of the radio buttons.
   * typically a bootstrap class like 'flex-column' or 'align-items-center'
   * @type {string | undefined}
   * @default undefined
   *
   * @note defaults to undefined, so that if a custom class is not provided,
   * it will be set based on the orientation property.
   */
  @Input() public orientationClass: string | undefined = undefined;
  public labelOrientationClass: string = 'align-items-start flex-column';

  /**
   * The label position relative to the individual radio buttons.
   * Can be either 'top', 'bottom', 'left', or 'right'.
   * @default 'right'
   * @type {'top' | 'bottom' | 'left' | 'right'}
   */
  @Input() public labelPosition: 'top' | 'bottom' | 'left' | 'right' = 'right';

  /**
   * The alignment of the actual radio button and label.
   * Can be either 'start', 'center', or 'end'.
   * @type {'start' | 'center' | 'end'}
   * @default 'center'
   *
   * @note This is used specifically to override the '.mdc-form-field' align-items-* class
   * set by Angular Material, in a clean and non-intrusive manner.
   */
  @Input() public alignItems: 'start' | 'center' | 'end' = 'center';


  /**
   * Initializes the component.
   */
  public override ngOnInit(): void {
    super.ngOnInit();
    this._setRadioGroupOrientationClasses();
  }

  /**
   * Sets the orientation classes for the radio group based on the
   * `stackLabel` and `orientation` properties.
   *
   * If `stackLabel` is true, the label orientation class is set to
   * 'align-items-start flex-column', otherwise it is set to 'align-items-center'.
   *
   * If `orientationClass` is not already defined, it is set based on the
   * `orientation` property: 'align-items-center' for 'horizontal' and
   * 'align-items-start flex-column' for 'vertical'.
   */
  public _setRadioGroupOrientationClasses(): void {
    this.labelOrientationClass = this.stackLabel ? 'align-items-start flex-column' : 'align-items-center';

    if (!this.orientationClass) {
      this.orientationClass = this.orientation === 'horizontal' ? 'align-items-center' : 'align-items-start flex-column';    }
  }
}
