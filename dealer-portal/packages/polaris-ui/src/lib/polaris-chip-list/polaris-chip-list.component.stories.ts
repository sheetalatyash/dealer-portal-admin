import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PolarisChipList } from './polaris-chip-list.component';
import { PolarisChipListItem } from './polaris-chip-list-item.class';
import { PolarisChip } from '../polaris-chip/polaris-chip.component';

const meta: Meta<PolarisChipList<string>> = {
  title: 'Polaris/Chip/Chip List',
  component: PolarisChipList,
  decorators: [
    moduleMetadata({
      imports: [PolarisChipList, PolarisChip],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  args: {
    testId: 'chip-list',
    customClass: 'gap-2 d-flex',
    chips: [
      new PolarisChipListItem({ id: '1', label: 'Alpha', value: 'alpha', selected: true }),
      new PolarisChipListItem({ id: '2', label: 'Beta', value: 'beta' }),
      new PolarisChipListItem({ id: '3', label: 'Gamma', value: 'gamma' }),
    ],
  },
  argTypes: {
    testId: { control: 'text' },
    customClass: { control: 'text' },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<PolarisChipList<string>>;

export const Default: Story = {
  args: {},
};

export const PreSelected: Story = {
  args: {
    chips: [
      new PolarisChipListItem({ id: 'a', label: 'One', value: 'one', selected: true }),
      new PolarisChipListItem({ id: 'b', label: 'Two', value: 'two', selected: true }),
      new PolarisChipListItem({ id: 'c', label: 'Three', value: 'three' }),
    ],
  },
};
