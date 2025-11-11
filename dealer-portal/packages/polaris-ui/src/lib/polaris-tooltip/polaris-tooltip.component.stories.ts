import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    imports: [
        CommonModule,
    ],
    template: `
    <button ui-tooltip="Hello from Tooltip!" data-test-id="tooltip-btn">
      Hover over me
    </button>
  `
})
class TooltipHostComponent {}

const meta: Meta<TooltipHostComponent> = {
  title: 'Polaris/Tooltip/Directive',
  component: TooltipHostComponent,
  decorators: [
    moduleMetadata({
      imports: [],
    }),
  ],
};

export default meta;
type Story = StoryObj<TooltipHostComponent>;

export const Default: Story = {};
