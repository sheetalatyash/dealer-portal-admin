import { Injectable } from '@angular/core';
import {
  Communication,
  CommunicationAccountSummary,
  CommunicationAttachment,
  CommunicationListingOptions,
  CommunicationMessage,
  CommunicationReadableAttachments,
  CommunicationsApiService,
  LoggerService,
  PaginationResponse,
  StandardResponse,
} from '@dealer-portal/polaris-core';
import { map, Observable, of, tap } from 'rxjs';

@Injectable()
export class CommunicationsService {
  constructor(private _communicationApi: CommunicationsApiService, private _loggerService: LoggerService) {}

  /**
   * Retrieves a list of communications.
   *
   * @param options - The options to filter the communications.
   * @param pageNumber - The page number to retrieve.
   * @param pageSize - The number of items per page.
   * @returns An observable that emits a `PaginationResponse` containing an array of `CommunicationListing` objects.
   *
   * @example
   * getCommunications$(options, 1, 10).subscribe(communications => {
   *   console.log('Communications:', communications);
   * });
   */
  public getCommunications$(
    options: CommunicationListingOptions,
    pageNumber: number,
    pageSize: number,
  ): Observable<PaginationResponse<Communication>> {
    return this._communicationApi.getAdminCommunications$(options, pageNumber, pageSize).pipe(
      tap(({ success, error }: PaginationResponse<Communication>) => {
        if (!success) {
          this._loggerService.logWarning('Failed to get Communication', {
            requestOptions: options,
            requestPageNumber: pageNumber,
            requestPageSize: pageSize,
            error,
          });
        }
      }),
      map((paginationResponse: PaginationResponse<Communication>) =>
        paginationResponse.mapData((communicationEntity: Communication) => new Communication(communicationEntity)),
      ),
    );
  }

  /**
   * Retrieves a specific communication by its ID.
   *
   * @param communicationGuid - The ID of the communication to be retrieved.
   * @returns An observable that emits a `Communication` object.
   *
   * @example
   * getCommunication$('comm123').subscribe(communication => {
   *   console.log('Communication:', communication);
   * });
   */
  public getCommunication$(communicationGuid: string): Observable<Communication | undefined> {
    return this._communicationApi.getAdminCommunication$(communicationGuid).pipe(
      tap(({ success, error }: StandardResponse<Communication>) => {
        if (!success) {
          this._loggerService.logError('Failed to get Communication', {
            communicationGuid,
            error,
          });
        }
      }),
      map((communicationEntity: StandardResponse<Communication>): Communication | undefined =>
        communicationEntity.data ? new Communication(communicationEntity.data) : undefined,
      ),
    );
  }

  /**
   * Retrieves the account summary for a specific communication.
   *
   * @param communicationGuid - The unique identifier of the communication.
   * @returns An observable that emits a `CommunicationAccountSummary` object containing the account summary details for the specified communication.
   *
   * @example
   * getCommunicationAccountSummary$('comm123').subscribe(accountSummary => {
   *   console.log('Communication Account Summary:', accountSummary);
   * });
   */
  public getCommunicationAccountSummary$(communicationGuid: string): Observable<CommunicationAccountSummary> {
    return this._communicationApi
      .getCommunicationAccountSummary$(communicationGuid)
      .pipe(
        map(
          (communicationEntity: StandardResponse<CommunicationAccountSummary>): CommunicationAccountSummary =>
            new CommunicationAccountSummary(communicationEntity.data),
        ),
      );
  }

  /**
   * Creates a communication.
   *
   * @param communication - The `Communication` object containing details to be created.
   * @returns An observable that emits the created `Communication` ID as a string.
   *
   * @example
   * createCommunication$(communication).subscribe(createdCommunicationGuid => {
   *   console.log('Created Communication Id:', createdCommunicationGuid);
   * });
   */
  public createCommunication$(communication: Communication): Observable<string> {
    const newCommunication: Communication = new Communication(communication);

    // Ensure the communication ID is not set when creating a new communication
    communication.communicationGuid = undefined;

    return this._communicationApi.createCommunication$(newCommunication).pipe(
      tap(({ success, error }: StandardResponse<Communication>) => {
        if (!success) {
          this._loggerService.logError('Failed to create Communication', {
            communicationToCreate: communication,
            error,
          });
        }
      }),
      map(({ data }: StandardResponse<Communication>) => {
        return data?.communicationGuid ?? '';
      }),
    );
  }

