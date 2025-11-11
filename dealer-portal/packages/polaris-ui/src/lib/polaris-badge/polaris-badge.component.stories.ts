// polaris-badge.component.stories.ts
import { PolarisBadgeColor } from './_enums';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PolarisBadge } from './polaris-badge.component';

const meta: Meta<PolarisBadge> = {
  title: 'Polaris/Badge',
  component: PolarisBadge,
  decorators: [
    moduleMetadata({
      imports: [
        PolarisBadge,
      ],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    customClass: { control: 'text' },
    testId: { control: 'text' },
    emitClickEvent: { action: 'badge clicked' },
    emitMouseEnterEvent: { action: 'mouse entered' },
    emitMouseLeaveEvent: { action: 'mouse left' },
  },
};

export default meta;
type Story = StoryObj<PolarisBadge>;

export const Default: Story = {
  args: {
    color: PolarisBadgeColor.Primary,
    testId: 'polaris-badge',
    customClass: '',
  },
  render: (args) => ({
    props: args,
    template: `
      <polaris-badge
        [color]="color"
        [ui-test-id]="testId"
        [ui-class]="customClass"
        (click)="emitClickEvent($event)"
        (mouseenter)="emitMouseEnterEvent($event)"
        (mouseleave)="emitMouseLeaveEvent($event)"
      >
        Default Badge
      </polaris-badge>
    `,
  }),
};
