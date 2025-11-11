import type { Meta } from '@storybook/angular';
import { PolarisUiFormBase } from './polaris-ui-form-base.component';

const meta: Meta<PolarisUiFormBase<unknown>> = {
  title: 'Base/PolarisUiFormBase',
  component: PolarisUiFormBase,
  tags: ['autodocs', '!dev'],
  parameters: {
    docs: {
      description: {
        component: `
PolarisUiFormBase is a foundational component used across Polaris form elements.
It provides common inputs, behaviors, and validation logic that other form components inherit.

### Inputs
- \`ui-form-group\`: \`FormGroup\` — Parent form group.
- \`ui-form-group-name\`: \`string\` — Nested form group name.
- \`ui-form-control\`: \`FormControl\` — Direct form control input.
- \`ui-form-control-name\`: \`string\` — Control name to get from the form group.
- \`ui-stack-label\`: \`boolean\` — If true, the label appears above the input.
- \`ui-label\`: \`string\` — The label for the form field.
- \`ui-placeholder\`: \`string\` — Placeholder for inputs.
- \`ui-errors\`: \`string[]\` — List of custom error messages to show.
- \`ui-instructions\`: \`string\` — Instructional text for the input.
- \`ui-instructions-tooltip\`: \`string\` — Tooltip shown beside instructions.
- \`ui-type\`: \`'text' | 'number' | 'phone' | 'currency' | 'date'\` — Input type.
- \`ui-max-length\`: \`number | string | null\` — Max string length allowed.
- \`ui-readonly\`: \`boolean\` — Makes input readonly.
- \`ui-outline-color\`: \`'default' | 'primary'\` — Outline color style.

### Utilities
- Automatically binds form controls from parent forms using \`formControlName\` or \`formGroup\`.
- Handles phone number formatting and trimming input.
- Provides default validation messages with placeholders.
        `
      }
    }
  }
};

export default meta;
