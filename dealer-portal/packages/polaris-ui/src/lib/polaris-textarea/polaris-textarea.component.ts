import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import { PolarisIcon } from '../polaris-icon';
import { PolarisUiFormBase } from '../polaris-ui-form-base';

@Component({
  selector: 'polaris-textarea',
  imports: [
    CommonModule,
    PolarisIcon,
    MatLabel,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    TextFieldModule,
  ],
  templateUrl: './polaris-textarea.component.html',
  styleUrl: './polaris-textarea.component.scss',
})
export class PolarisTextarea<T> extends PolarisUiFormBase<T> implements OnInit {
  /**
   * Controls whether the textarea is resizable by the user.
   */
  @Input('ui-resizable') public isResizable: boolean = false;

  /**
   * Minimum number of rows for autosize.
   */
  @Input('ui-min-rows') public minRows: number = 3;

  /**
   * Maximum number of rows for autosize.
   */
  @Input('ui-max-rows') public maxRows?: number = 5;

  public override ngOnInit(): void {
    super.ngOnInit();
    this._setTestId();
    // Validation for minRows and maxRows
    if (this.minRows < 1) {
      this.minRows = 1;
    }
    if (this.maxRows && this.maxRows < this.minRows) {
      this.maxRows = this.minRows;
    }
  }

  private _setTestId(): void {
    this.testId =
      `polaris-textarea-` +
      this.label
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .trim();
  }
}
