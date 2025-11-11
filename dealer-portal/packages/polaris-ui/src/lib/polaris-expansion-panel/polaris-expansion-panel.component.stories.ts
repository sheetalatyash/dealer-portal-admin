// polaris-expansion-panel.component.stories.ts
import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PolarisExpansionPanel } from './polaris-expansion-panel.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { PolarisIcon } from '../polaris-icon/polaris-icon.component';

const meta: Meta<PolarisExpansionPanel> = {
  title: 'Polaris/Expansion Panel',
  component: PolarisExpansionPanel,
  decorators: [
    moduleMetadata({
      imports: [MatExpansionModule, PolarisIcon],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  tags: ['autodocs'],
  args: {
    expanded: false,
    showHeader: true,
    hideToggle: false,
    usePolarisExpansionToggle: true,
    testId: 'expansion-panel',
    togglePosition: 'after',
    headerHeightCollapsed: '48px',
    headerHeightExpanded: '64px',
  },
};

export default meta;
type Story = StoryObj<PolarisExpansionPanel>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <polaris-expansion-panel
        [expanded]="expanded"
        [showHeader]="showHeader"
        [hideToggle]="hideToggle"
        [usePolarisExpansionToggle]="usePolarisExpansionToggle"
        [testId]="testId"
        [togglePosition]="togglePosition"
        [headerHeightCollapsed]="headerHeightCollapsed"
        [headerHeightExpanded]="headerHeightExpanded">

        <polaris-expansion-panel-title>
          Panel Title
        </polaris-expansion-panel-title>

        <polaris-expansion-panel-description>
          Panel Description
        </polaris-expansion-panel-description>

        <polaris-expansion-panel-actions>
          <!-- Optional Action Content -->
        </polaris-expansion-panel-actions>

        <div>
          Panel content goes here.
        </div>
      </polaris-expansion-panel>
    `,
  }),
};
