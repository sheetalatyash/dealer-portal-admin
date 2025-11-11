import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  OnChanges,
  OnInit,
  SimpleChange,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ControlEvent, FormControl, ReactiveFormsModule, ValueChangeEvent } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatLabel } from '@angular/material/form-field';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs';
import { PolarisDivider } from '../polaris-divider';
import { PolarisError } from '../polaris-error';
import { PolarisIcon } from '../polaris-icon';
import { PolarisGroupOption, PolarisUiFormBase } from '../polaris-ui-form-base';
import { PolarisCheckbox } from '../polaris-checkbox';

@UntilDestroy()
@Component({
    selector: 'polaris-checkbox-group',
  imports: [
    CommonModule,
    MatLabel,
    MatCheckboxModule,
    ReactiveFormsModule,
    PolarisDivider,
    PolarisIcon,
    PolarisCheckbox,
    PolarisError,
  ],
    templateUrl: './polaris-checkbox-group.component.html',
    styleUrl: './polaris-checkbox-group.component.scss',
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ]
})
export class PolarisCheckboxGroup<T> extends PolarisUiFormBase<T> implements OnInit, OnChanges {
  /**
   * An array of checkbox options.
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
    * Whether to display icons next to each option.
    * @default true
    */
  @Input() public displayReadonlyIcons: boolean = true;

  /**
   * Whether to display dividers between options in stacked view (vertical orientation).
   * @default false
   */
  @Input() public dividers: boolean = false;

  /**
   * Whether to display the "Select All" checkbox.
   * @default false
   */
  @Input() public showSelectAll: boolean = false;

  /**
   * The label for the "Select All" checkbox.
   * This is where you would input the translated value
   * @default 'Select All'
   */
  @Input() public selectAllLabel: string = 'Select All';

  /**
   * Whether to show the select-all checkbox as a header.
   * @default false
   */
  @Input() public showSelectAllAsHeader: boolean = false;

  /**
   * A custom class to override the default gap class.
   */
  @Input() public optionGap: number = 2;

  /**
   * The label position for the individual checkbox elements.
   * @default 'after'
   */
  @Input() public labelPosition: 'before' | 'after' = 'after';

  /**
   * The CSS class or classes to apply to the checkbox wrapper.
   * containing the label and checkbox itself
   *
   * @type {string}
   * @default ''
   */
  @Input() public checkboxWrapperClass: string = '';

  /**
   * The CSS class or classes to apply to the checkbox.
   *
   * @type {string}
   * @default ''
   */
  @Input() public checkboxClass: string = '';

  /**
   * Flag to expand the checkboxes to full width
   */
  @Input() public checkboxFullWidth: boolean = false;

  /**
   * The orientation class of the checkbox group.
   * Set via the `ui-orientation` attribute.
   * @default 'align-items-center'
   */
  public orientationClass: string = 'align-items-center';

  /**
   * The form control for the "Select All" checkbox.
   * @default new FormControl(false)
   */
  public selectAllFormControl: FormControl = new FormControl(false);

  /**
   * The minimum width for the checkbox options.
   * @default 'unset'
   */
  public optionMinWidth: string = 'unset';

  /**
   * Initializes the component.
   */
  public override ngOnInit(): void {
    super.ngOnInit();
    this._setCheckBoxGroupOrientationClass();
    this._subscribeToFormGroupEvents();
    this._subscribeToFormGroupStatus();
    this._subscribeToSelectAllFormControlEvents();
    this._syncSelectAllState();
  }

  /**
   * Sets the orientation class based on the provided `ui-orientation` attribute.
   *
   * @returns {void} This function does not return a value.
   */
  public ngOnChanges(changes: Record<string, SimpleChange>): void {
    const optionsChanges: SimpleChange = changes['options'];

    if (optionsChanges && optionsChanges.currentValue) {
      this.options = optionsChanges.currentValue;
      this._setMinWidth();
    }
  }

