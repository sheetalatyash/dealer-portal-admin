import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PolarisButton, PolarisDialog, PolarisDialogService } from '@dealer-portal/polaris-ui';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'comm-help-dialog',
    imports: [CommonModule, PolarisDialog, PolarisButton, TranslatePipe],
    templateUrl: './help-dialog.component.html',
    styleUrl: './help-dialog.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HelpDialogComponent {
  constructor(
    private _polarisDialogService: PolarisDialogService
  ) {

  }

  public closeDialog(): void {
    this._polarisDialogService.closeAllDialogs();
  }
}
