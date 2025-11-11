import { Injectable } from '@angular/core';
import {
  CommunicationsApiService,
  CommunicationListingOptions,
  LoggerService,
  PaginationResponse,
  StandardResponse,
  ResourceService,
  UserCommunicationUpdate,
  CommunicationGroup,
  Communication,
  CommunicationType,
  CommunicationAttachment,
  CommunicationReadableAttachments,
} from '@dealer-portal/polaris-core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LookupService } from '@services';
import { catchError, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';

@UntilDestroy()
@Injectable()
export class CommunicationsService {

  private _selectedTabCode?: number;

  constructor(
    private _communicationsApiService: CommunicationsApiService,
    private _loggerService: LoggerService,
    private _lookUpService: LookupService,
    private _resourceService: ResourceService,
  ) {}

  /**
   * Sets the currently selected tab code.
   */
  public setSelectedTab(code: number): void {
    this._selectedTabCode = code;
  }

  /**
   * Gets the currently selected tab code.
   * @returns The selected tab code, or undefined if not set.
   */
  public getSelectedTab(): number | undefined {
    return this._selectedTabCode;
  }

  /**
   * Retrieves a specific communication by its ID for a specific culture code.
   *
   * @param communicationGuid - The ID of the communication to be retrieved.
   * @param cultureCode - The culture code of the communication to be retrieved.
   * @returns - An observable that emits a `Communication` object.
   *
   * @example
   * // Get a specific communication for a culture code
   * getCommunication$('comm123', 'en-US').subscribe(communication => {
   *   console.log('Communication:', communication);
   * });
   */
  public getCommunication$(communicationGuid: string, cultureCode: string): Observable<Communication | null> {
    return this._communicationsApiService.getUserCommunication$(communicationGuid, cultureCode).pipe(
      map((communicationDto: StandardResponse<Communication>): Communication => new Communication(communicationDto.data)),
      catchError((error) => {
        this._loggerService.logError('Failed to retrieve communication', { communicationGuid, cultureCode, error });

        return of(null);
      })
    );
  }

  /**
   * Retrieves the attachments associated with a specific communication.
   *
   * @param communicationGuid - The unique identifier of the communication whose attachments are to be retrieved.
   * @returns - An observable that emits an `AttachmentFile` object if the operation succeeds, or `null` if it fails.
   *
   * @example
   * // Retrieve attachments for a communication
   * getAttachments$('comm123').subscribe(attachment => {
   *   if (attachment) {
   *     console.log('Attachment retrieved:', attachment);
   *   } else {
   *     console.log('Failed to retrieve attachment');
   *   }
   * });
   */
  public getAttachments$(communicationGuid: string): Observable<CommunicationReadableAttachments | null> {
    return this._communicationsApiService.getUserCommunicationAttachments$(communicationGuid).pipe(
      map((attachmentFileDto: StandardResponse<CommunicationReadableAttachments>): CommunicationReadableAttachments => new CommunicationReadableAttachments(attachmentFileDto.data)),
      catchError((error) => {
        this._loggerService.logError('Failed to retrieve attachments', { communicationGuid, error });

        return of(null);
      })
    );
  }

  /**
   * Sets the archived status of a list of communicationsgetAttachments$
   *
   * @param communicationGuids - The list of IDs of the communications to be archived or unarchived.
   * @param isArchived - A flag indicating whether to archive (true) or unarchive (false) the communication.
   * @returns - An observable that emits `true` if the operation succeeds, or `false` if it fails.
   *
   * @example
   * // Archive communications
   * setCommunicationsArchived$(['comm123', 'comm456'], true).subscribe(success => {
   *   if (success) {
   *     console.log('Communications archived successfully');
   *   } else {
   *     console.log('Failed to archive communications');
   *   }
   * });
   *
   * @example
   * // Unarchive communications
   * setCommunicationsArchived$(['comm123', 'comm456'], false).subscribe(success => {
   *   if (success) {
   *     console.log('Communications unarchived successfully');
   *   } else {
   *     console.log('Failed to unarchive communications');
   *   }
   * });
   */
  public setCommunicationsArchived$(communicationGuids: string[], isArchived: boolean): Observable<boolean> {
    return this._communicationsApiService
      .updateArchive$(new UserCommunicationUpdate({ communicationGuid: communicationGuids, value: isArchived }))
      .pipe(
        tap(({ success, error }: StandardResponse<null>) => {
        if (!success) {
          this._loggerService.logError('Failed to Update Archived Communications', {
            communicationGuids,
            error,
          });
        }
      }),
        map(({ success }: StandardResponse<null>) => {
          return success;
        })
      );
  }

  /**
   * Sets the archived status of a communication.
   *
   * @param communicationGuid - The ID of the communication to be archived or unarchived.
   * @param isArchived - A flag indicating whether to archive (true) or unarchive (false) the communication.
   * @returns - An observable that emits `true` if the operation succeeds, or `false` if it fails.
   *
   * @example
   * // Archive a communication
   * setCommunicationArchived$('comm123', true).subscribe(success => {
   *   if (success) {
   *     console.log('Communication archived successfully');
   *   } else {
   *     console.log('Failed to archive communication');
   *   }
   * });
   *
   * @example
   * // Unarchive a communication
   * setCommunicationArchived$('comm123', false).subscribe(success => {
   *   if (success) {
   *     console.log('Communication unarchived successfully');
   *   } else {
   *     console.log('Failed to unarchive communication');
   *   }
   * });
   */
  public setCommunicationArchived$(communicationGuid: string, isArchived: boolean): Observable<boolean> {
    return this.setCommunicationsArchived$([communicationGuid], isArchived);
  }

  /**
   * Sets the favorited status of a list of communications.
   *
   * @param communicationGuids - The list of IDs of the communications to be favorited or unfavorited.
   * @param isFavorited - A flag indicating whether to favorite (true) or unfavorite (false) the communication.
   * @returns - An observable that emits `true` if the operation succeeds, or `false` if it fails.
   *
   * @example
   * // Favorite communications
   * setCommunicationsFavorited$(['comm123', 'comm456'], true).subscribe(success => {
   *   if (success) {
   *     console.log('Communications favorited successfully');
   *   } else {
   *     console.log('Failed to favorite communications');
   *   }
   * });
   *
   * @example
   * // Unfavorite communications
   * setCommunicationsFavorited$(['comm123', 'comm456'], false).subscribe(success => {
   *   if (success) {
   *     console.log('Communications unfavorited successfully');
   *   } else {
   *     console.log('Failed to unfavorite communications');
   *   }
   * });
   */
  public setCommunicationsFavorited$(communicationGuids: string[], isFavorited: boolean): Observable<boolean> {
    return this._communicationsApiService
      .updateFavorite$(new UserCommunicationUpdate({ communicationGuid: communicationGuids, value: isFavorited }))
      .pipe(
        tap(({ success, error }: StandardResponse<null>) => {
          if (!success) {
            this._loggerService.logError('Failed to Update Favorite Communications', {
              communicationGuids,
              error,
            });
          }
        }),
        map(({ success }: StandardResponse<null>) => {
          return success;
        })
      );
  }

  /**
   * Sets the favorited status of a communication.
   *
   * @param communicationGuid - The ID of the communication to be favorited or unfavorited.
   * @param isFavorited - A flag indicating whether to favorite (true) or unfavorite (false) the communication.
   * @returns - An observable that emits `true` if the operation succeeds, or `false` if it fails.
   *
   * @example
   * // Favorite a communication
   * setCommunicationFavorited$('comm123', true).subscribe(success => {
   *   if (success) {
   *     console.log('Communication favorited successfully');
   *   } else {
   *     console.log('Failed to favorite communication');
   *   }
   * });
   *
   * @example
   * // Unfavorite a communication
   * setCommunicationFavorited$('comm123', false).subscribe(success => {
   *   if (success) {
   *     console.log('Communication unfavorited successfully');
   *   } else {
   *     console.log('Failed to unfavorite communication');
   *   }
   * });
   */
  public setCommunicationFavorited$(communicationGuid: string, isFavorited: boolean): Observable<boolean> {
    return this.setCommunicationsFavorited$([communicationGuid], isFavorited);
  }

  /**
   * Sets the read status of a list of communications.
   *
   * @param communicationGuids - The list of IDs of the communications to be read or unread.
   * @param isRead - A flag indicating whether to read (true) or unread (false) the communication.
   * @returns - An observable that emits `true` if the operation succeeds, or `false` if it fails.
   *
   * @example
   * // Read communications
   * setCommunicationsRead$(['comm123', 'comm456'], true).subscribe(success => {
   *   if (success) {
   *     console.log('Communications read successfully');
   *   } else {
   *     console.log('Failed to read communications');
   *   }
   * });
   *
   * @example
   * // Unread communications
   * setCommunicationsRead$(['comm123', 'comm456'], false).subscribe(success => {
   *   if (success) {
   *     console.log('Communications unread successfully');
   *   } else {
   *     console.log('Failed to unread communications');
   *   }
   * });
   */
  public setCommunicationsRead$(communicationGuids: string[], isRead: boolean): Observable<boolean> {
    return this._communicationsApiService
      .updateRead$(new UserCommunicationUpdate({ communicationGuid: communicationGuids, value: isRead }))
      .pipe(
        tap(({ success, error }: StandardResponse<null>) => {
          if (!success) {
            this._loggerService.logError('Failed to Update Read Communications', {
              communicationGuids,
              error,
            });
          }
        }),
        map(({ success }: StandardResponse<null>) => {
          return success;
        })
      );
  }

  /**
   * Sets the read status of a communication.
   *
   * @param communicationGuid - The ID of the communication to be read or unread.
   * @param isRead - A flag indicating whether to read (true) or unread (false) the communication.
   * @returns - An observable that emits `true` if the operation succeeds, or `false` if it fails.
   *
   * @example
   * // Read a communication
   * setCommunicationRead$('comm123', true).subscribe(success => {
   *   if (success) {
   *     console.log('Communication read successfully');
   *   } else {
   *     console.log('Failed to read communication');
   *   }
   * });
   *
   * @example
   * // Unread a communication
   * setCommunicationRead$('comm123', false).subscribe(success => {
   *   if (success) {
   *     console.log('Communication unread successfully');
   *   } else {
   *     console.log('Failed to unread communication');
   *   }
   * });
   */
  public setCommunicationRead$(communicationGuid: string, isRead: boolean): Observable<boolean> {
    return this.setCommunicationsRead$([communicationGuid], isRead);
  }

  public getCommunications$(
    options: CommunicationListingOptions,
    pageNumber: number,
    pageSize: number,
  ): Observable<PaginationResponse<Communication>> {

    return this._communicationsApiService
      .getUserCommunications$(options, pageNumber, pageSize)
      .pipe(
        map((paginationResponse: PaginationResponse<Communication>): PaginationResponse<Communication> => {
          return paginationResponse.mapData((communicationEntity: Communication): Communication => {
            return new Communication(communicationEntity)
          });
        })
      );
  }

    /**
     * Retrieves a paginated list of communications based on the provided search options.
     *
     * @param options - The search criteria for filtering communications.
     * @param pageNumber - The current page number for pagination.
     * @param pageSize - The number of items to include per page.
     * @returns An Observable that emits a paginated response containing Communication instances.
     *
     * This method calls the communications API service to fetch user communications matching the given options,
     * applies pagination, and maps each communication entity in the response to a new Communication instance.
     */
    public getCommunicationsSearch$(
    options: CommunicationListingOptions,
    pageNumber: number,
    pageSize: number,
  ): Observable<PaginationResponse<Communication>> {
    return this._communicationsApiService
      .getUserCommunicationsSearch$(options, pageNumber, pageSize)
      .pipe(
        map((paginationResponse: PaginationResponse<Communication>): PaginationResponse<Communication> => {
          return paginationResponse.mapData((communicationEntity: Communication): Communication => {
            return new Communication(communicationEntity)
          });
        })
      );
  }

  public getCommunicationByGroup$(
    communicationTypes: CommunicationType[] = [],
    getAttachments: boolean = false,
    pageNumber: number = 1,
    pageSize: number = 5
  ): Observable<Communication[]> {
    return this._lookUpService.getGroups$().pipe(
      switchMap((groups: CommunicationGroup[]): Observable<PaginationResponse<Communication>> => {
        const filters: CommunicationListingOptions = new CommunicationListingOptions({
          cultureCode: this._resourceService.getCultureCode(),
          isArchive: false,
          sortByStartDateDescending: true,
          groupIds: groups
            .filter((group: CommunicationGroup): boolean => communicationTypes.includes(group.name as CommunicationType))
            .map((group: CommunicationGroup): number => group.groupId as number),
        });

        return this.getCommunications$(filters, pageNumber, pageSize);
      }),
      switchMap((communicationsPage: PaginationResponse<Communication>): Observable<Communication[]> => {
        const communications: Communication[] = communicationsPage.data ?? [];

        if (!getAttachments || communications.length === 0) {
          return of(communications);
        }

        return forkJoin(
          communications.map((communication: Communication): Observable<Communication> =>
            this.getAttachments$(communication.communicationGuid as string).pipe(
              map((attachments: CommunicationReadableAttachments | null) => {
                  if (attachments?.messages) {
                    // Map the readable attachments to the CommunicationAttachment
                    communication.messages = communication.messages?.map((message) => {
                      // Find the corresponding readable message
                      const foundReadableMessage = attachments.messages.find(
                        (readableMessage) => readableMessage.messageId === message.messageId,
                      );

                      if (foundReadableMessage) {
                        // Update the message's attachments with the readable URLs
                        message.attachments = message.attachments?.map((attachment) => {
                          const foundReadableAttachment = foundReadableMessage.fileAttachments?.find(
                            (readableAttachment) => readableAttachment.attachmentId === attachment.attachmentId,
                          );

                          return new CommunicationAttachment({
                            ...attachment,
                            location: foundReadableAttachment?.url,
                          });
                        });
                      }

                      return message;
                    });
                  }

                  return communication;
                }),
            )
          )
        );
      }),
      untilDestroyed(this),
    );
  }

  /**
   * Determines if a communication is new based on its start date.
   * A communication is considered new if its start date is within the last 7 days.
   *
   * @param startDate - The start date of the communication as a string.
   *                       If undefined or invalid, the function returns false.
   * @returns `true` if the communication is new, otherwise `false`.
   */
  public isNewCommunication(startDate: string | undefined): boolean {
    if (!startDate) {
      return false;
    }

    const now: Date = new Date();
    const newStartDate: Date = new Date(startDate);

    if (isNaN(newStartDate.getTime())) {
      return false; // Invalid date
    }

    newStartDate.setDate(newStartDate.getDate() + 7);

    return newStartDate >= now;
  }

}
