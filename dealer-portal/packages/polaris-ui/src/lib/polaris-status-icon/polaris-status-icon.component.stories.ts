// polaris-status-icon.component.stories.ts
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { PolarisStatusIcon } from './polaris-status-icon.component';
import { PolarisIcon } from '../polaris-icon/polaris-icon.component';

const meta: Meta<PolarisStatusIcon> = {
  title: 'Polaris/Status Icon',
  component: PolarisStatusIcon,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [PolarisStatusIcon, PolarisIcon],
    }),
  ],
  argTypes: {
    iconName: { control: 'text' },
    iconColor: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'danger', 'default'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<PolarisStatusIcon>;

export const Default: Story = {
  args: {
    iconName: 'check_circle',
    iconColor: 'success',
    size: 'md',
  },
};
