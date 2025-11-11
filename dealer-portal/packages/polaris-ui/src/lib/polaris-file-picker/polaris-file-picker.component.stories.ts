import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PolarisFilePickerFileExtension, PolarisFilePickerStatus } from '@dealer-portal/polaris-ui';
import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PolarisIconButton } from '../polaris-icon-button/polaris-icon-button.component';
import { PolarisIcon } from '../polaris-icon/polaris-icon.component';
import { PolarisFilePicker } from './polaris-file-picker.component';

const meta: Meta<PolarisFilePicker<unknown>> = {
  title: 'Polaris/File Picker',
  component: PolarisFilePicker,
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        MatProgressBarModule,
        PolarisIcon,
        PolarisIconButton,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  tags: ['autodocs'],
  args: {
    testId: 'file-picker',
    allowMultiple: true,
    allowedFileTypes: [
      PolarisFilePickerFileExtension.PDF,
      PolarisFilePickerFileExtension.DOCX,
      PolarisFilePickerFileExtension.JPG,
      PolarisFilePickerFileExtension.PNG,
    ],
    maximumFileSize: 5242880, // 5 MB
    orientation: 'vertical',
    uploadFiles: [
      {
        name: 'sample-file.pdf',
        status: PolarisFilePickerStatus.Uploading,
        progress: 30,
        testId: 'uploading-file',
      },
      {
        name: 'completed-image.jpg',
        status: PolarisFilePickerStatus.Success,
        progress: 100,
        testId: 'success-file',
      },
      {
        name: 'failed-doc.docx',
        status: PolarisFilePickerStatus.Error,
        progress: 0,
        testId: 'error-file',
      },
    ],
  },
  argTypes: {
    orientation: {
      options: ['vertical', 'horizontal'],
      control: { type: 'radio' },
    },
    allowedFileTypes: {
      control: 'select',
    },
    maximumFileSize: {
      control: 'number',
    },
    allowMultiple: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<PolarisFilePicker<unknown>>;

export const Default: Story = {};
