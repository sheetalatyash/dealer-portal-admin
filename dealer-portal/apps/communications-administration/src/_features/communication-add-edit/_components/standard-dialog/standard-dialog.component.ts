import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PolarisButton, PolarisDialog } from '@dealer-portal/polaris-ui';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'ca-standard-dialog',
  standalone: true,
  imports: [CommonModule, PolarisDialog, PolarisButton, TranslatePipe],
  templateUrl: './standard-dialog.component.html',
  styleUrls: ['./standard-dialog.component.scss'],
})
export class StandardDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<StandardDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      htmlMessage?: string;
      primaryButtonLabel: string;
      secondaryButtonLabel: string;
      language?: string;
    },
  ) {}

  public closeDialog(confirm: boolean): void {
    this.dialogRef.close(confirm);
  }
}