  /**
   * Updates the selectAllFormControl based on current checkbox values.
   */
  private _syncSelectAllState(): void {
    if (this.showSelectAll) {
      const controls: Record<string, AbstractControl> = this.formGroup.controls;
      const allSelected: boolean = Object.keys(controls)
        .filter((key: string) => key !== 'selectAll')
        .every((key: string) => controls[key].value === true);

      this.selectAllFormControl.setValue(allSelected, { emitEvent: false });
    }
  }

  /**
   * Sets the minimum width for the checkbox options based on the provided options.
   *
   * This function calculates the maximum minimum width from the options array,
   * ignoring non-numeric values like 'unset'. It updates the `optionMinWidth`
   * property with the calculated value or 'unset' if no valid numeric values are found.
   *
   * @returns {void} This function does not return a value.
   */
  private _setMinWidth(): void {
    if (!this.options?.length) {
      return; // Handle empty or undefined options array
    }

    // Extract numeric values while filtering out non-numeric values like 'unset'
    const numericMinWidths: number[] = this.options
      .map((option: PolarisGroupOption<T>): string => option.minWidth)
      .filter((width: string): boolean => width !== 'unset') // Ignore 'unset' values
      .map((width: string):number => parseInt(width, 10)) // Convert '95px' → 95 (ignores non-numeric)

    let maxMinWidth: string;

    if (numericMinWidths.length > 0) {
      // Find the maximum numeric value and append 'px'
      maxMinWidth = `${Math.max(...numericMinWidths)}px`;
    } else {
      // Fallback if all values are 'unset' or invalid
      maxMinWidth = 'unset';
    }

    this.optionMinWidth = maxMinWidth;
  }

  /**
   * Sets the CSS classes for the checkbox group's orientation.
   *
   * @description
   * This function updates the `orientationClass` property based on the
   * `orientation` property of the component.
   *
   * @returns {void}
   *
   * @note
   * The `orientationClass` is set to 'align-items-center' when the `orientation`
   * property is 'horizontal', and 'align-items-start flex-column' otherwise.
   */
  private _setCheckBoxGroupOrientationClass(): void {
    this.orientationClass = this.orientation === 'horizontal' ? 'align-items-center' : 'align-items-start flex-column';
  }

  /**
   * Subscribes to form group events and handles error messages.
   *
   * This function sets up a subscription to the form group's events using RxJS.
   * When an event occurs, it checks if the form group is invalid.
   * If it is, it calls the `getErrorMessages` method with the form group's errors.
   * The subscription is automatically cleaned up when the component is destroyed.
   *
   * @returns {void}
   */
  private _subscribeToFormGroupEvents(): void {
    this.formGroup.events.pipe(
      tap((event: ControlEvent): void => {
        if (event instanceof ValueChangeEvent && this.onSelectionChange.observed) {
          this.onSelectionChange.emit(event);
        }

        this._syncSelectAllState();

      }),
      untilDestroyed(this),
    ).subscribe();
  }

  private _subscribeToFormGroupStatus(): void {
    this.formGroup.statusChanges.pipe(
      tap((): void => {
        this.getErrorMessages(this.formGroup.errors);
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  /**
   * Subscribes to changes in the 'select all' form control and updates all checkbox controls accordingly.
   *
   * This function listens for value changes on the `selectAllFormControl`.
   * When the value changes, it iterates over all controls in the form group,
   * setting each control's value to match the 'select all' control's value.
   * It also updates the validity of each control without emitting additional events.
   * The subscription is automatically cleaned up when the component is destroyed.
   *
   * @returns {void} This function does not return a value.
   */
  private _subscribeToSelectAllFormControlEvents(): void {
    this.selectAllFormControl.valueChanges.pipe(
      tap((value: boolean): void => {
        Object.values(this.formGroup.controls).forEach((control: AbstractControl): void => {
          control.patchValue(value, { emitEvent: false });
          control.updateValueAndValidity();
        });
      }),
      untilDestroyed(this)
    ).subscribe();
  }

  /**
   * Gets the form control by name.
   *
   * @param name - The name of the form control to retrieve.
   * @returns The form control associated with the specified name.
   */
  public getFormControl(name: string): FormControl {
    return this.formGroup.controls[name] as FormControl;
  }
}
