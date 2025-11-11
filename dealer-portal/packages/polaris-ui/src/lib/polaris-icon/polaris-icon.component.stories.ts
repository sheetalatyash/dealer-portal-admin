import { PolarisInput } from '../polaris-input';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { PolarisIcon } from './polaris-icon.component';
import { PolarisIconSize } from './polaris-icon-size.type';
import { PolarisIconColor } from './polaris-icon-color.type';
import { PolarisIconList } from '../../../.storybook/icon-list';

const meta: Meta<PolarisIcon> = {
  title: 'Polaris/Icon',
  component: PolarisIcon,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [PolarisIcon],
    }),
  ],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the icon',
    },
    color: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary', 'accent', 'error', 'warning', 'info', 'success'],
      description: 'Color of the icon',
    },
  },
};

export default meta;
type Story = StoryObj<PolarisIcon>;

export const Default: Story = {
  args: {
    size: 'md' satisfies PolarisIconSize,
    color: 'primary' satisfies PolarisIconColor,
  },
  render: (args) => ({
    props: args,
    template: `<polaris-icon [size]="size" [color]="color">favorite-filled</polaris-icon>`,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <polaris-icon size="xs">favorite-filled</polaris-icon>
        <polaris-icon size="sm">favorite-filled</polaris-icon>
        <polaris-icon size="md">favorite-filled</polaris-icon>
        <polaris-icon size="lg">favorite-filled</polaris-icon>
        <polaris-icon size="xl">favorite-filled</polaris-icon>
      </div>
    `,
  }),
};

export const AllColors: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <polaris-icon color="primary">favorite-filled</polaris-icon>
        <polaris-icon color="success">favorite-filled</polaris-icon>
        <polaris-icon color="info">favorite-filled</polaris-icon>
        <polaris-icon color="warning">favorite-filled</polaris-icon>
        <polaris-icon color="danger">favorite-filled</polaris-icon>
        <polaris-icon color="dark">favorite-filled</polaris-icon>
        <polaris-icon color="light">favorite-filled</polaris-icon>
        <polaris-icon color="white">favorite-filled</polaris-icon>
        <polaris-icon color="muted">favorite-filled</polaris-icon>
      </div>
    `,
  }),
};

export const AllIcons: Story = {
  parameters: {
    docs: {
      source: {
        type: 'code',
        code: '', // disables the code block
        language: 'html',
      },
    },
  },
  render: () => ({
    props: {},
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6rem 2rem;">
        ${PolarisIconList
      .map(
        (icon) => `
              <div style="text-align: center; font-family: sans-serif;">
                <polaris-icon size="xl">${icon}</polaris-icon>
                <div style="margin-top: 1rem; font-size: 14px;">${icon}</div>
              </div>
            `
      )
      .join('')}
      </div>
    `,
  }),
};
