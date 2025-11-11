// polaris-date-picker.component.stories.ts
import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { PolarisDatePicker } from './polaris-date-picker.component';
import { PolarisIcon } from '../polaris-icon/polaris-icon.component';
import { PolarisIconButton } from '../polaris-icon-button/polaris-icon-button.component';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatLabel } from '@angular/material/form-field';

const meta: Meta<PolarisDatePicker<unknown>> = {
  title: 'Polaris/Date Picker',
  component: PolarisDatePicker,
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        PolarisIcon,
        PolarisIconButton,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatFormFieldModule,
        MatLabel,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  args: {
    testId: 'date-picker',
    label: 'Select a date',
    placeholder: 'MM/DD/YYYY',
    tooltip: 'Pick a date for the event.',
    formControl: new FormControl(),
    customClass: '',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PolarisDatePicker<unknown>>;

export const Default: Story = {};
