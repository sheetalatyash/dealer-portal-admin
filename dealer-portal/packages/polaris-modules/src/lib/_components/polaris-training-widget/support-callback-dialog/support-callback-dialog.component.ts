import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PolarisButton, PolarisDialog, PolarisInput, PolarisTextarea } from '@dealer-portal/polaris-ui';
import { TranslatePipe } from '@ngx-translate/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import {
  DealerPortalApiService,
  DealerSupportCase,
  StandardResponse,
  ValidationService,
} from '@dealer-portal/polaris-core';
import { take } from 'rxjs';

@Component({
  selector: 'support-callback-dialog',
  standalone: true,
  imports: [
    CommonModule,
    PolarisDialog,
    PolarisButton,
    TranslatePipe,
    PolarisInput,
    ReactiveFormsModule,
    PolarisTextarea,
  ],
  templateUrl: './support-callback-dialog.component.html',
  styleUrls: ['./support-callback-dialog.component.scss'],
})
export class SupportCallbackDialogComponent {
  public hasSubmitted = false;
  public isSubmissionSuccess = false;

  form: FormGroup<{
    contactName: FormControl<string | null>;
    contactPhone: FormControl<string | null>;
    question: FormControl<string | null>;
  }>;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      contactName: string;
      supportPhoneNumber: string;
      isOffHours: boolean;
    },
    public dialogRef: MatDialogRef<SupportCallbackDialogComponent>,
    private fb: FormBuilder,
    private _dealerPortalService: DealerPortalApiService,
    private _validatorService: ValidationService,
  ) {
    this.form = this.fb.group({
      contactName: [data.contactName ?? '', Validators.required],
      contactPhone: ['', [Validators.required, this._validatorService.phoneValidator()]],
      question: ['', Validators.required],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.disableClose = true;
    this.form.disable();

    this._dealerPortalService
      .createDealerSupportCase(
        new DealerSupportCase({
          contactName: this.form.value.contactName ?? '',
          contactPhone: this.form.value.contactPhone ?? '',
          question: this.form.value.question ?? '',
        }),
      )
      .pipe(take(1))
      .subscribe((result: StandardResponse<unknown>) => {
        this.hasSubmitted = true;
        this.isSubmissionSuccess = result.success;
        this.dialogRef.disableClose = false;
      });
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }
}
