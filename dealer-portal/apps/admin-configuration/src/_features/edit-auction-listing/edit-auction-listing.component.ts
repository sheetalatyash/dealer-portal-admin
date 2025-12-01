import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslatePipe } from '@ngx-translate/core';
import { PolarisGroupOption, PolarisSelect, PolarisDivider } from '@dealer-portal/polaris-ui';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PolarisButton, PolarisInput, PolarisIcon, PolarisTextarea } from '@dealer-portal/polaris-ui';
import { statusRawOptions } from '../../_constants';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'ac-edit-auction-listing',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PolarisButton,
    PolarisInput,
    PolarisSelect,
    PolarisIcon,
    PolarisDivider,
    TranslatePipe,
    PolarisTextarea,
    MatMenuModule,
  ],
  templateUrl: './edit-auction-listing.component.html',
  styleUrl: './edit-auction-listing.component.scss',
})
export class EditAuctionListingComponent {
  listingForm: FormGroup;
  openMenuId: string | null = null;

  public statusOptions: PolarisGroupOption<string>[] = [];
  vehicles = [
    {
      id: 'vehicle-1',
      name: '2019 Polaris Ace 570 EPS (49ST)',
      type: 'ATV',
      condition: 'Unavailable',
    },
    {
      id: 'vehicle-2',
      name: '2020 Can-Am Maverick X3 X rs',
      type: 'UTV',
      condition: 'Good',
    },
    {
      id: 'vehicle-3',
      name: '2021 Honda Pioneer 700',
      type: 'ATV',
      condition: 'Excellent',
    },
  ];

  constructor(private formBuilder: FormBuilder) {
    this.listingForm = this.formBuilder.group({
      title: ['2024 Polaris GENERAL XP 4 1000: Ultimate Polaris Blue (49ST)', Validators.required],
      description: ['', Validators.required],
      startingPrice: ['220.00', Validators.required],
      minBidIncrement: ['100', Validators.required],
      freightCost: ['1250', Validators.required],
    });
  }

  ngOnInit(): void {
    this._getPeriodOptions();
  }

  submitForm(): void {
    if (this.listingForm.valid) {
      console.log('Form Value:', this.listingForm.value);
    }
  }
  toggleVehicleMenu(event: Event, vehicleId: string): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === vehicleId ? null : vehicleId;
  }

  cancelEdit(): void {
    console.log('Edit cancelled');
  }

  saveChanges(): void {
    this.submitForm();
  }

  editSchedule(): void {
    console.log('Edit schedule');
  }

  editAuction(): void {
    console.log('Edit auction');
  }

  changeAuction(): void {
    console.log('Change auction');
  }
  private _getPeriodOptions(): void {
    this.statusOptions = statusRawOptions.map(
      (status) =>
        new PolarisGroupOption<string>({
          value: status.value,
          label: status.label,
        }),
    );
  }
  @HostListener('document:click')
  closeMenu(): void {
    this.openMenuId = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.openMenuId = null;
  }
}
