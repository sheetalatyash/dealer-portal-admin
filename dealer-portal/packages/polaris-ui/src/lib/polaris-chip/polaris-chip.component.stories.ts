import { Meta, StoryObj, applicationConfig, moduleMetadata } from '@storybook/angular';
import { PolarisChip } from './polaris-chip.component';
import { PolarisIcon } from '../polaris-icon/polaris-icon.component';
import { provideAnimations } from '@angular/platform-browser/animations';

const meta: Meta<PolarisChip> = {
  title: 'Polaris/Chip',
  component: PolarisChip,
  decorators: [
    moduleMetadata({
      imports: [PolarisChip, PolarisIcon],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    isSelected: { control: 'boolean' },
    testId: { control: 'text' },
  },
  args: {
    isSelected: false,
    testId: 'chip-basic',
  },
};

export default meta;
type Story = StoryObj<PolarisChip>;

export const Default: Story = {
  args: {
    isSelected: false,
  },
  render: (args) => ({
    props: {
      ...args,
      onClick: () => alert('Chip clicked!'),
    },
    template: `<polaris-chip [isSelected]="isSelected" [attr.data-test-id]="testId" (chipClick)="onClick()">Chip Label</polaris-chip>`,
  }),
};

export const Selected: Story = {
  args: {
    isSelected: true,
  },
};
