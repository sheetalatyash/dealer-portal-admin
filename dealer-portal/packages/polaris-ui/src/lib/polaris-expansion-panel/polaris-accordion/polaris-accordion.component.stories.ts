import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PolarisAccordion } from './polaris-accordion.component';
import { PolarisHref } from '../../polaris-href';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';

const meta: Meta<PolarisAccordion> = {
  title: 'Polaris/Expansion Panel/Accordion',
  component: PolarisAccordion,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        MatExpansionModule,
        PolarisHref,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  tags: ['autodocs'],
  args: {
    showToggle: true,
    allowMultipleExpanded: false,
    testId: 'accordion',
    customClass: '',
  },
  render: (args) => ({
    props: args,
    template: `
      <polaris-accordion
        [showToggle]="showToggle"
        [allowMultipleExpanded]="allowMultipleExpanded"
        [ui-test-id]="testId"
        [customClass]="customClass"
      >
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              First Panel
            </mat-panel-title>
          </mat-expansion-panel-header>
          Content for the first panel.
        </mat-expansion-panel>

        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              Second Panel
            </mat-panel-title>
          </mat-expansion-panel-header>
          Content for the second panel.
        </mat-expansion-panel>
      </polaris-accordion>
    `,
  }),
};

export default meta;
type Story = StoryObj<PolarisAccordion>;

export const Default: Story = {};
