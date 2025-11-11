import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { PolarisHeading } from './polaris-heading.component';

const meta: Meta<PolarisHeading> = {
  title: 'Polaris/Heading',
  component: PolarisHeading,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [PolarisHeading],
    }),
  ],
};

export default meta;
type Story = StoryObj<PolarisHeading>;

export const Heading1: Story = {
  render: () => ({
    template: `
      <polaris-heading h1 ui-test-id="polaris-heading-level-1">
        Example Heading Level 1
      </polaris-heading>
    `,
  }),
};

export const Heading2: Story = {
  render: () => ({
    template: `
      <polaris-heading h2 ui-test-id="polaris-heading-level-2">
        Example Heading Level 2
      </polaris-heading>
    `,
  }),
};

export const Heading3: Story = {
  render: () => ({
    template: `
      <polaris-heading h3 ui-test-id="polaris-heading-level-3">
        Example Heading Level 3
      </polaris-heading>
    `,
  }),
};

export const Heading4: Story = {
  render: () => ({
    template: `
      <polaris-heading h4 ui-test-id="polaris-heading-level-4">
        Example Heading Level 4
      </polaris-heading>
    `,
  }),
};

export const Heading5: Story = {
  render: () => ({
    template: `
      <polaris-heading h5 ui-test-id="polaris-heading-level-5">
        Example Heading Level 5
      </polaris-heading>
    `,
  }),
};

export const Heading6: Story = {
  render: () => ({
    template: `
      <polaris-heading h6 ui-test-id="polaris-heading-level-6">
        Example Heading Level 6
      </polaris-heading>
    `,
  }),
};
