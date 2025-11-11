import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { PolarisButton, PolarisDialog } from '@dealer-portal/polaris-ui';

@Component({
    selector: 'ca-translation-saved-dialog',
    imports: [CommonModule, PolarisDialog, PolarisButton, TranslatePipe],
    templateUrl: './translation-saved-dialog.component.html',
    styleUrl: './translation-saved-dialog.component.scss'
})
export class TranslationSavedDialogComponent {
  constructor(public dialogRef: MatDialogRef<TranslationSavedDialogComponent>) {}

  public closeDialog(): void {
    this.dialogRef.close();
  }
}