  /**
   * Updates a communication.
   *
   * @param communication - The `Communication` object containing details to be updated.
   * @returns An observable that emits a boolean indicating whether the update was successful.
   *
   * @example
   * updateCommunication$(communication).subscribe(updateSuccessful => {
   *   console.log('Updated Communication Successfully:', updateSuccessful);
   * });
   */
  public updateCommunication$(communication: Communication): Observable<boolean> {
    return this._communicationApi.updateCommunication$(communication).pipe(
      tap(({ success, error }: StandardResponse<Communication>) => {
        if (!success) {
          this._loggerService.logError('Failed to Update Communication Details', {
            communicationToUpdate: communication,
            error,
          });
        }
      }),
      map(({ success }: StandardResponse<Communication>) => {
        return success;
      }),
    );
  }

  /**
   * Updates the account targets of a communication.
   *
   * @param communication - The `Communication` object containing updated account targets.
   * @returns An observable that emits a boolean indicating whether the update was successful.
   *
   * @example
   * updateAccountTargets$(communication).subscribe(updateSuccessful => {
   *   console.log('Updated Communication Account Targets Successfully:', updateSuccessful);
   * });
   */
  public updateAccountTargets$(communication: Communication): Observable<boolean> {
    return this._communicationApi.updateAccountTargets$(communication).pipe(
      tap(({ success, error }: StandardResponse<Communication>) => {
        if (!success) {
          this._loggerService.logError('Failed to Update Communication Account Targets', {
            communicationToUpdate: communication,
            error,
          });
        }
      }),
      map(({ success }: StandardResponse<Communication>) => {
        return success;
      }),
    );
  }

  /**
   * Updates the user targets of a communication.
   *
   * @param communication - The `Communication` object containing updated user targets.
   * @returns An observable that emits a boolean indicating whether the update was successful.
   *
   * @example
   * updateUserTargets$(communication).subscribe(updateSuccessful => {
   *   console.log('Updated Communication User Targets Successfully:', updateSuccessful);
   * });
   */
  public updateUserTargets$(communication: Communication): Observable<boolean> {
    return this._communicationApi.updateUserTargets$(communication).pipe(
      tap(({ success, error }: StandardResponse<Communication>) => {
        if (!success) {
          this._loggerService.logError('Failed to Update Communication User Targets', {
            communicationToUpdate: communication,
            error,
          });
        }
      }),
      map(({ success }: StandardResponse<Communication>) => {
        return success;
      }),
    );
  }

  /**
   * Updates the translations of a communication.
   *
   * @param communication - The `Communication` object containing updated translations.
   * @returns An observable that emits the updated `Communication` object.
   *
   * @example
   * updateTranslations$(communication).subscribe(updatedCommunication => {
   *   console.log('Updated Communication Translations Successfully:', updatedCommunication);
   * });
   */
  public updateTranslations$(communication: Communication): Observable<Communication> {
    return this._communicationApi.updateTranslations$(communication.toSaveTranslationsEntity()).pipe(
      tap(({ success, error }: StandardResponse<Communication>) => {
        if (!success) {
          this._loggerService.logError('Failed to Update Communication Translations', {
            communicationToUpdate: communication,
            error,
          });
        }
      }),
      map(({ data }: StandardResponse<Communication>) => {
        return new Communication(data);
      }),
    );
  }

  /**
   * Updates the status of a communication.
   *
   * @param communication - The `Communication` object whose status is to be updated.
   * @param statusId - The ID of the new status to be set.
   * @returns An observable that emits a boolean indicating whether the update was successful.
   *
   * @example
   * updateStatus$(communication).subscribe(updateSuccessful => {
   *   console.log('Updated Communication Status Successfully:', updateSuccessful);
   * });
   */
  public updateStatus$(communication: Communication, statusId: number): Observable<boolean> {
    if (!communication.communicationGuid) {
      this._loggerService.logError('Failed to Update Communication Status', {
        communicationToUpdate: communication,
        error: new Error('Missing Communication ID'),
      });

      return of(false);
    }

    return this._communicationApi.updateStatus$(communication.communicationGuid, statusId).pipe(
      tap(({ success, error }: StandardResponse<Communication>) => {
        if (!success) {
          this._loggerService.logError('Failed to Update Communication Status', {
            communicationToUpdate: communication,
            statusId,
            error,
          });
        }
      }),
      map(({ success }: StandardResponse<Communication>) => {
        return success;
      }),
    );
  }

