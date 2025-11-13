import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PolarisGroupOption } from '@dealer-portal/polaris-ui';
import { PolarisButton, PolarisDatePicker, PolarisInput, PolarisRadioGroup } from '@dealer-portal/polaris-ui';


@Component({
  selector: 'ac-add-auction',
  imports: [CommonModule, ReactiveFormsModule,PolarisButton, PolarisDatePicker, PolarisInput, PolarisRadioGroup],
  templateUrl: './add-auction.component.html',
  styleUrls: ['./add-auction.component.scss'],
})
export class AddAuctionComponent {
  auctionForm: FormGroup;
  public timezoneOptions: PolarisGroupOption<number>[] = [];

  private timezoneRawOptions = [
    { offset: 480, label: 'Alaska Time' },
    { offset: 420, label: 'Pacific Time' },
    { offset: 360, label: 'Mountain Time' },
    { offset: 300, label: 'Central Standard Time' },
    { offset: 240, label: 'Eastern Time' },
    { offset: 180, label: 'Atlantic Time' },
    { offset: 150, label: 'Newfoundland Time' },
  ];

  public ngOnInit(): void {
    this._getTimezoneOptions();
  }

  constructor(private fb: FormBuilder) {
    this.auctionForm = this.fb.group({
      nickname: [''],
      numberOfLanes: [1, [Validators.required, Validators.min(1)]],
      laneStagger: [''],
      country: ['US'],
      bidIncrement: [''],
      duration: [1, Validators.required],
      auctionDate: [''],
      timeZone: ['Eastern'],
      startTime: [''],
      endTime: ['']
    });
  }

  submitForm(): void {
    if (this.auctionForm.valid) {
      console.log('Form Submitted:', this.auctionForm.value);
    } else {
      console.warn('Form is invalid');
    }
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
}
