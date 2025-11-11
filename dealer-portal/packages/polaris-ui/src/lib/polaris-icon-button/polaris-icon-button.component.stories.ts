import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PolarisIconButton } from './polaris-icon-button.component';
import { PolarisIcon } from '../polaris-icon/polaris-icon.component';

const meta: Meta<PolarisIconButton> = {
  title: 'Polaris/Icon Button',
  component: PolarisIconButton,
  decorators: [
    moduleMetadata({
      imports: [PolarisIconButton, PolarisIcon],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  args: {
    testId: 'icon-button',
    customClass: '',
    disabled: false,
  },
  argTypes: {
    testId: { control: 'text' },
    customClass: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PolarisIconButton>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <polaris-icon-button [attr.data-test-id]="testId" [disabled]="disabled" [ngClass]="customClass">
        Click Me
      </polaris-icon-button>
    `,
  }),
};

export const WithLeadingIcon: Story = {
  render: (args) => ({
    props: args,
    template: `
      <polaris-icon-button [attr.data-test-id]="testId" [disabled]="disabled" [ngClass]="customClass">
        <span leading-icon><polaris-icon size="sm">arrow_back</polaris-icon></span>
        Back
      </polaris-icon-button>
    `,
  }),
};

export const WithTrailingIcon: Story = {
  render: (args) => ({
    props: args,
    template: `
      <polaris-icon-button [attr.data-test-id]="testId" [disabled]="disabled" [ngClass]="customClass">
        Next
        <span trailing-icon><polaris-icon size="sm">arrow_forward</polaris-icon></span>
      </polaris-icon-button>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <polaris-icon-button [attr.data-test-id]="testId" [disabled]="disabled" [ngClass]="customClass">
        Disabled Button
      </polaris-icon-button>
    `,
  }),
};
