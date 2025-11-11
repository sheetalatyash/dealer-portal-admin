// polaris-href.component.stories.ts
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { PolarisHref } from './polaris-href.component';
import { CommonModule } from '@angular/common';

const meta: Meta<PolarisHref> = {
  title: 'Polaris/Href',
  component: PolarisHref,
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
    }),
  ],
  tags: ['autodocs'],
  args: {
    testId: 'polaris-href',
    underline: true,
    customClass: '',
  },
  argTypes: {
    underline: {
      control: 'select',
      options: ['true', 'false'],
    },
    customClass: { control: 'text' },
    testId: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<PolarisHref>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<polaris-href [underline]="underline" [customClass]="customClass" [ui-test-id]="testId">Polaris Link</polaris-href>`,
  }),
};

export const WithIcons: Story = {
  render: (args) => ({
    props: args,
    template: `
      <polaris-href [underline]="underline" [ui-class]="customClass" [ui-test-id]="testId">
        <polaris-icon leading-icon>favorite-filled</polaris-icon>
        Polaris Link
        <polaris-icon trailing-icon>ask-polaris</polaris-icon>
      </polaris-href>
    `,
  }),
};
