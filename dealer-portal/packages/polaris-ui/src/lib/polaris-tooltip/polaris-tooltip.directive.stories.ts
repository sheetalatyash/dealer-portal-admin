import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { PolarisTooltip } from './polaris-tooltip.component';
import { CommonModule } from '@angular/common';

const meta: Meta<PolarisTooltip> = {
  title: 'Polaris/Tooltip/Component',
  component: PolarisTooltip,
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
    }),
  ],
  args: {
    htmlContent: '<strong>This is tooltip content!</strong>',
  },
};

export default meta;
type Story = StoryObj<PolarisTooltip>;

export const Default: Story = {};
