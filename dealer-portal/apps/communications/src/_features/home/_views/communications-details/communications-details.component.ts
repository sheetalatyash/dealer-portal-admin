import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommunicationBadgeComponent, WysiwygViewerComponent } from '@components';
import {
  CommunicationAttachment,
  Communication,
  CommunicationType,
  ResourceService,
  UserAccountService, 
  CommunicationReadableAttachments,
  CommunicationReadableAttachment,
  CommunicationReadableAttachmentMessage,
} from '@dealer-portal/polaris-core';
import { selectedCommunicationGuid$ } from '@dealer-portal/polaris-modules';
import { PolarisIcon, PolarisIconButton, PolarisLoader, PolarisNotificationService } from '@dealer-portal/polaris-ui';
import { Route } from '@enums';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommunicationsService } from '@services';
import { forkJoin, Observable, tap } from 'rxjs';

@UntilDestroy()
@Component({
    selector: 'comm-communications-details',
    imports: [
        CommonModule,
        RouterLink,
        MatButtonModule,
        CommunicationBadgeComponent,
        WysiwygViewerComponent,
        PolarisIconButton,
        PolarisLoader,
        PolarisIcon,
        TranslatePipe
    ],
    templateUrl: './communications-details.component.html',
    styleUrl: './communications-details.component.scss'
})
export class CommunicationsDetailsComponent implements OnInit {
  readonly Route: typeof Route = Route;

  public communication: Communication | null = null;
  public isLoading: boolean = true;
  public dateFormat: string = this._translate.instant('date-format');
  public attachmentFile: CommunicationReadableAttachments | null = null;
  /**
   * property for indicating if is logged in user is impersonating.
   */
  public get disableActivity(): boolean {
    return (this._userAccountService.userAccount.isImpersonating ?? false) || this.communication?.groupName === CommunicationType.Video;
  }

  constructor(
    private _route: ActivatedRoute,
    private _communicationService: CommunicationsService,
    private _polarisNotificationService: PolarisNotificationService,
    private _userAccountService: UserAccountService,
    private _resourceService: ResourceService,
    private _translate: TranslateService
  ) {}

  public ngOnInit(): void {
    this._subscribeToSelectedCommunicationGuid();
  }

  private _getAttachmentUrl(attachment: CommunicationAttachment): string {
    const message: CommunicationReadableAttachmentMessage | undefined = this.attachmentFile?.messages.find((communicationMessage): boolean | undefined =>
      communicationMessage.fileAttachments?.some((communicationAttachment: CommunicationReadableAttachment): boolean => {
        return communicationAttachment.attachmentId === attachment.attachmentId
      })
    );

    const file: CommunicationReadableAttachment | undefined = message?.fileAttachments?.find((communicationAttachment: CommunicationReadableAttachment): boolean => {
      return communicationAttachment.attachmentId === attachment.attachmentId;
    });

    return file?.url ?? '';
  }

