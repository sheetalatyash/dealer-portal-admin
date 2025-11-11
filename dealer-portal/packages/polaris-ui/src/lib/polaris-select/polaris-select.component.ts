import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { UntilDestroy } from '@ngneat/until-destroy';
import { BehaviorSubject, Observable } from 'rxjs';
import { PolarisGroupOption, PolarisUiFormBase } from '../polaris-ui-form-base';

@UntilDestroy()
@Component({
  selector: 'polaris-select',
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule],
  templateUrl: './polaris-select.component.html',
  styleUrl: './polaris-select.component.scss',
})
export class PolarisSelect<T> extends PolarisUiFormBase<T> implements OnInit, OnChanges {
  /**
   * An array of options for the select input.
   */
  @Input() public options: PolarisGroupOption<T>[] = [];

  /**
   * Defines the width of the dropdown.
   * 'auto' - The dropdown width will grow to fit the width of the select input.
   * 'fitContent' - The dropdown width will grow to fit the size of the largest option.
   */
  @Input() public dropdownWidth: string | number = 'fitContent';

  /**
   * Observable Options so that we can filter/dedupe etc. before displaying to the user.
   */
  private _options: BehaviorSubject<PolarisGroupOption<T>[]> = new BehaviorSubject<PolarisGroupOption<T>[]>([]);
  public options$: Observable<PolarisGroupOption<T>[]> = this._options.asObservable();

  /**
   * A lifecycle hook method that is called after the component's data-bound properties are initialized.
   * It performs the following tasks:
   * - Calls the parent class's `ngOnInit` method to ensure inherited initialization is executed.
   * - Sets up initial options using the `_setOptions` method.
   * - Subscribes to control-related events using the `_subscribeToControlEvents` method.
   *
   * @return {void} This method does not return a value.
   */
  public override ngOnInit(): void {
    super.ngOnInit();
    this._setOptions(this.options);
  }

  /**
   * A lifecycle hook that is called when any data-bound property of a directive changes.
   * Specifically, it monitors changes to the 'options' input property and updates
   * the select options when they change using the _setOptions method.
   *
   * @param {SimpleChanges} changes - An object containing all the changed properties with their
   * current and previous values.
   * @return {void} This method does not return a value.k
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this._setOptions(changes['options'].currentValue);
    }
  }

  /**
   * Retrieves the width of the dropdown panel.
   * If the dropdown width is set to 'fitContent', it returns an empty string.
   * Otherwise, it returns the specified dropdown width.
   *
   * @return {string | number} The width of the dropdown panel, either as a string or number.
   */
  public get panelWidth(): string | number {
    if (this.dropdownWidth === 'fitContent') {
      return '';
    }

    return this.dropdownWidth;
  }

  /**
   * Updates the options for the PolarisGroup by filtering out duplicate options.
   *
   * @param {PolarisGroupOption<T>[]} initialOptions - The initial list of options to be set, which may contain duplicates.
   * @return {void} This method does not return a value.
   */
  private _setOptions(initialOptions: PolarisGroupOption<T>[]): void {
    const filteredOptions: PolarisGroupOption<T>[] = initialOptions
      ? this._removeDuplicateOptionsByValue(initialOptions)
      : [];

    this._options.next(filteredOptions);
  }

  /**
   * Removes duplicate options from the provided array based on their `value` property.
   *
   * @param options An array of PolarisGroupOption objects where duplicates are determined by the `value` property.
   * @return A new array of PolarisGroupOption objects with duplicates removed based on the `value` property.
   */
  private _removeDuplicateOptionsByValue(options: PolarisGroupOption<T>[]): PolarisGroupOption<T>[] {
    const seenValues: Set<string | number> = new Set<string | number>();

    return options.filter((option: PolarisGroupOption<T>): boolean => {
      if (seenValues.has(option.value)) {
        return false;
      }

      seenValues.add(option.value);

      return true;
    });
  }
}
