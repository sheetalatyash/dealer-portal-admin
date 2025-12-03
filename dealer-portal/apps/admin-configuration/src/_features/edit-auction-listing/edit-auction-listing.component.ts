import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslatePipe } from '@ngx-translate/core';
import { PolarisGroupOption, PolarisSelect, PolarisDivider, PolarisAccordion } from '@dealer-portal/polaris-ui';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PolarisButton, PolarisInput, PolarisIcon, PolarisTextarea } from '@dealer-portal/polaris-ui';
import { MatMenuModule } from '@angular/material/menu';
import { statusRawOptions } from '../../_constants/constant';
import { Router } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { ListingDetailsComponent } from '../vehical-detail/vehical-detail.component';

@Component({
  selector: 'auctions-edit-auction-listing',
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
    MatExpansionModule,
    PolarisAccordion,
    ListingDetailsComponent,
  ],
  templateUrl: './edit-auction-listing.component.html',
  styleUrl: './edit-auction-listing.component.scss',
})
export class EditAuctionListingComponent implements OnInit {
  listingForm: FormGroup;
  openMenuId: string | null = null;
  // setting up flags
  isFormSubmitted = false;
  isEditAuctionSet = false;
  isChangeAuctionSet = false;
  isCancelEdit = false;
  isEditSchedule = false;
  testId = 'vehicle-menu';

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

  constructor(public formBuilder: FormBuilder, public router: Router) {
    this.listingForm = this.formBuilder.group({
      title: ['2024 Polaris GENERAL XP 4 1000: Ultimate Polaris Blue (49ST)', Validators.required],
      description: ['', Validators.required],
      startingPrice: ['220.00', Validators.required],
      minBidIncrement: ['100', Validators.required],
      freightCost: ['1250', Validators.required],
    });
  }

  public ngOnInit(): void {
    this._getPeriodOptions();
  }

  public submitForm(): void {
    if (this.listingForm.valid) {
      // call API to update the listing
      this.isFormSubmitted = true;
    }
  }
  public toggleVehicleMenu(event: Event, vehicleId: string): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === vehicleId ? null : vehicleId;
  }

  public cancelEdit(): void {
    // set is cancel flag to true
    this.isCancelEdit = true;
  }

  public saveChanges(): void {
    this.submitForm();
  }

  public editSchedule(): void {
    // set edit schedule flag to true
    this.isEditSchedule = true;
  }

  public editAuction(): void {
    // set edit Auction flag to true
    this.isEditAuctionSet = true;
  }

  public changeAuction(): void {
    // set change Auction flag to true
    this.isChangeAuctionSet = true;
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

  public navigateToDetails() {
    // TODO: Navigate to details page
    this.router.navigate(['/vehicle-details']);
  }

  public toggleAccordion(event: Event) {
    event.preventDefault();
  }
  @HostListener('document:click')
  public closeMenu(): void {
    this.openMenuId = null;
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this.openMenuId = null;
  }
}
