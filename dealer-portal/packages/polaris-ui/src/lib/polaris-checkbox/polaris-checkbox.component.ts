import { Component, EventEmitter, HostBinding, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { PolarisIcon } from '../polaris-icon';
import { PolarisUiFormBase } from '../polaris-ui-form-base/polaris-ui-form-base.component';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * A custom checkbox component that extends PolarisUiFormBase functionality.
 * This component wraps Material checkbox with additional Polaris-specific features.
 *
 * @example
 * ```html
 * <polaris-checkbox
 *   [minWidth]="'200px'"
 *   (checkboxUpdated)="onCheckboxChange($event)">
 * </polaris-checkbox>
 * ```
 */
@Component({
    selector: 'polaris-checkbox',
    imports: [
        CommonModule,
        MatCheckboxModule,
        ReactiveFormsModule,
        PolarisIcon,
        TranslatePipe
    ],
    templateUrl: './polaris-checkbox.component.html',
})
export class PolarisCheckbox<T> extends PolarisUiFormBase<T> implements OnChanges {
    /**
     * Defines the minimum width of the checkbox component.
     *
     * @type {string}
     * @default 'unset'
     * @example
     * ```html
     * <!-- Set minimum width to 200 pixels -->
     * <polaris-checkbox [minWidth]="'200px'">...</polaris-checkbox>
     * ```
     */
    @Input() public minWidth: string = 'unset';

    /**
     * Flag to expand the checkbox to full width
     */
    @Input() public fullWidth: boolean = false;

    /**
     * Defines the CSS class or classes to apply to the label element of the checkbox.
     *
     * @type {string}
     * @default ''
     * @example
     * <!-- Apply a custom class to the label -->
     * <polaris-checkbox [labelClass]="'fs-6 fw-bold'">...</polaris-checkbox>
     *
     */
    @Input() public labelClass: string = '';

    /**
     * If true, displays an 'optional' label next to the checkbox label.
     *
     * @type {boolean}
     * @default false
     * @example
     * <!-- Displays ' (Optional)' next to the provided label -->
     * <polaris-checkbox [optional]="true">...</polaris-checkbox>
     */
    @Input() public optional: boolean = false;

    /**
     * Emits when the checkbox state changes.
     *
     * @type {EventEmitter<MatCheckboxChange>}
     * @event
     * @example
     * ```typescript
     * // Subscribe to checkbox changes
     * checkbox.checkboxUpdated.subscribe((event: MatCheckboxChange) => {
     *   console.log('Checkbox checked:', event.checked);
     * });
     * ```
     */
    @Output() public checkboxUpdated: EventEmitter<MatCheckboxChange> = new EventEmitter<MatCheckboxChange>();

    /**
     * Emits when the tooltip is clicked.
     *
     * @type {EventEmitter<void>}
     * @event
     * @example
     * ```typescript
     * // Subscribe to tooltip click events
     * checkbox.tooltipClicked.subscribe(() => {
     *  console.log('Tooltip clicked:');
     * });
     * ```
     */
    @Output('onTooltipClicked') public tooltipClicked: EventEmitter<void> = new EventEmitter<void>();

  /**
   * The label position for the individual checkbox elements.
   * @default 'after'
   */
  @Input() public labelPosition: 'before' | 'after' = 'after';

  /**
   * Conditionally add w-100 to the host element if fullWidth is true
   */
  @HostBinding('class.w-100')
  public get applyFullWidth(): boolean {
    return this.fullWidth;
  }


  /**
   * Lifecycle hook that is called when any data-bound property of a directive changes.
   * It reconciles any conflicts that may arise due to updates to the `ui-disabled` state
   * of the bound PolarisGroupOption and applies it the form control.
   *
   * @param {SimpleChanges} changes - An object of key-value pairs where the key is the property name
   *                                   and the value is the current and previous state of the property.
   *                                   This is used to detect changes in the `disabled` property.
   * @return {void} Does not return a value.
   * TODO: Turn this into a PolarisUiFormBase method for consistency.
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['disabled'] || changes['formControl']) && this.formControl) {
      const shouldBeDisabled: boolean = this.disabled || this.formControl.disabled;

      if (shouldBeDisabled && !this.formControl.disabled) {
        this.formControl.disable({ emitEvent: false });
      } else if (!shouldBeDisabled && this.formControl.disabled) {
        this.formControl.enable({ emitEvent: false });
      }
    }
    }

    /**
     * Emits the checkbox state change event.
     *
     * @param {MatCheckboxChange} event - The checkbox change event containing the new state
     * @returns {void}
     * @example
     * ```html
     * <!-- Handle checkbox change -->
     * <mat-checkbox (change)="emitCheckboxUpdate($event)">...</mat-checkbox>;
     * ```
     */
    public emitCheckboxUpdate(event: MatCheckboxChange): void {
        this.checkboxUpdated.emit(event);
    }


  /**
   * Emits the tooltip clicked event.
   *
   * @param {MouseEvent} event - The tooltip clicked event
   * @returns {void}
   * @example
   * ```html
   * <!-- Handle tooltip clicked -->
   * <polaris-icon (click)="onTooltipClicked($event)">info</polaris-icon>;
   * ```
   */
    public onTooltipClicked(event: MouseEvent): void {
      // Do not activate surrounding textbox when clicked
      event.stopPropagation();
      event.preventDefault();

      this.tooltipClicked.emit();
    }
}
