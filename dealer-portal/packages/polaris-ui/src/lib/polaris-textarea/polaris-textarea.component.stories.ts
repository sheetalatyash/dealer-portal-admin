import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { PolarisTextarea } from './polaris-textarea.component';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

const meta: Meta<PolarisTextarea<unknown>> = {
  title: 'Polaris/Textarea',
  component: PolarisTextarea,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, ReactiveFormsModule],
    }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PolarisTextarea<unknown>>;

export const Default: Story = {
  args: {
    formControl: new FormControl('Initial content...'),
    label: 'Your Message',
    placeholder: 'Enter your message here',
    showLabel: true,
  },
};
