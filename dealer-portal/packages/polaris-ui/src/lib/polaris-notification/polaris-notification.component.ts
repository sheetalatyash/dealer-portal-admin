import { CommonModule } from '@angular/common';
import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PolarisButton } from '../polaris-button';
import { PolarisIcon } from '../polaris-icon';
import { PolarisUiBase } from '../polaris-ui-base';
import { NotificationType } from './polaris-notification.enum';
import { PolarisNotificationService } from './polaris-notification.service';
import { INotificationData } from './polaris-notification.types';

@UntilDestroy()
@Component({
    selector: 'polaris-notification',
    imports: [
        CommonModule,
        MatProgressBarModule,
        MatButtonModule,
        MatIconModule,
        PolarisButton,
        PolarisIcon,
    ],
    templateUrl: './polaris-notification.component.html',
    styleUrl: './polaris-notification.component.scss'
})
export class PolarisNotification extends PolarisUiBase implements OnInit {
  public iconType: string = '';
  public progress: number = 0;
  public notificationType: string = '';

  private _animationFrameId: number = 0;
  private _animationStartTimestamp: number = 0;
  private _animationDurationMilliseconds: number = 0;

  private static readonly _progressMaximumPercent: number = 100;

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public notificationData: INotificationData,
    public snackBarRef: MatSnackBarRef<PolarisNotification>,
    private readonly _polarisNotificationService: PolarisNotificationService,
    private readonly _ngZone: NgZone,
  ) {
    super();

    // Start progress immediately so it matches the snackbar’s internal timer.
    const configuredDuration: number | undefined =
      this.snackBarRef.containerInstance.snackBarConfig.duration;

    const effectiveDuration: number =
      Number.isFinite(configuredDuration as number) && (configuredDuration as number) > 0
        ? (configuredDuration as number)
        : this._polarisNotificationService.defaultDuration;

    this._runProgressBar(effectiveDuration);

    // Stop the animation if the snackbar is dismissed early.
    this.snackBarRef
      .afterDismissed()
      .pipe(untilDestroyed(this))
      .subscribe((): void => this._stopProgressBar());
  }

  public ngOnInit(): void {
    this._initializeIconClass(this.notificationData.type);
  }

  public triggerAction(): void {
    const onAction: (() => void) | undefined = this.notificationData.onAction;
    if (onAction) {
      onAction();
    }
    this.snackBarRef.dismissWithAction();
  }

  private _runProgressBar(durationMilliseconds: number): void {
    this._stopProgressBar();
    this._animationDurationMilliseconds = Math.max(0, durationMilliseconds);
    this.progress = 0;

    this._ngZone.runOutsideAngular(() => {
      this._animationStartTimestamp = performance.now();

      const tick = (highResolutionTimestamp: number): void => {
        const elapsedMilliseconds: number = highResolutionTimestamp - this._animationStartTimestamp;

        const normalizedProgress: number =
          this._animationDurationMilliseconds === 0
            ? 1
            : Math.min(1, elapsedMilliseconds / this._animationDurationMilliseconds);

        // Re-enter Angular only to update the bound value.
        this._ngZone.run((): void => {
          this.progress = normalizedProgress * PolarisNotification._progressMaximumPercent;
        });

        if (normalizedProgress < 1) {
          this._animationFrameId = requestAnimationFrame(tick);
        } else {
          this._animationFrameId = 0;
        }
      };

      this._animationFrameId = requestAnimationFrame(tick);
    });
  }

  private _stopProgressBar(): void {
    if (this._animationFrameId !== 0) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = 0;
    }
  }

  private _initializeIconClass(type: NotificationType): void {
    this.notificationType = type.toLowerCase();
    this.testId = `polaris-${this.notificationType}-notification`;

    switch (type) {
      case NotificationType.Danger:
      case NotificationType.Error:
        this.iconType = 'close';
        break;
      case NotificationType.Warning:
        this.iconType = 'check';
        break;
      case NotificationType.Info:
        this.iconType = 'info';
        break;
      case NotificationType.Success:
        this.iconType = 'check';
        break;
      default:
        return;
    }
  }
}
