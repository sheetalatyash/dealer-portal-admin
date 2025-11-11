import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PolarisButton, PolarisDialog } from '@dealer-portal/polaris-ui';
import { PermissionMode } from '@enums';
import { TranslatePipe } from '@ngx-translate/core';
/**
 * A dialog component for confirming permission changes in the User Administration application.
 * This component displays a confirmation message and buttons, and does not use reactive forms or radio groups.
 */
@Component({
  selector: 'ua-permissions-selector-dialog',
  imports: [
    CommonModule,
    PolarisButton,
    PolarisDialog,
    TranslatePipe,
  ],
  templateUrl: './permissions-selector-dialog.component.html',
  styleUrl: './permissions-selector-dialog.component.scss'
})
export class PermissionsSelectorDialogComponent {


  constructor(
    public dialogRef: MatDialogRef<PermissionsSelectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      activePermissionMode: PermissionMode;
      htmlMessage: string;
      primaryButtonLabel: string;
      secondaryButtonLabel: string;
      title: string;
    },
  ) {}

  public closeDialog(confirm: boolean): void {
    this.dialogRef.close(
      {
        confirm,
        mode: this.data.activePermissionMode,
      }
    );
  }
}
