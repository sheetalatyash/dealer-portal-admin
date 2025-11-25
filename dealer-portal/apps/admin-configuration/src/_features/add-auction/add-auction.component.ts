import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { PolarisGroupOption, PolarisSelect, PolarisDivider } from '@dealer-portal/polaris-ui';
import {
  PolarisButton,
  PolarisDatePicker,
  PolarisInput,
  PolarisIcon,
  PolarisCheckbox,
} from '@dealer-portal/polaris-ui';
import { TranslatePipe } from '@ngx-translate/core';
import { rawAuctionRules, periodRawOptions, laneRawOptions } from '../../_constants/constant';
import { Router } from '@angular/router';

@Component({
  selector: 'ac-add-auction',

  // selector: 'auctions-create-auction',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PolarisButton,
    PolarisDatePicker,
    PolarisInput,
    PolarisCheckbox,
    PolarisSelect,
    PolarisIcon,
    PolarisDivider,
    TranslatePipe,
  ],
  templateUrl: './add-auction.component.html',
  styleUrls: ['./add-auction.component.scss'],

  // templateUrl: './create-auction.component.html',
  // styleUrl: './create-auction.component.scss',
})
export class CreateAuctionComponent implements OnInit {
  auctionForm: FormGroup;
  public periodOptions: PolarisGroupOption<string>[] = [];
  public hourOptions: PolarisGroupOption<string>[] = [];
  public minuteOptions: PolarisGroupOption<string>[] = [];
  public laneOptions: PolarisGroupOption<number>[] = [];
  public auctionRulesOptions: PolarisGroupOption<string>[] = [];

  constructor(private _fb: FormBuilder, private readonly _router: Router) {
    this.auctionForm = this._fb.group({
      auctionName: ['', [Validators.required]],
      numberOfLanes: [1, [Validators.required, Validators.min(1)]],
      laneStagger: [1, [Validators.required, Validators.min(1)]],
      bidIncrement: [100],
      duration: [5, [Validators.required, Validators.max(30)]],
      auctionDate: ['', [Validators.required, this._dateTodayOrFutureValidator()]],
      startHour: ['08', Validators.required],
      startMinute: ['00', Validators.required],
      startPeriod: ['AM', Validators.required],
      auctionRules: [1, Validators.required],
      buyNow: [true],
      countries: [[]],
      dc: [false],
      pl: [false],
    });
  }

  public ngOnInit(): void {
    this._getHourOptions();
    this._getMinuteOptions();
    this._getPeriodOptions();
    this._getLaneOptions();
    this._getAuctionRulesOptions();
  }

  public submitForm(): void {
    if (this.auctionForm.valid) {
      const formValue = this.auctionForm.value;
      this._buildPayload(formValue);
    }
  }

  private _buildPayload(formValue: Record<string, unknown>): Record<string, unknown> {
    const isCustomRule = formValue['auctionRules'] === 4;
    const startDate = this._formatDateToUTC(formValue['auctionDate'] as string);
    const startTime = this._convertTo24HourFormat(
      formValue['startHour'] as string,
      formValue['startMinute'] as string,
      formValue['startPeriod'] as string,
    );

    const basePayload: Record<string, unknown> = {
      title: formValue['auctionName'],
      numberOfLanes: formValue['numberOfLanes'],
      laneIncrementTimeInMinutes: formValue['laneStagger'],
      buyNow: formValue['buyNow'],
      startDate: startDate,
      startTime: startTime,
      timeZone: 'America/Chicago',
      defaultListingDurationMinutes: formValue['duration'],
      defaultMinimumBidIncrement: formValue['bidIncrement'],
    };

    if (isCustomRule) {
      const customFilterSet: Record<string, unknown> = {
        UseStandardDealerProductLineRules: formValue['pl'],
        UseStandardDealerDistributionCenterRules: formValue['dc'],
      };

      if (Array.isArray(formValue['countries']) && formValue['countries'].length > 0) {
        customFilterSet['DealerCountryCode'] = (formValue['countries'] as string[]).join(',');
      }

      basePayload['customFilterSet'] = customFilterSet;
    } else {
      basePayload['preconfiguredFilterSet'] = formValue['auctionRules'];
    }

    return basePayload;
  }

  private _formatDateToUTC(dateInput: string | Date | null | undefined): string {
    if (!dateInput) {
      return '';
    }

    const d = new Date(dateInput);

    if (isNaN(d.getTime())) {
      // handle invalid date gracefully (no console)
      return '';
    }

    return d.toISOString();
  }

  private _convertTo24HourFormat(hour: string, minute: string, period: string): string {
    const inputString = `2000-01-01 ${hour}:${minute}:00 ${period}`;
    const dateObj = new Date(inputString);

    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // ensures 24-hour format
    }).format(dateObj);
  }

  public get isCustomRule(): boolean {
    return this.auctionForm.get('auctionRules')?.value === 4;
  }

  public get dcControl(): FormControl {
    return this.auctionForm.get('dc') as FormControl;
  }

  public get plControl(): FormControl {
    return this.auctionForm.get('pl') as FormControl;
  }

  public get buyNowControl(): FormControl {
    return this.auctionForm.get('buyNow') as FormControl;
  }

  private _getAuctionRulesOptions(): void {
    this.auctionRulesOptions = rawAuctionRules.map(
      (rule) =>
        new PolarisGroupOption<string>({
          value: rule.value,
          label: rule.label,
        }),
    );
  }

  private _getPeriodOptions(): void {
    this.periodOptions = periodRawOptions.map(
      (period) =>
        new PolarisGroupOption<string>({
          value: period.value,
          label: period.label,
        }),
    );
  }
  private _getHourOptions(): void {
    this.hourOptions = Array.from(
      { length: 12 },
      (unused, index) =>
        new PolarisGroupOption<string>({
          value: (index + 1).toString().padStart(2, '0'),
          label: (index + 1).toString().padStart(2, '0'),
        }),
    );
  }

  private _getMinuteOptions(): void {
    this.minuteOptions = Array.from(
      { length: 60 },
      (unused, index) =>
        new PolarisGroupOption<string>({
          value: index.toString().padStart(2, '0'),
          label: index.toString().padStart(2, '0'),
        }),
    );
  }

  private _getLaneOptions(): void {
    this.laneOptions = laneRawOptions.map(
      (lane) =>
        new PolarisGroupOption<number>({
          value: lane,
          label: lane.toString(),
        }),
    );
  }
  public _toggleCountryCode(country: string): void {
    const countries: string[] = this.auctionForm.get('countries')?.value || [];
    const index = countries.indexOf(country);

    if (index === -1) {
      countries.push(country);
    } else {
      countries.splice(index, 1);
    }

    this.auctionForm.get('countries')?.setValue([...countries]);
  }

  public _navigateToCreateLane() {
    this._router.navigate(['/create-lane']);
  }
  private _dateTodayOrFutureValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedDate: Date = control.value;

      if (!selectedDate) return null;

      const todayTimestamp = new Date().setHours(0, 0, 0, 0);
      const selectedTimestamp = new Date(selectedDate).setHours(0, 0, 0, 0);

      return selectedTimestamp < todayTimestamp ? { dateBeforeToday: true } : null;
    };
  }
}
