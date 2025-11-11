import { Component, EventEmitter, Input, Output, ContentChild, ElementRef, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { PolarisHeading } from '../polaris-heading';
import { PolarisIcon } from '../polaris-icon';
import { PolarisIconButton } from '../polaris-icon-button/polaris-icon-button.component';

@Component({
  selector: 'polaris-dialog',
  imports: [
    CommonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    PolarisIcon,
    PolarisHeading,
    PolarisIconButton,
  ],
  templateUrl: './polaris-dialog.component.html',
  styleUrl: './polaris-dialog.component.scss',
})
export class PolarisDialog {
  @Input() public hideCloseButton: boolean = false;
  /** Allows the user to force-hide the actions section even if content is provided */
  @Input() public hideActions: boolean = false;

  /** Whether actions content exists */
  public hasActionsContent = false;

  @Output() onDialogClose: EventEmitter<void> = new EventEmitter<void>();

  public closeButtonClicked(): void {
    this.onDialogClose.emit();
  }
}
