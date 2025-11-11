import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PolarisDialog } from './polaris-dialog.component';
import { PolarisButton } from '../polaris-button';

@Component({
    selector: 'storybook-dialog-launcher',
    template: `<polaris-button (click)="open()">Open Dialog</polaris-button>`,
    imports: [
        MatDialogModule,
        BrowserAnimationsModule,
        PolarisButton,
    ]
})
class PolarisDialogHostComponent {
  constructor(private dialog: MatDialog) {}

  open() {
    this.dialog.open(PolarisDialog, {
      data: {
        title: 'Example Dialog Title',
        content: 'This is a Polaris Dialog opened from Storybook.',
      },
    });
  }
}

const meta: Meta = {
  title: 'Polaris/Dialog',
  component: PolarisDialogHostComponent,
  decorators: [
    moduleMetadata({
      imports: [MatDialogModule, BrowserAnimationsModule],
    }),
  ],
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    props: {},
    component: PolarisDialogHostComponent,
  }),
};
