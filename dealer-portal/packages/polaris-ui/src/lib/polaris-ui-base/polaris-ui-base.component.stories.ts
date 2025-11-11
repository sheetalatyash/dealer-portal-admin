import type { Meta, StoryObj } from '@storybook/angular';
import { PolarisUiBase } from './polaris-ui-base.component';
import { PolarisThemeLevel } from './polaris-ui-theme-level.enum';

const meta: Meta<PolarisUiBase> = {
  component: PolarisUiBase,
  title: 'PolarisUiBase',
};
export default meta;
type Story = StoryObj<PolarisUiBase>;

export const Primary: Story = {
  args: {
    customClass: '',
    disabled: false,
    testId: 'polaris-ui-element-test-id',
    theme: PolarisThemeLevel.Primary as PolarisThemeLevel,
    tooltip: '',
  },
};


export const Heading: Story = {
  args: {
    customClass: '',
    disabled: false,
    testId: 'polaris-ui-element-test-id',
    theme: PolarisThemeLevel.Primary as PolarisThemeLevel,
    tooltip: '',
  },
};
