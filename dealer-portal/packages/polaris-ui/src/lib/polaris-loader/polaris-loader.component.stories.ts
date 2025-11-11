// polaris-loader.component.stories.ts
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { PolarisLoader } from './polaris-loader.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

const meta: Meta<PolarisLoader> = {
  title: 'Polaris/Loader',
  component: PolarisLoader,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatProgressSpinnerModule, PolarisLoader],
    }),
  ],
};

export default meta;
type Story = StoryObj<PolarisLoader>;

export const Default: Story = {};