  /**
   * Uploads a single attachment file for a communication message in a specific culture.
   *
   * @param communication - The communication object to attach the file to
   * @param cultureCode - The culture code for the specific message translation
   * @param file - The file to upload as an attachment
   * @returns An observable that emits the updated `CommunicationMessage` object if successful, or `undefined` if the upload fails
   *
   * @example
   * const file = event.target.files[0];
   * uploadAttachment$(communication, 'en-US', file).subscribe(updatedMessage => {
   *   if (updatedMessage) {
   *     console.log('File uploaded successfully:', file.name);
   *   } else {
   *     console.error('File upload failed');
   *   }
   * });
   */
  public uploadAttachment$(
    communication: Communication,
    cultureCode: string,
    file: File,
  ): Observable<CommunicationMessage | undefined> {
    if (communication.communicationGuid === undefined) {
      this._loggerService.logError('Failed to Upload Communication Attachment', {
        communication,
        error: new Error('Missing Communication GUID'),
      });

      return of(undefined);
    }

    const messageId = communication.messages?.find((message) => message.cultureCode === cultureCode)?.messageId;

    if (messageId === undefined) {
      this._loggerService.logError('Failed to Upload Communication Attachment', {
        communication,
        error: new Error('Missing Communication Message ID'),
      });

      return of(undefined);
    }

    return this._communicationApi.uploadAttachment$(communication.communicationGuid, messageId, file).pipe(
      tap(({ success, error }: StandardResponse<Communication>) => {
        if (!success) {
          this._loggerService.logError('Failed to Upload Communication Attachment', {
            communication,
            messageId,
            file,
            error,
          });
        }
      }),
      map(({ success, data }: StandardResponse<Communication>) => {
        if (success) {
          const updatedCommunication = new Communication(data);
          const updatedMessage = updatedCommunication.messages?.find((message) => message.messageId === messageId);

          return updatedMessage;
        }

        return undefined;
      }),
    );
  }

  /**
   * Deletes an attachment from a communication for a specific culture code.
   *
   * @param communication - The communication object containing the attachment.
   * @param cultureCode - The culture code used to identify the message within the communication.
   * @param attachment - The attachment to be deleted.
   * @returns An observable emitting the updated communication object if successful, or `undefined` if deletion fails.
   */
  public deleteAttachment$(
    communication: Communication,
    cultureCode: string,
    attachment: CommunicationAttachment,
  ): Observable<CommunicationMessage | undefined> {
    if (communication.communicationGuid === undefined) {
      this._loggerService.logError('Failed to Delete Communication Attachment', {
        communication,
        error: new Error('Missing Communication GUID'),
      });

      return of(undefined);
    }

    const messageId = communication.messages?.find((message) => message.cultureCode === cultureCode)?.messageId;

    if (messageId === undefined) {
      this._loggerService.logError('Failed to Delete Communication Attachment', {
        communication,
        error: new Error('Missing Communication Message ID'),
      });

      return of(undefined);
    }

    if (attachment.attachmentId === undefined) {
      this._loggerService.logError('Failed to Delete Communication Attachment', {
        communication,
        error: new Error('Missing Communication Attachment ID'),
      });

      return of(undefined);
    }

    return this._communicationApi
      .deleteAttachment$(communication.communicationGuid, messageId, attachment.attachmentId)
      .pipe(
        tap(({ success, error }: StandardResponse<Communication>) => {
          if (!success) {
            this._loggerService.logError('Failed to Delete Communication Attachment', {
              communication,
              messageId,
              attachment,
              error,
            });
          }
        }),
        map(({ success, data }: StandardResponse<Communication>) => {
          if (success) {
            const updatedCommunication = new Communication(data);
            const updatedMessage = updatedCommunication.messages?.find((message) => message.messageId === messageId);

            return updatedMessage;
          }

          return undefined;
        }),
      );
  }

  /**
   * Retrieves all readable attachments for a communication.
   *
   * @param communication - The communication object to retrieve attachments for
   * @returns An observable that emits a `CommunicationReadableAttachments` object containing
   * all attachments across message translations, or `undefined` if retrieval fails
   *
   * @example
   * getAttachments$(communication).subscribe(attachments => {
   *   if (attachments) {
   *     console.log('Retrieved attachments:', attachments);
   *   } else {
   *     console.error('Failed to retrieve attachments');
   *   }
   * });
   */
  public getAttachments$(communication: Communication): Observable<CommunicationReadableAttachments | undefined> {
    if (communication.communicationGuid === undefined) {
      this._loggerService.logError('Failed to Get Communication Attachments', {
        communication,
        error: new Error('Missing Communication GUID'),
      });

      return of(undefined);
    }

    return this._communicationApi.getAttachments$(communication.communicationGuid).pipe(
      tap(({ success, error }: StandardResponse<CommunicationReadableAttachments>) => {
        if (!success) {
          this._loggerService.logError('Failed to Get Communication Attachments', {
            communication,
            error,
          });
        }
      }),
      map(({ success, data }: StandardResponse<CommunicationReadableAttachments>) => {
        if (success) {
          return new CommunicationReadableAttachments(data);
        }

        return undefined;
      }),
    );
  }
}
