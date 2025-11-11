import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisUiFormBase } from '../polaris-ui-form-base';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { PolarisIcon } from '../polaris-icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { PolarisIconButton } from '../polaris-icon-button';

@Component({
    selector: 'polaris-date-picker',
    imports: [
        CommonModule,
        MatLabel,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        PolarisIcon,
        MatDatepickerModule,
        PolarisIconButton,
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './polaris-date-picker.component.html',
    styleUrl: './polaris-date-picker.component.scss'
})
export class PolarisDatePicker<T> extends PolarisUiFormBase<T> {
  /**
   * The minimum selectable date.
   * @type {Date | null}
   */
  @Input() minDate: Date | null = null;

  /**
   * The maximum selectable date.
   * @type {Date | null}
   */
  @Input() maxDate: Date | null = null;

  /**
   * A function to filter selectable dates.
   * @type {(date: Date | null) => boolean}
   *
   * @example
   * weekdaysOnly(date: Date | null): boolean {
   *    if (!date) {
   *        return false;
   *    }
   *    const day = date.getDay();
   *    // 0 = Sunday, 6 = Saturday
   *    return day !== 0 && day !== 6;
   *  }
   */
  @Input() dateFilter: (date: Date | null) => boolean = () => true;
}
