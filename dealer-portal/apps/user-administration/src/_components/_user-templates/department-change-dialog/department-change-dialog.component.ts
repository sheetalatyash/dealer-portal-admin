import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PolarisButton, PolarisDialog } from '@dealer-portal/polaris-ui';
/**
 * A dialog component for confirming department changes in the User Administration application.
 * This component displays a confirmation message and buttons to confirm or cancel the department change.
 */
@Component({
  selector: 'ua-department-change-dialog',
  imports: [
    CommonModule,
    PolarisButton,
    PolarisDialog,
  ],
  templateUrl: './department-change-dialog.component.html',
  styleUrl: './department-change-dialog.component.scss'
})
export class DepartmentChangeDialogComponent {


  constructor(
    public dialogRef: MatDialogRef<DepartmentChangeDialogComponent>,
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
