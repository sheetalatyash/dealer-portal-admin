import { PolarisGroupOption } from '@dealer-portal/polaris-ui';
import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { PolarisCheckboxGroup } from './polaris-checkbox-group.component';
import { PolarisCheckbox } from '../polaris-checkbox/polaris-checkbox.component';
import { PolarisIcon } from '../polaris-icon/polaris-icon.component';
import { PolarisDivider } from '../polaris-divider/polaris-divider.component';

const meta: Meta<PolarisCheckboxGroup<unknown>> = {
  title: 'Polaris/Checkbox Group',
  component: PolarisCheckboxGroup,
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        PolarisCheckbox,
        PolarisIcon,
        PolarisDivider,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  tags: ['autodocs'],
  args: {
    testId: 'checkbox-group',
    label: 'Choose your options',
    showLabel: true,
    instructions: 'You can choose multiple options.',
    instructionsTooltip: 'Each option represents a user setting.',
    showSelectAll: true,
    dividers: true,
    orientationClass: 'flex-column',
    optionMinWidth: '150px',
    options: [
      new PolarisGroupOption<void>({ label: 'Option A', formControlName: 'optionA', testId: 'option-a' }),
      new PolarisGroupOption<void>({ label: 'Option B', formControlName: 'optionB', testId: 'option-b', tooltip: 'Extra info' }),
      new PolarisGroupOption<void>({ label: 'Option C', formControlName: 'optionC', testId: 'option-c' }),
    ],
  },
  render: (args) => {
    const formGroup = new FormGroup({
      optionA: new FormControl(false),
      optionB: new FormControl(true),
      optionC: new FormControl(false),
    });

    return {
      props: {
        ...args,
        formGroup, // ✅ Only assigned in props, not args
      },
      template: `
        <form [formGroup]="formGroup">
          <polaris-checkbox-group
            [ui-test-id]="testId"
            [ui-label]="label"
            [ui-instructions]="instructions"
            [ui-instructions-tooltip]="instructionsTooltip"
            [ui-show-label]="showLabel"
            [showSelectAll]="showSelectAll"
            [dividers]="dividers"
            [ui-orientation]="orientationClass"
            [options]="options"
            [ui-form-group]="formGroup"
          ></polaris-checkbox-group>
        </form>
      `,
    };
  },
};

export default meta;

type Story = StoryObj<PolarisCheckboxGroup<unknown>>;
export const Default: Story = {};
