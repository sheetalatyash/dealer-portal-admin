import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { PolarisRichTextEditor } from './polaris-rich-text-editor.component';
import { EditorModule } from '@tinymce/tinymce-angular';
import { MatLabel, MatError } from '@angular/material/form-field';

const meta: Meta<PolarisRichTextEditor<unknown>> = {
  title: 'Polaris/Rich Text Editor',
  component: PolarisRichTextEditor,
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        EditorModule,
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
    label: 'Notes',
    showLabel: true,
    formControl: new FormControl('<p>Initial <strong>rich</strong> text</p>'),
    outlineColor: 'primary',
    errors: [],
  },
};

export default meta;
type Story = StoryObj<PolarisRichTextEditor<unknown>>;

export const Default: Story = {};
