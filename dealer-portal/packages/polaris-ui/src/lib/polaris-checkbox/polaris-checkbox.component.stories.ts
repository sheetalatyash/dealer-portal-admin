import { Meta, StoryObj, applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { PolarisCheckbox } from './polaris-checkbox.component';

const meta: Meta<PolarisCheckbox<unknown>> = {
  title: 'Polaris/Checkbox',
  component: PolarisCheckbox,
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  tags: ['autodocs'],
  args: {
    label: 'I agree to the terms and conditions',
    tooltip: 'Click to accept terms',
    testId: 'checkbox-terms',
    minWidth: '200px',
  },
  argTypes: {
    label: { control: 'text' },
    tooltip: { control: 'text' },
    testId: { control: 'text' },
    minWidth: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<PolarisCheckbox<unknown>>;

export const Default: Story = {};

export const WithTooltip: Story = {
  args: {
    label: 'Enable notifications',
    tooltip: 'This will send you email and in-app alerts',
  },
};

export const WithoutTooltip: Story = {
  args: {
    label: 'Simple checkbox',
    tooltip: undefined,
  },
};
