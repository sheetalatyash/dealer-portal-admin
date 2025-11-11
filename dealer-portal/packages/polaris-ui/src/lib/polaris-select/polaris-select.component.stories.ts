import { PolarisGroupOption } from '@dealer-portal/polaris-ui';
import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PolarisSelect } from './polaris-select.component';

const meta: Meta<PolarisSelect<any>> = {
  title: 'Polaris/Select',
  component: PolarisSelect,
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, PolarisSelect],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  args: {
    testId: 'polaris-select-demo',
    label: 'Select a value',
    showLabel: true,
    instructions: 'Select your preferred option below',
    instructionsTooltip: 'More info about options',
    placeholder: 'Choose one...',
    panelWidth: '300px',
    readonly: false,
    formControl: new FormControl(),
    options: [
      new PolarisGroupOption({ value: 'opt1', label: 'Option 1' }),
      new PolarisGroupOption({ value: 'opt2', label: 'Option 2', disabled: true }),
      new PolarisGroupOption({
        label: 'Group A',
        children: [
          new PolarisGroupOption({ value: 'group-a-1', label: 'Group A - Option 1' }),
          new PolarisGroupOption({ value: 'group-a-2', label: 'Group A - Option 2' }),
          new PolarisGroupOption({
            label: 'Subgroup A',
            children: [
              new PolarisGroupOption({ value: 'sub-a-1', label: 'Sub A - Option 1' }),
              new PolarisGroupOption({ value: 'sub-a-2', label: 'Sub A - Option 2' }),
            ],
          }),
        ],
      }),
    ],
  },
};

export default meta;
type Story = StoryObj<PolarisSelect<any>>;

export const Default: Story = {};
