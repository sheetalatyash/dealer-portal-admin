import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisDivider, PolarisIcon } from '@dealer-portal/polaris-ui';

interface VehicleSpec {
  label: string;
  value: string;
}

interface RunnerUp {
  amount: string;
  bidder: string;
  status: string;
}

@Component({
  selector: 'ac-vehical-detail',
  imports: [CommonModule, PolarisDivider, PolarisIcon],
  templateUrl: './vehical-detail.component.html',
  styleUrl: './vehical-detail.component.scss',
})
export class ListingDetailsComponent implements OnInit {
  vehicleSpecs: VehicleSpec[] = [
    { label: 'Vehicle Type', value: 'Side By Side' },
    { label: 'Year', value: '2021' },
    { label: 'Make', value: 'Polaris' },
    { label: 'Model', value: 'RZR XP 1000 Ride Command (Electric Power Steering)' },
    { label: 'Model ID', value: 'Z21NAE99AC' },
    { label: 'Hours', value: 'TBD' },
    { label: 'Miles', value: 'TBD' },
    { label: 'FD #', value: 'Coming Soon' },
    { label: 'Ownership', value: '-' },
    { label: 'Doc Type', value: '-' },
    { label: 'VIN', value: '3NSNAES97MF136052' },
    { label: 'Notes', value: '-' },
  ];

  runnersUp: RunnerUp[] = [
    {
      amount: '$7,600',
      bidder: 'Mars Outland Inc.',
      status: 'Unable to purchase',
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
