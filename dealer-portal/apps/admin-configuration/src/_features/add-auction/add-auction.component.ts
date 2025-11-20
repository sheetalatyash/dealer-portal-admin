import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { PolarisGroupOption, PolarisSelect, PolarisDivider } from '@dealer-portal/polaris-ui';
import {
  PolarisButton,
  PolarisDatePicker,
  PolarisInput,
  PolarisIcon,
  PolarisCheckbox,
} from '@dealer-portal/polaris-ui';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'ac-add-auction',
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
})
export class AddAuctionComponent {
  auctionForm: FormGroup;
  public timezoneOptions: PolarisGroupOption<number>[] = [];
  public periodOptions: PolarisGroupOption<string>[] = [];
  public timeOptions: PolarisGroupOption<string>[] = [];
  public hourOptions: PolarisGroupOption<string>[] = [];
  public minuteOptions: PolarisGroupOption<string>[] = [];
  public laneOptions: PolarisGroupOption<number>[] = [];
  public auctionRulesOptions: PolarisGroupOption<string>[] = [];
  public selectedCountries: string[] = [];

  private timezoneRawOptions = [
    { offset: 480, label: 'Alaska Time' },
    { offset: 420, label: 'Pacific Time' },
    { offset: 360, label: 'Mountain Time' },
    { offset: 300, label: 'Central Standard Time' },
    { offset: 240, label: 'Eastern Time' },
    { offset: 180, label: 'Atlantic Time' },
    { offset: 150, label: 'Newfoundland Time' },
  ];
  private rawAuctionRules = [
    { value: 'standard', label: 'Standard Auction (DC/PL/US)' },
    { value: 'openPL', label: 'Open Auction with PL (PL/US)' },
    { value: 'openFull', label: 'Open Auction Full (US)' },
    { value: 'custom', label: 'Custom' },
  ];

  private periodRawOptions = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' },
  ];
  private laneRawOptions = Array.from({ length: 50 }, (_, i) => i + 1);

  public ngOnInit(): void {
    this._getHourOptions();
    this._getMinuteOptions();
    this._getTimezoneOptions();
    this._getPeriodOptions();
    this._getLaneOptions();
    this._getAuctionRulesOptions();
  }

  constructor(private fb: FormBuilder) {
    this.auctionForm = this.fb.group({
      nickname: [''],
      numberOfLanes: [1, [Validators.required, Validators.min(1)]],
      laneStagger: [1, [Validators.required, Validators.min(1)]],
      bidIncrement: [100],
      duration: [5, Validators.required],
      auctionDate: [''],
      startHour: ['8'],
      startMinute: ['00'],
      startPeriod: ['AM'],
      endHour: ['1'],
      endMinute: ['00'],
      endPeriod: ['PM'],
      auctionRules: ['standard', Validators.required],
      buyNow: [true],
      customOptions: this.fb.group({
        dc: [false],
        pl: [false],
        countryCode: [false],
      }),
    });
  }

  submitForm(): void {
    if (this.auctionForm.valid) {
      console.log('Form Submitted:', this.auctionForm.value);
    } else {
      console.warn('Form is invalid');
    }
  }
  get isCustomRule(): boolean {
    return this.auctionForm.get('auctionRules')?.value === 'custom';
  }

  get dcControl(): FormControl {
    return this.auctionForm.get('customOptions.dc') as FormControl;
  }

  get plControl(): FormControl {
    return this.auctionForm.get('customOptions.pl') as FormControl;
  }

  get countryCodeControl(): FormControl {
    return this.auctionForm.get('customOptions.countryCode') as FormControl;
  }

  get buyNowControl(): FormControl {
    return this.auctionForm.get('buyNow') as FormControl;
  }

  public onCheckboxChange(event: any): void {
    const checked = event.checked;
    const customOptionsGroup = this.auctionForm.get('customOptions') as FormGroup;

    Object.keys(customOptionsGroup.controls).forEach((controlName) => {
      const control = customOptionsGroup.get(controlName) as FormControl;
      control.setValue(checked, { emitEvent: false });
    });
  }

  private _getTimezoneOptions(): void {
    this.timezoneOptions = this.timezoneRawOptions.map(
      (timezone) =>
        new PolarisGroupOption<number>({
          value: timezone.offset,
          label: timezone.label,
        }),
    );
  }
  private _getAuctionRulesOptions(): void {
    this.auctionRulesOptions = this.rawAuctionRules.map(
      (rule) =>
        new PolarisGroupOption<string>({
          value: rule.value,
          label: rule.label,
        }),
    );
  }

  private _getPeriodOptions(): void {
    this.periodOptions = this.periodRawOptions.map(
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
      (_, i) =>
        new PolarisGroupOption<string>({
          value: (i + 1).toString().padStart(2, '0'),
          label: (i + 1).toString().padStart(2, '0'),
        }),
    );
  }

  private _getMinuteOptions(): void {
    this.minuteOptions = Array.from(
      { length: 60 },
      (_, i) =>
        new PolarisGroupOption<string>({ value: i.toString().padStart(2, '0'), label: i.toString().padStart(2, '0') }),
    );
  }
  private _getLaneOptions(): void {
    this.laneOptions = this.laneRawOptions.map(
      (lane) =>
        new PolarisGroupOption<number>({
          value: lane,
          label: lane.toString(),
        }),
    );
  }
  toggleCountryCode(country: string): void {
    const index = this.selectedCountries.indexOf(country);
    if (index === -1) {
      this.selectedCountries.push(country);
    } else {
      this.selectedCountries.splice(index, 1);
    }
    this.countryCodeControl.setValue(this.selectedCountries);
  }
}
