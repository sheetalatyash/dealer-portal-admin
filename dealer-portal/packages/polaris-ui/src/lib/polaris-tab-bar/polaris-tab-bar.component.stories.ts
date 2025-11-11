// polaris-tab-bar.component.stories.ts
import { PolarisNavigationTab } from '@dealer-portal/polaris-ui';
import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { PolarisTabBar } from './polaris-tab-bar.component';

const meta: Meta<PolarisTabBar> = {
  title: 'Polaris/Tab Bar',
  component: PolarisTabBar,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [MatTabsModule, PolarisTabBar],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  args: {
    testId: 'tab-bar',
    selectedIndex: 0,
    stretchTabs: true,
    compact: false,
    tabs: [
      new PolarisNavigationTab({ label: 'Overview', code: 0, id: 'tab-overview', selected: true }),
      new PolarisNavigationTab({ label: 'Details', code: 1, id: 'tab-details', selected: true  }),
      new PolarisNavigationTab({ label: 'Settings', code: 2, id: 'tab-settings', selected: true  }),
    ],
  },
  argTypes: {
    selectedIndex: { control: { type: 'number', min: 0 } },
    stretchTabs: { control: 'boolean' },
    compact: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<PolarisTabBar>;

export const Default: Story = {};
