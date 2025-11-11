import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PolarisIcon } from '../polaris-icon';
import { PolarisUiFormBase } from '../polaris-ui-form-base';

@Component({
    selector: 'polaris-input',
    imports: [
        CommonModule,
        PolarisIcon,
        MatLabel,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
    templateUrl: './polaris-input.component.html',
    styleUrl: './polaris-input.component.scss'
})
export class PolarisInput<T> extends PolarisUiFormBase<T> implements OnInit {
  @Input() public infoTooltip!: string;

  public override ngOnInit(): void {
    super.ngOnInit();
    this._setPlaceholder();
    this._setTestId();
  }

  /**
   * Sets the default placeholder based on the input type.
   *
   * @remarks
   * This method checks the value of the `type` property and sets the `placeholder` property accordingly.
   * If the `type` is 'phone', the placeholder is set to '(000) 000-0000'.
   * If the `type` is not 'phone', the placeholder remains unchanged
   * (Currently, only 'phone' is supported).
   *
   * @returns {void}
   */
  // TODO: Add other default placeholders based on the input type
  private _setPlaceholder(): void {
    if (this.type === 'phone') {
      this.placeholder = '(000) 000-0000';
    }
  }

  private _setTestId(): void {
    this.testId = `polaris-input-` + this.label
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '') // Remove special characters
      .trim();
  }
}
