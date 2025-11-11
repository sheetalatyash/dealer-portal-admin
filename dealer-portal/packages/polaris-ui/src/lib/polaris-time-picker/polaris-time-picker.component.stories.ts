import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { OverlayModule } from '@angular/cdk/overlay';
import { PolarisTimePickerDialog } from './polaris-time-picker-dialog/polaris-time-picker-dialog.component';
import { PolarisTimePicker } from './polaris-time-picker.component';
import { PolarisIcon } from '../polaris-icon/polaris-icon.component';
import { PolarisIconButton } from '../polaris-icon-button/polaris-icon-button.component';

const meta: Meta<PolarisTimePicker<unknown>> = {
  title: 'Polaris/Time Picker',
  component: PolarisTimePicker,
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        OverlayModule,
        PolarisTimePickerDialog,
        PolarisIcon,
        PolarisIconButton,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  tags: ['autodocs'],
  args: {
    label: 'Pick a time',
    tooltip: 'Select your preferred time of day',
    placeholder: 'HH:MM',
    testId: 'polaris-time-picker',
  },
};

export default meta;
type Story = StoryObj<PolarisTimePicker<unknown>>;

export const Default: Story = {};
