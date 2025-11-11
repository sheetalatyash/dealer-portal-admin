// polaris-error.component.stories.ts
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { PolarisError } from './polaris-error.component';
import { CommonModule } from '@angular/common';
import { MatError } from '@angular/material/form-field';

const meta: Meta<PolarisError> = {
  title: 'Polaris/Error',
  component: PolarisError,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatError],
    }),
  ],
  tags: ['autodocs'],
  args: {
    visible: true,
    error: null,
    errors: [],
  },
  argTypes: {
    visible: { control: { type: 'boolean' } },
    error: { control: 'text' },
    errors: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<PolarisError>;

/**
 * Default usage with ng-content
 */
export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <polaris-error [visible]="visible">
        This is an error displayed via ng-content.
      </polaris-error>
    `,
  }),
};

/**
 * Single error passed via [error]
 */
export const SingleError: Story = {
  args: { error: 'This field is required.' },
  render: (args) => ({
    props: args,
    template: `
      <polaris-error [visible]="visible" [error]="error"></polaris-error>
    `,
  }),
};

/**
 * Multiple errors passed via [errors]
 */
export const MultipleErrors: Story = {
  args: { errors: ['Name is required.', 'Email must be valid.'] },
  render: (args) => ({
    props: args,
    template: `
      <polaris-error [visible]="visible" [errors]="errors"></polaris-error>
    `,
  }),
};

/**
 * Hidden (visible = false)
 */
export const Hidden: Story = {
  args: { visible: false, error: 'This should not show.' },
  render: (args) => ({
    props: args,
    template: `
      <polaris-error [visible]="visible" [error]="error"></polaris-error>
    `,
  }),
};