  private _subscribeToSelectedCommunicationGuid(): void {
    selectedCommunicationGuid$.pipe(
      tap((selectedCommunicationGuid: string | undefined): void => {
        this.getCommunication(selectedCommunicationGuid);
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  /**
   * Fetches the communication details based on the communication ID from the route and current culture code
   */
  public getCommunication(commGuid: string | undefined = undefined): void {
    const communicationGuid = commGuid ? commGuid : this._route.snapshot.paramMap.get('communicationGuid');
    const cultureCode = this._resourceService.getCultureCode();

    if (communicationGuid) {
      forkJoin([
        this._communicationService.getCommunication$(communicationGuid, cultureCode),
        this._communicationService.getAttachments$(communicationGuid)
      ])
        .pipe(untilDestroyed(this))
        .subscribe(([communication, attachments]) => {
          this.communication = communication;
          this.attachmentFile = attachments;
          this.isLoading = false;

          if (!communication) {
            this._polarisNotificationService.danger(this._translate.instant('notification.communication-not-found'));
          } else if (!communication.isRead && !(this._userAccountService.userAccount.isImpersonating ?? false)) {
            this._markAsRead(communication);
          }
        });
    } else {
      this._polarisNotificationService.danger(this._translate.instant('notification.return-home'));
    }
  }

  /**
   * Marks the communication as read.
   * If the update fails, it reverts the communication's read state.
   * @param communication - The communication to mark as read.
   */
  private _markAsRead(communication: Communication): void {
    const previousState: boolean = communication.isRead as boolean;
    communication.isRead = true;
    this._communicationService
      .setCommunicationRead$(communication.communicationGuid as string, true)
      .pipe(untilDestroyed(this))
      .subscribe((success: boolean): void => {
        if (!success) {
          communication.isRead = previousState;
        }
      });
  }

  /**
   * Handles the result of an action observable, displaying success or failure messages.
   * @param action$ - The observable representing the action.
   * @param failureMessage - The message to display on failure.
   * @param undoAction - Optional undo action to perform on success.
   * @param onFailure - Optional callback to execute on failure.
   */
  private _handleAction(
    action$: Observable<boolean>,
    failureMessage: string,
    undoAction?: () => void,
    onFailure?: () => void
  ): void {
    action$.pipe(untilDestroyed(this)).subscribe((success: boolean): void => {
      if (!success){
        if (onFailure) {
          onFailure();
        }

        this._polarisNotificationService.danger(failureMessage, {
          actionText: this._translate.instant('notification.try-again'),
          onAction: undoAction,
        });
      }
    });
  }

  /**
   * Sets the favorited state of a communication.
   * @param communication - The communication to update.
   * @param isFavorited - The new favorited state.
   */
  public setFavorited(communication: Communication | null, isFavorited: boolean): void {
    if (communication) {
      const previousState: boolean = communication.isFavorite as boolean;
      communication.isFavorite = isFavorited;
      this._handleAction(
        this._communicationService.setCommunicationFavorited$(communication.communicationGuid as string, isFavorited),
        this._translate.instant('notification.failed'),
        (): void => this.setFavorited(communication, !isFavorited),
        (): boolean => (communication.isFavorite = previousState)
      );
    }
  }

  /**
   * Sets the archived state of a communication.
   * @param communication - The communication to update.
   * @param isArchived - The new archived state.
   */
  public setArchived(communication: Communication | null, isArchived: boolean): void {
   if (communication) {
     const previousState: boolean = communication.isArchive as boolean;
     communication.isArchive = isArchived;
     this._handleAction(
       this._communicationService.setCommunicationArchived$(communication.communicationGuid as string, isArchived),
       this._translate.instant('notification.action-failed'),
       () => this.setArchived(communication, !isArchived),
       () => (communication.isArchive = previousState)
     );
   }
  }

  /**
   * Sets the read state of a communication.
   * @param communication - The communication to update.
   * @param isRead - The new read state.
   */
  public setRead(communication: Communication | null, isRead: boolean): void {
    if (communication) {
      const previousState: boolean = communication.isRead as boolean;
      communication.isRead = isRead;
      this._handleAction(
        this._communicationService.setCommunicationRead$(communication.communicationGuid as string, isRead),
        this._translate.instant('notification.failed'),
        (): void => this.setRead(communication, !isRead),
        (): boolean => (communication.isRead = previousState)
      );
    }
  }

  public onDownloadAttachment(attachment: CommunicationAttachment): void {
    this.onDownloadAttachments([attachment]);
  }

  /**
   * Downloads one or more attachments by creating temporary anchor elements
   * and triggering a download for each attachment.
   *
   * This method assumes that the attachment URLs are same-origin CDN URLs.
   * If the URLs are different-origin, an alternative download method will be required.
   *
   * @param attachments - An array of CommunicationAttachment objects to download.
   */
  public async onDownloadAttachments(attachments: CommunicationAttachment[]): Promise<void> {
    for (const attachment of attachments) {
      // This method to download is straightforward but only works with same-origin CDN URLs
      // If we don't end up using a same-origin CDN URL, we'll need to come up with a different method
      const attachmentLink: HTMLAnchorElement = document.createElement('a');
      attachmentLink.href = this._getAttachmentUrl(attachment);
      attachmentLink.download = attachment.name as string;

      // Append to the DOM to ensure proper behavior
      document.body.appendChild(attachmentLink); 

      attachmentLink.click();

      // Use setTimeout to allow the browser to process the click before continuing the loop
      setTimeout(() => {
        document.body.removeChild(attachmentLink); // Clean up after triggering the download
      }, 100);

      await new Promise(resolve => setTimeout(resolve, 300));
    };
  }
}
