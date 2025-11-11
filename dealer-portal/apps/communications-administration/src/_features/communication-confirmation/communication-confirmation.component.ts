import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisButton, PolarisDivider, PolarisGroupOption, PolarisHeading } from '@dealer-portal/polaris-ui';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Route } from '@enums/route.enum';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'ca-communication-confirmation',
  imports: [CommonModule, PolarisHeading, PolarisButton, TranslatePipe, PolarisDivider, ReactiveFormsModule],
  templateUrl: './communication-confirmation.component.html',
  styleUrl: './communication-confirmation.component.scss',
})
export class CommunicationConfirmationComponent {
  sendEmailFormGroup: FormGroup<{
    emailTitle: FormControl<string | null>;
    emailBody: FormControl<string | null>;
    acknowledgements: FormGroup<{
      approvalAcknowledgement: FormControl<boolean | null>;
      userNotificationAcknowledgement: FormControl<boolean | null>;
    }>;
  }> = new FormGroup({
    emailTitle: new FormControl<string>(''),
    emailBody: new FormControl<string>(''),
    acknowledgements: new FormGroup({
      approvalAcknowledgement: new FormControl<boolean>(false),
      userNotificationAcknowledgement: new FormControl<boolean>(false),
    }),
  });

  emailFormAcknowledgementOptions: PolarisGroupOption<boolean>[] = [
    new PolarisGroupOption<boolean>({
      label: this._translate.instant('acknowledgement-approval'),
      formControlName: 'approvalAcknowledgement',
    }),
    new PolarisGroupOption<boolean>({
      label: this._translate.instant('acknowledgement-user-notification'),
      formControlName: 'userNotificationAcknowledgement',
    }),
  ];

  constructor(private _router: Router, private _translate: TranslateService) {}

  public onViewAllCommunications(): void {
    this._router.navigate([Route.Communications]);
  }

  public onSend(): void {
    // TODO: Implement send email functionality
  }
}
