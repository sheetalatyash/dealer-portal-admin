import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisDivider, PolarisIcon, PolarisButton, PolarisAccordion } from '@dealer-portal/polaris-ui';
import { TranslatePipe } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';

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
  imports: [
    CommonModule,
    PolarisDivider,
    PolarisIcon,
    PolarisButton,
    TranslatePipe,
    PolarisAccordion,
    MatExpansionModule,
  ],
  templateUrl: './vehical-detail.component.html',
  styleUrl: './vehical-detail.component.scss',
})
export class ListingDetailsComponent {
  testId = 'listing-details';
  showToggle = true;
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

  conditionSummary = {
    categories: [
      {
        categoryName: 'Exterior',
        questions: [
          {
            title: 'Body',
            questionText: '',
            answers: [
              {
                answerText: 'Excellent',
                selectedColor: '#000000',
                selectedBackgroundColor: '#0BA300',
                isSelected: false,
              },
              {
                answerText: 'Very Good',
                selectedColor: '#000000',
                selectedBackgroundColor: '#8CB300',
                isSelected: true,
              },
              {
                answerText: 'Good',
                selectedColor: '#000000',
                selectedBackgroundColor: '#FFC600',
                isSelected: false,
              },
              {
                answerText: 'Fair',
                selectedColor: '#000000',
                selectedBackgroundColor: '#FF7317',
                isSelected: false,
              },
            ],
            notes: null,
            images: [],
          },
          {
            title: 'Chassis/Frame',
            questionText: '',
            answers: [
              {
                answerText: 'Excellent',
                selectedColor: '#000000',
                selectedBackgroundColor: '#0BA300',
                isSelected: false,
              },
              {
                answerText: 'Very Good',
                selectedColor: '#000000',
                selectedBackgroundColor: '#8CB300',
                isSelected: false,
              },
              {
                answerText: 'Good',
                selectedColor: '#000000',
                selectedBackgroundColor: '#FFC600',
                isSelected: true,
              },
              {
                answerText: 'Fair',
                selectedColor: '#000000',
                selectedBackgroundColor: '#FF7317',
                isSelected: false,
              },
            ],
            notes: null,
            images: [],
          },
        ],
      },
      {
        categoryName: 'Interior',
        questions: [
          {
            title: 'Seat Capacity',
            questionText: '',
            answers: [
              {
                answerText: '1',
                selectedColor: '#FFFFFF',
                selectedBackgroundColor: '#004E97',
                isSelected: false,
              },
              {
                answerText: '2',
                selectedColor: '#FFFFFF',
                selectedBackgroundColor: '#004E97',
                isSelected: true,
              },
            ],
            notes: null,
            images: [],
          },
          {
            title: 'Seat(s)',
            questionText: '',
            answers: [
              {
                answerText: 'Excellent',
                selectedColor: '#000000',
                selectedBackgroundColor: '#0BA300',
                isSelected: false,
              },
              {
                answerText: 'Very Good',
                selectedColor: '#000000',
                selectedBackgroundColor: '#8CB300',
                isSelected: true,
              },
              {
                answerText: 'Good',
                selectedColor: '#000000',
                selectedBackgroundColor: '#FFC600',
                isSelected: false,
              },
              {
                answerText: 'Fair',
                selectedColor: '#000000',
                selectedBackgroundColor: '#FF7317',
                isSelected: false,
              },
            ],
            notes: null,
            images: [],
          },
        ],
      },
      {
        categoryName: 'Electrical',
        questions: [
          {
            title: 'Infotainment/Display/Audio/Speakers',
            questionText: '',
            answers: [
              {
                answerText: 'Yes',
                selectedColor: '#FFFFFF',
                selectedBackgroundColor: '#004E97',
                isSelected: true,
              },
              {
                answerText: 'No',
                selectedColor: '#FFFFFF',
                selectedBackgroundColor: '#004E97',
                isSelected: false,
              },
            ],
            notes: null,
            images: [],
          },
          {
            title: 'Lights',
            questionText: 'Present and Functioning?',
            answers: [
              {
                answerText: 'Yes',
                selectedColor: '#FFFFFF',
                selectedBackgroundColor: '#004E97',
                isSelected: true,
              },
              {
                answerText: 'No',
                selectedColor: '#FFFFFF',
                selectedBackgroundColor: '#004E97',
                isSelected: false,
              },
            ],
            notes: null,
            images: [],
          },
          {
            title: 'Gauges',
            questionText: 'Functioning?',
            answers: [
              {
                answerText: 'Yes',
                selectedColor: '#FFFFFF',
                selectedBackgroundColor: '#004E97',
                isSelected: true,
              },
              {
                answerText: 'No',
                selectedColor: '#FFFFFF',
                selectedBackgroundColor: '#004E97',
                isSelected: false,
              },
            ],
            notes: null,
            images: [],
          },
          {
            title: 'Warning Indicators & Labels',
            questionText: 'Present on the Vehicle?',
            answers: [
              {
                answerText: 'Yes',
                selectedColor: '#FFFFFF',
                selectedBackgroundColor: '#004E97',
                isSelected: true,
              },
              {
                answerText: 'No',
                selectedColor: '#FFFFFF',
                selectedBackgroundColor: '#004E97',
                isSelected: false,
              },
            ],
            notes: null,
            images: [],
          },
        ],
      },
      {
        categoryName: 'Wheels/Tires/Tracks',
        questions: [
          {
            title: 'Wheels/Rims',
            questionText: '',
            answers: [
              {
                answerText: 'Excellent',
                selectedColor: '#000000',
                selectedBackgroundColor: '#0BA300',
                isSelected: false,
              },
              {
                answerText: 'Very Good',
                selectedColor: '#000000',
                selectedBackgroundColor: '#8CB300',
                isSelected: true,
              },
              {
                answerText: 'Good',
                selectedColor: '#000000',
                selectedBackgroundColor: '#FFC600',
                isSelected: false,
              },
              {
                answerText: 'Fair',
                selectedColor: '#000000',
                selectedBackgroundColor: '#FF7317',
                isSelected: false,
              },
            ],
            notes: null,
            images: [],
          },
          {
            title: 'Tires',
            questionText: '',
            answers: [
              {
                answerText: 'Excellent',
                selectedColor: '#000000',
                selectedBackgroundColor: '#0BA300',
                isSelected: false,
              },
              {
                answerText: 'Very Good',
                selectedColor: '#000000',
                selectedBackgroundColor: '#8CB300',
                isSelected: true,
              },
              {
                answerText: 'Good',
                selectedColor: '#000000',
                selectedBackgroundColor: '#FFC600',
                isSelected: false,
              },
              {
                answerText: 'Fair',
                selectedColor: '#000000',
                selectedBackgroundColor: '#FF7317',
                isSelected: false,
              },
            ],
            notes: null,
            images: [],
          },
        ],
      },
      {
        categoryName: 'Maintenance',
        questions: [
          {
            title: 'Pre-Sales Maintenance',
            questionText: 'Complete?',
            answers: [
              {
                answerText: 'Yes',
                selectedColor: '#FFFFFF',
                selectedBackgroundColor: '#004E97',
                isSelected: true,
              },
              {
                answerText: 'No',
                selectedColor: '#FFFFFF',
                selectedBackgroundColor: '#004E97',
                isSelected: false,
              },
            ],
            notes: null,
            images: [],
          },
          {
            title: 'Maintenance Schedule',
            questionText: 'Up to date?',
            answers: [
              {
                answerText: 'Yes',
                selectedColor: '#FFFFFF',
                selectedBackgroundColor: '#004E97',
                isSelected: true,
              },
              {
                answerText: 'No',
                selectedColor: '#FFFFFF',
                selectedBackgroundColor: '#004E97',
                isSelected: false,
              },
            ],
            notes: null,
            images: [],
          },
        ],
      },
    ],
  };

  // openManualBid() {
  //   var modal = document.querySelector('#staticBackdrop');
  //   if (modal)
  //   modal.modal('show')
  // }
  public toggleAccordion(event: Event) {
    event.preventDefault();
  }
}
