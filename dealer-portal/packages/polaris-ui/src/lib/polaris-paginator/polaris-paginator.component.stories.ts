// polaris-paginator.component.stories.ts
import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PolarisPaginator } from './polaris-paginator.component';
import { PolarisButton } from '../polaris-button/polaris-button.component';

const meta: Meta<PolarisPaginator> = {
  title: 'Polaris/Paginator',
  component: PolarisPaginator,
  decorators: [
    moduleMetadata({
      imports: [PolarisButton],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  tags: ['autodocs'],
  args: {
    testId: 'paginator',
    customClass: '',
    maxElements: 100,
    displayedElements: 20,
  },
  argTypes: {
    testId: { control: 'text' },
    customClass: { control: 'text' },
    maxElements: { control: 'number' },
    displayedElements: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<PolarisPaginator>;

export const Default: Story = {
  args: {
    displayedElements: 20,
    maxElements: 100,
  },
};

export const AllItemsLoaded: Story = {
  args: {
    displayedElements: 100,
    maxElements: 100,
  },
};
