import { provideAnimations } from '@angular/platform-browser/animations';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';
import { PolarisButton } from './polaris-button.component';

const meta: Meta<PolarisButton> = {
  title: 'Polaris/Button',
  component: PolarisButton,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'text',
    },
    customClass: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    testId: {
      control: 'text',
    },
  },
  args: {
    theme: 'primary',
    disabled: false,
    testId: 'storybook-button',
    customClass: '',
  },
};

export default meta;
type Story = StoryObj<PolarisButton>;

export const Primary: Story = {
  args: {
    theme: 'primary',
  },
  render: (args) => ({
    props: args,
    template: `<polaris-button
      [ui-theme]="theme"
      [ui-disabled]="disabled"
      [ui-test-id]="testId"
      [ui-class]="customClass"
    >Primary Button</polaris-button>`,
  }),
};

export const Secondary: Story = {
  args: {
    theme: 'secondary',
    disabled: false,
  },
  render: Primary.render,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: Primary.render,
};
