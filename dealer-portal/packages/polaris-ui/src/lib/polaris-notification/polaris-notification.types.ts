import { NotificationType } from './polaris-notification.enum';

export interface INotificationData {
  message: string;
  type: NotificationType;
  actionText?: string;
  onAction?: () => void;
}

export interface INotificationOptions {
  actionText?: string;
  duration?: number;
  onAction?: () => void;
}
