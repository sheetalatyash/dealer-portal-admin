import type { Meta, StoryObj } from '@storybook/angular';
import { PolarisBackToTop } from './polaris-back-to-top.component';

interface BackToTopArgs {
  isVisible: boolean;
}

/**
 * Storybook metadata for the PolarisBackToTop component.
 *
 * The `PolarisBackToTop` component provides an unobtrusive floating button
 * that appears once the user scrolls past a certain vertical threshold (300px by default)
 * and allows smooth scrolling back to the top of the page.
 *
 * ### Behavior
 * - The component automatically listens for `window:scroll` events using `@HostListener`.
 * - When the user scrolls beyond 300px, it sets its internal `isVisible` property to `true`
 *   and fades into view.
 * - Clicking the button triggers a smooth scroll to the top of the window.
 *
 * ### Usage
 * Simply include `<polaris-back-to-top></polaris-back-to-top>` at the root of your app
 * or within a scrollable container.
 *
 * Passing an explicit `isVisible` input is **unnecessary** in production usage, as
 * visibility is automatically managed internally based on scroll position.
 * The `isVisible` input is only exposed here to demonstrate the visual state in Storybook.
 */
const meta: Meta<typeof PolarisBackToTop> = {
  title: 'Polaris/Back To Top',
  component: PolarisBackToTop,
  tags: ['autodocs'],
  render: (args: any) => ({
    props: args,
    template: `
      <div style="height: 350px; padding: 1rem;">
        <p>
          The Back To Top button appears automatically when scrolling beyond 300px in a real application.
          In this demo, it's forced visible for documentation purposes.
        </p>
        <polaris-back-to-top [isVisible]="isVisible"></polaris-back-to-top>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<typeof PolarisBackToTop & BackToTopArgs>;

/**
 * ### Default
 *
 * Demonstrates the Back To Top component in its visible state.
 * In a real environment, the visibility is automatically toggled by scroll position.
 */
export const Default: Story = {
  args: {
    // This is only for Storybook visualization; not needed in actual app usage
    isVisible: true,
  },
};
