import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PolarisNotification } from './polaris-notification.component';
import { NotificationType } from './polaris-notification.enum';
import { INotificationOptions } from './polaris-notification.types';

@Injectable({
  providedIn: 'root',
})
export class PolarisNotificationService {
  public defaultDuration: number = 5000;
  private _defaultNotificationOptions: INotificationOptions = { duration: this.defaultDuration };

  constructor(
    private _snackBar: MatSnackBar,
    @Inject(DOCUMENT) private _doc: Document,
  ) {}

  private _applyHeaderOffsetVar(): void {
    const header: HTMLElement | null = this._doc.querySelector<HTMLElement>('header.main-header');
    const height: number = header ? Math.ceil(header.getBoundingClientRect().height) : 8;
    this._doc.documentElement.style.setProperty('--main-header-height', `${height}px`);
  }


  public notify(message: string, type: NotificationType, notificationOptions?: INotificationOptions): void {
    notificationOptions = { ...this._defaultNotificationOptions, ...notificationOptions };

    this._applyHeaderOffsetVar();

    this._snackBar.openFromComponent(PolarisNotification, {
      duration: notificationOptions.duration,
      panelClass: [`polaris-notification-panel-${type.toLowerCase()}`],
      data: {
        message,
        type,
        actionText: notificationOptions.actionText,
        onAction: notificationOptions.onAction,
      },
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  public danger(message: string, options?: INotificationOptions): void {
    this.notify(message, NotificationType.Danger, options);
  }

  public warning(message: string, options?: INotificationOptions): void {
    this.notify(message, NotificationType.Warning, options);
  }

  public info(message: string, options?: INotificationOptions): void {
    this.notify(message, NotificationType.Info, options);
  }

  public success(message: string, options?: INotificationOptions): void {
    this.notify(message, NotificationType.Success, options);
  }
}
