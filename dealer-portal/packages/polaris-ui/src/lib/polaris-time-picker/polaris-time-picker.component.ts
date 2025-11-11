import { CommonModule, DatePipe } from '@angular/common';
import { PolarisUiFormBase } from '../polaris-ui-form-base';
import { Component, OnInit } from '@angular/core';
import { PolarisIcon } from '../polaris-icon';
import { PolarisIconButton } from '../polaris-icon-button';
import { FormControl, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { OverlayModule } from '@angular/cdk/overlay';
import { PolarisTimePickerDialog } from './polaris-time-picker-dialog/polaris-time-picker-dialog.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DatetimeService, isPolarisTime, Meridiem, PolarisTime, ValidationService } from '@dealer-portal/polaris-core';

@UntilDestroy()
@Component({
  selector: 'polaris-time-picker',
  imports: [
    CommonModule,
    PolarisIcon,
    PolarisIconButton,
    MatInputModule,
    ReactiveFormsModule,
    OverlayModule,
    PolarisTimePickerDialog,
  ],
  providers: [DatePipe],
  templateUrl: './polaris-time-picker.component.html',
  styleUrl: './polaris-time-picker.component.scss',
})
export class PolarisTimePicker<T> extends PolarisUiFormBase<T> implements OnInit {
  /**
   * Indicates whether the time picker dialog is open.
   */
  public isTimePickerOpen = false;

  /**
   * Form control for displaying the selected time.
   */
  public displayedTimeFormControl: FormControl;

  /**
   * Stores the last valid time selected.
   */
  public lastValidTime?: PolarisTime;

  private initializing: boolean = true;

  constructor(
    private _datePipe: DatePipe,
    private _datetimeService: DatetimeService,
    formGroupDirective: FormGroupDirective,
    private _validationService: ValidationService,
  ) {
    super(formGroupDirective);

    this.displayedTimeFormControl = new FormControl<string>('', [
      this._validationService.orValidator([
        this._validationService.time12HourValidator(),
        this._validationService.time24HourValidator(),
      ]),
    ]);

    this.displayedTimeFormControl.valueChanges.pipe(untilDestroyed(this)).subscribe((timeString) => {
      if (this.initializing) return;
      if (timeString) {
        const parsedTime: PolarisTime | null = this.validateAndParseTime(timeString, true);
        this.lastValidTime = parsedTime ?? undefined;
        this.formControl.setValue(parsedTime);
      } else {
        this.formControl.setValue(null);
      }
      this.formControl.markAsDirty();
      this.formControl.markAsTouched();
      this.formControl.updateValueAndValidity();
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();

    if (this.formControl && this.formControl.value && isPolarisTime(this.formControl.value)) {
      this.onSelectDate(this.formControl.value);
    }
    this.initializing = false;
  }

  /**
   * Opens the time picker dialog.
   * @param event - The mouse event that triggered the opening.
   */
  public openTimePicker(event: MouseEvent): void {
    this.isTimePickerOpen = true;
    event.stopPropagation();
  }

  /**
   * Closes the time picker dialog.
   */
  public closeTimePicker(): void {
    this.isTimePickerOpen = false;
  }

  /**
   * Handles the selection of a time from the time picker dialog.
   * @param time - The selected time.
   */
  public onSelectDate(time: PolarisTime): void {
    this.displayedTimeFormControl.setValue(
      this._datePipe.transform(this._datetimeService.convertTimeToDateTime(time), 'hh:mm a'),
    );
    this.closeTimePicker();
  }

  /**
   * Validates and parses a time string.
   * @param timeString - The time string to validate and parse.
   * @param allow24HourTime - Whether to allow 24-hour time format.
   * @returns The parsed time object or null if invalid.
   */
  public validateAndParseTime(timeString: string, allow24HourTime: boolean = false): PolarisTime | null {
    let match: RegExpMatchArray | null = this._validationService.time12HourRegex.exec(timeString);
    if (match) {
      const hours: number = parseInt(match[1], 10);
      const minutes: number = parseInt(match[2], 10);
      const period: Meridiem = match[3].toUpperCase() as Meridiem;

      return { hours, minutes, period };
    }

    if (allow24HourTime) {
      match = this._validationService.time24HourRegex.exec(timeString);
      if (match) {
        let hours: number = parseInt(match[1], 10);
        const minutes: number = parseInt(match[2], 10);
        const period: Meridiem = hours >= 12 ? 'PM' : 'AM';
        if (hours === 0) {
          hours = 12;
        } else if (hours > 12) {
          hours -= 12;
        }

        return { hours, minutes, period };
      }
    }

    return null;
  }
}
