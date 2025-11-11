import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PolarisButton, PolarisDialog } from '@dealer-portal/polaris-ui';
import { TranslatePipe } from '@ngx-translate/core';
/**
 * A dialog component for confirming navigating away when there are active
 * changes in the User Administration application.
 * This component displays a confirmation message and buttons.
 */
@Component({
  selector: 'ua-unsaved-changes-dialog',
  imports: [
    CommonModule,
    PolarisButton,
    PolarisDialog,
    TranslatePipe,
  ],
  templateUrl: './unsaved-changes-dialog.component.html',
  styleUrl: './unsaved-changes-dialog.component.scss'
})
export class UnsavedChangesDialogComponent {


  constructor(
    public dialogRef: MatDialogRef<UnsavedChangesDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      htmlMessage: string;
      primaryButtonLabel: string;
      secondaryButtonLabel: string;
      title: string;
    },
  ) {}

  public closeDialog(confirm: boolean): void {
    this.dialogRef.close(confirm);
  }
}
