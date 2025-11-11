import { Injectable } from '@angular/core';
import {
  PolarisDialogService,
} from '@dealer-portal/polaris-ui';
import { StandardDialogComponent } from '../../_components/standard-dialog/standard-dialog.component';
import { untilDestroyed } from '@ngneat/until-destroy';

@Injectable()
export class TooltipService {
  constructor(
    private _polarisDialogService: PolarisDialogService,
  ) {}

  public onTooltipClicked(translationKey: string): void {
    if (!translationKey) {
      return;
    }
    this._polarisDialogService
      .open(StandardDialogComponent, {
        minWidth: '25dvh',
        maxWidth: '50dvh',
        data: {
          title: `dialog.${translationKey}.title`,
          htmlMessage: `dialog.${translationKey}.message`,
          primaryButtonLabel: 'close'
        }
      })
      .pipe(untilDestroyed(this))
      .subscribe();
  }
}
