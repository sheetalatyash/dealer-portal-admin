import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLabel, MatError } from '@angular/material/form-field';
import { PolarisInput } from './polaris-input.component';
import { PolarisIcon } from '../polaris-icon/polaris-icon.component';

const meta: Meta<PolarisInput<unknown>> = {
  title: 'Polaris/Input',
  component: PolarisInput,
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatLabel,
        MatError,
        PolarisIcon,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  args: {
    testId: 'input-test',
    label: 'Username',
    showLabel: true,
    placeholder: 'Enter your username',
    infoTooltip: 'This will be used for login',
    readonly: false,
    outlineColor: 'default',
    maxLength: 50,
    formControl: new FormControl(''),
    errors: [],
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PolarisInput<unknown>>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    formControl: new FormControl('', { nonNullable: true }),
    errors: ['Username is required'],
  },
};
