import { INotificationData } from '@dealer-portal/polaris-ui';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PolarisNotification } from './polaris-notification.component';
import { PolarisIcon } from '../polaris-icon/polaris-icon.component';
import { PolarisButton } from '../polaris-button/polaris-button.component';
import { NotificationType } from './polaris-notification.enum';

class MockMatSnackBarRef {
  dismissWithAction = () => console.log('Dismissed with action');
}

const mockSnackBarRef = new MockMatSnackBarRef() as MatSnackBarRef<PolarisNotification>;

const meta: Meta<PolarisNotification> = {
  title: 'Polaris/Notification',
  component: PolarisNotification,
  decorators: [
    moduleMetadata({
      imports: [
        MatSnackBarModule,
        MatProgressBarModule,
        PolarisIcon,
        PolarisButton,
      ],
    }),
  ],
  args: {
    testId: 'notification-1',
    progress: 100,
    notificationData: {
      type: NotificationType.Success,
      message: 'Your profile was saved successfully.',
    },
    snackBarRef: mockSnackBarRef,
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PolarisNotification>;

export const Success: Story = {};

export const WithAction: Story = {
  args: {
    notificationData: {
      type: NotificationType.Info,
      message: 'New version available.',
      actionText: 'Update',
    },
  },
};
