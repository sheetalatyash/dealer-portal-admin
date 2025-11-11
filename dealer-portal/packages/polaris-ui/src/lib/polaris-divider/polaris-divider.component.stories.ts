import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { PolarisDivider } from './polaris-divider.component';

const meta: Meta<PolarisDivider> = {
  title: 'Polaris/Divider',
  component: PolarisDivider,
  decorators: [
    moduleMetadata({
      imports: [PolarisDivider],
    }),
  ],
  tags: ['autodocs'],
  args: {
    customClass: '',
  },
  argTypes: {
    customClass: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<PolarisDivider>;

export const Default: Story = {};

export const WithCustomClass: Story = {
  args: {
    customClass: 'my-custom-divider',
  },
};
