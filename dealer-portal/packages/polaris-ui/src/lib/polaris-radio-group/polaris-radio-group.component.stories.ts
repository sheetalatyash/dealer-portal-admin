import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { PolarisRadioGroup } from './polaris-radio-group.component';
import { PolarisIcon } from '../polaris-icon/polaris-icon.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatLabel, MatError } from '@angular/material/form-field';
import { PolarisGroupOption } from '../polaris-ui-form-base';

const meta: Meta<PolarisRadioGroup<any>> = {
  title: 'Polaris/Radio Group',
  component: PolarisRadioGroup,
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        PolarisIcon,
        MatRadioModule,
        MatLabel,
        MatError,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  tags: ['autodocs'],
  args: {
    label: 'Select a Role',
    showLabel: true,
    instructions: 'Choose one of the available roles.',
    formControl: new FormControl('admin'),
    options: [
      new PolarisGroupOption({ label: 'Admin', value: 'admin', selected: true }),
      new PolarisGroupOption({ label: 'Editor', value: 'editor' }),
      new PolarisGroupOption({ label: 'Viewer', value: 'viewer', disabled: true }),
    ],
    orientationClass: 'flex-column',
    labelOrientationClass: 'flex-row',
    readonly: false,
    displayTruthyValues: true,
    displayFalsyValues: true,
    testId: 'radio-group',
  },
  argTypes: {
    label: { control: 'text' },
    instructions: { control: 'text' },
    orientationClass: { control: 'text' },
    labelOrientationClass: { control: 'text' },
    showLabel: { control: 'boolean' },
    readonly: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<PolarisRadioGroup<any>>;

export const Default: Story = {};
