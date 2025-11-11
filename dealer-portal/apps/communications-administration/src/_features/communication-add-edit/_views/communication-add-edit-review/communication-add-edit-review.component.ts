import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunicationDetailsComponent } from '@components/communication-details/communication-details.component';
import { CommunicationTranslation } from '@classes/communication-translation.class';
import { Communication, CommunicationMessage } from '@dealer-portal/polaris-core';
import { CommunicationsService } from '@services/communications/communications.service';
import { PolarisDialogService, PolarisNotificationService } from '@dealer-portal/polaris-ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { StandardDialogComponent } from '../../_components/standard-dialog/standard-dialog.component';

@UntilDestroy()
@Component({
    selector: 'ca-communication-add-edit-review',
    imports: [CommonModule, CommunicationDetailsComponent],
    templateUrl: './communication-add-edit-review.component.html',
    styleUrl: './communication-add-edit-review.component.scss'
})
export class CommunicationAddEditReviewComponent implements OnInit {
  @Input() communication?: Communication;

  @Output() loadingChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  reviewedCommunication?: Communication;
  isLoading = false;

  constructor(
    private _communicationsService: CommunicationsService,
    private _dialogService: PolarisDialogService,
    private _notificationService: PolarisNotificationService,
    private _translate: TranslateService
  ) {}

  public ngOnInit(): void {
    this.reviewedCommunication = new Communication(this.communication);
  }

  public onDeleteTranslation(translation: CommunicationTranslation): void {
    this._dialogService
      .open(StandardDialogComponent, {
        minWidth: '25dvh',
        maxWidth: '50dvh',
        data: {
          title: 'dialog.delete-translation.title',
          message: 'dialog.delete-translation.message',
          primaryButtonLabel: 'delete',
          secondaryButtonLabel: 'cancel',
          language: translation.language
        },
      })
      .pipe(untilDestroyed(this))
      .subscribe((confirmed?: boolean) => {
        if (confirmed) {
          this.isLoading = true;
          this.loadingChange.emit(this.isLoading);
          // Delete the translation once confirmed from the user
          this._communicationsService
            .updateTranslations$(
              new Communication({
                communicationGuid: this.communication?.communicationGuid,
                defaultMessage: this.communication?.defaultMessage,
                messages: this.communication?.messages?.filter(
                  (message: CommunicationMessage): boolean => message.cultureCode !== translation.cultureCode
                ),
              })
            )
            .pipe(untilDestroyed(this))
            .subscribe((updatedCommunication) => {
              this.isLoading = false;
              this.loadingChange.emit(this.isLoading);
              // An non-null communicationGuid indicates the update was successful
              if (updatedCommunication.communicationGuid) {
                this.reviewedCommunication = updatedCommunication;
                this._notificationService.success(this._translate.instant('notification.translation-delete.success'));
              } else {
                this._notificationService.danger(this._translate.instant('notification.translation-delete.failed'));
              }
            });
        }
      });
  }
}
