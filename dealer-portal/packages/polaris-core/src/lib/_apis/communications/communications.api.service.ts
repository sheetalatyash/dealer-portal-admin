import { Inject, Injectable } from '@angular/core';
import {
  BaseApiService,
  Communication,
  CommunicationAccountSummary,
  CommunicationGroup,
  CommunicationListingOptions,
  CommunicationStatus,
  PaginationResponse,
  StandardResponse,
  UserCommunicationUpdate,
  CommunicationReadableAttachments,
  COMMUNICATIONS_API,
} from '..';
import { HttpClient } from '@angular/common/http';
import { EndpointConfig, Environment, ENVIRONMENT_CONFIG } from '../../_types';
import { Observable } from 'rxjs';
import { LoggerService } from '../../_services';

@Injectable({
  providedIn: 'root',
})
export class CommunicationsApiService extends BaseApiService {
  private readonly _adminCommunicationApiUrl: string = '';
  private readonly _lookupApiUrl: string = '';
  private readonly _userCommunicationsApiUrl: string = '';
  private readonly _userCommunicationsSearchApiUrl: string = '';

  static override readonly API_NAME: string = COMMUNICATIONS_API;

  constructor(
    @Inject(ENVIRONMENT_CONFIG) environment: Environment,
    httpClient: HttpClient,
    loggerService: LoggerService,
  ) {
    const endpointConfig: EndpointConfig = environment.endpoints[CommunicationsApiService.API_NAME];
    super(endpointConfig, httpClient, loggerService);
    const baseUrl = endpointConfig.baseUrl;
    this._adminCommunicationApiUrl = `${baseUrl}/v1/admin/communications`;
    this._lookupApiUrl = `${baseUrl}/v1/lookup`;
    this._userCommunicationsApiUrl = `${baseUrl}/v1/user/communications`;
    this._userCommunicationsSearchApiUrl = `${baseUrl}/v1/user/communications/search`;
  }

  // Admin Communications API

  /**
   * Retrieves a paginated list of admin communications.
   * @param options The listing options for filtering communications.
   * @param pageNumber The page number to retrieve.
   * @param pageSize The number of items per page.
   * @returns An Observable of PaginationResponse containing an array of CommunicationListing
   */
  public getAdminCommunications$(
    options: CommunicationListingOptions,
    pageNumber: number,
    pageSize: number,
  ): Observable<PaginationResponse<Communication>> {
    return this.getPaginated<Communication>(this._adminCommunicationApiUrl, pageNumber, pageSize, { params: options });
  }

  /**
   * Retrieves the details of a specific admin communication.
   * @param communicationGuid The ID of the communication to retrieve.
   * @returns An Observable of StandardResponse containing the AdminCommunicationEntity.
   */
  public getAdminCommunication$(communicationGuid: string): Observable<StandardResponse<Communication>> {
    return this.get<Communication>(`${this._adminCommunicationApiUrl}/${communicationGuid}`);
  }

  /**
   * Retrieves the communication account summary for a specific communication.
   * @param communicationGuid The unique identifier of the communication.
   * @returns An Observable of StandardResponse containing the CommunicationSummaryResponse.
   */
  public getCommunicationAccountSummary$(
    communicationGuid: string,
  ): Observable<StandardResponse<CommunicationAccountSummary>> {
    return this.get<CommunicationAccountSummary>(
      `${this._adminCommunicationApiUrl}/accountSummary/${communicationGuid}`,
    );
  }

  /**
   * Creates a new admin communication.
   * @param communicationDetails The details of the communication to create.
   * @returns An Observable of StandardResponse containing the created AdminCommunicationEntity.
   */
  public createCommunication$(communicationDetails: Communication): Observable<StandardResponse<Communication>> {
    return this.post<Communication>(`${this._adminCommunicationApiUrl}`, {
      ...communicationDetails,
    });
  }

  /**
   * Updates an existing admin communication.
   * @param communicationDetails The details of the communication to update.
   * @returns An Observable of StandardResponse containing the updated AdminCommunicationEntity.
   */
  public updateCommunication$(communicationDetails: Communication): Observable<StandardResponse<Communication>> {
    return this.put<Communication>(`${this._adminCommunicationApiUrl}/${communicationDetails.communicationGuid}`, {
      ...communicationDetails,
    });
  }

  /**
   * Updates the account targets of an admin communication.
   * @param accountTargets The account targets to update.
   * @returns An Observable of StandardResponse containing the updated AdminCommunicationEntity.
   */
  public updateAccountTargets$(accountTargets: Communication): Observable<StandardResponse<Communication>> {
    return this.put<Communication>(
      `${this._adminCommunicationApiUrl}/${accountTargets.communicationGuid}/account-target`,
      {
        ...accountTargets,
      },
    );
  }

  /**
   * Updates the user targets of an admin communication.
   * @param userTargets The user targets to update.
   * @returns An Observable of StandardResponse containing the updated AdminCommunicationEntity.
   */
  public updateUserTargets$(userTargets: Communication): Observable<StandardResponse<Communication>> {
    return this.put<Communication>(`${this._adminCommunicationApiUrl}/${userTargets.communicationGuid}/user-target`, {
      ...userTargets,
    });
  }

  /**
   * Updates translations of an admin communication.
   * @param translations The translations to update.
   * @returns An Observable of StandardResponse containing the updated AdminCommunicationEntity.
   */
  public updateTranslations$(translations: Communication): Observable<StandardResponse<Communication>> {
    return this.put<Communication>(`${this._adminCommunicationApiUrl}/${translations.communicationGuid}/translation`, {
      ...translations,
    });
  }

  /**
   * Updates the status of an admin communication.
   * @param communicationGuid The ID of the communication to update.
   * @returns An Observable of StandardResponse containing the updated AdminCommunicationEntity.
   */
  public updateStatus$(communicationGuid: string, statusId: number): Observable<StandardResponse<Communication>> {
    return this.put<Communication>(`${this._adminCommunicationApiUrl}/${communicationGuid}/status/${statusId}`, null);
  }

  /**
   * Uploads an attachment for a specific communication.
   * @param communicationGuid The unique identifier of the communication.
   * @param messageId The unique identifier of the message within the communication.
   * @param file The file to be uploaded.
   * @returns An Observable of StandardResponse containing the updated Communication.
   */
  public uploadAttachment$(
    communicationGuid: string,
    messageId: number,
    file: File,
  ): Observable<StandardResponse<Communication>> {
    const formData = new FormData();

    formData.append('file', file);

    return this.post<Communication>(
      `${this._adminCommunicationApiUrl}/${communicationGuid}/message/${messageId}/attachment`,
      formData,
      {
        headers: {
          'X-Skip-Content-Type': 'true',
        },
      },
    );
  }

  /**
   * Deletes an attachment for a specific communication.
   * @param communicationGuid The unique identifier of the communication.
   * @param messageId The unique identifier of the message within the communication.
   * @param attachmentId The unique identifier of the attachment.
   * @returns An Observable of StandardResponse containing the updated Communication.
   */
  public deleteAttachment$(
    communicationGuid: string,
    messageId: number,
    attachmentId: number,
  ): Observable<StandardResponse<Communication>> {
    return this.delete<Communication>(
      `${this._adminCommunicationApiUrl}/${communicationGuid}/message/${messageId}/attachment/${attachmentId}`,
    );
  }

  public getAttachments$(communicationGuid: string): Observable<StandardResponse<CommunicationReadableAttachments>> {
    return this.get<CommunicationReadableAttachments>(
      `${this._adminCommunicationApiUrl}/${communicationGuid}/attachment`,
    );
  }

  // Lookup API

  /**
   * Retrieves all communication statuses.
   * @returns An Observable of StandardResponse containing an array of CommunicationStatus.
   */
  public getAllStatuses$(): Observable<StandardResponse<CommunicationStatus[]>> {
    return this.get<CommunicationStatus[]>(`${this._lookupApiUrl}/statuses`);
  }

  /**
   * Retrieves all communication groups.
   * @returns An Observable of StandardResponse containing an array of CommunicationGroupEntity.
   */
  public getAllGroups$(): Observable<StandardResponse<CommunicationGroup[]>> {
    return this.get<CommunicationGroup[]>(`${this._lookupApiUrl}/groups`);
  }

  /**
   * Retrieves all communication sub-groups for a given group ID.
   * @param groupId The ID of the group to retrieve sub-groups for.
   * @returns An Observable of StandardResponse containing an array of CommunicationSubGroup.
   */
  public getAllSubGroups$(groupId: number): Observable<StandardResponse<CommunicationGroup[]>> {
    return this.get<CommunicationGroup[]>(`${this._lookupApiUrl}/groups/${groupId}/subgroups`);
  }

  // User Communications API
  /**
   * Retrieves a paginated list of dealer communications.
   * @param options The listing options for filtering communications.
   * @param pageNumber The page number to retrieve.
   * @param pageSize The number of items per page.
   * @returns An Observable of PaginationResponse containing an array of CommunicationListing
   */
  public getUserCommunications$(
    options: CommunicationListingOptions,
    pageNumber: number,
    pageSize: number,
  ): Observable<PaginationResponse<Communication>> {
    return this.getPaginated<Communication>(this._userCommunicationsApiUrl, pageNumber, pageSize, { params: options });
  }

  public getUserCommunicationsSearch$(
    options: CommunicationListingOptions,
    pageNumber: number,
    pageSize: number,
  ): Observable<PaginationResponse<Communication>> {
    return this.getPaginated<Communication>(this._userCommunicationsSearchApiUrl, pageNumber, pageSize, {
      params: options,
    });
  }

  /**
   * Retrieves a specific user communication.
   * @param communicationGuid The ID of the communication to retrieve.
   * @param cultureCode The culture code for localization.
   * @returns An Observable of StandardResponse containing the UserCommunicationEntity.
   */
  public getUserCommunication$(
    communicationGuid: string,
    cultureCode: string,
  ): Observable<StandardResponse<Communication>> {
    return this.get<Communication>(`${this._userCommunicationsApiUrl}/${communicationGuid}`, {
      params: { cultureCode },
    });
  }

  /**
   * Retrieves the attachments for a specific user communication.
   * @param communicationGuid The ID of the communication to retrieve attachments for.
   * @returns An Observable of StandardResponse containing an array of AttachmentFileEntity.
   */
  public getUserCommunicationAttachments$(
    communicationGuid: string,
  ): Observable<StandardResponse<CommunicationReadableAttachments>> {
    return this.get<CommunicationReadableAttachments>(
      `${this._userCommunicationsApiUrl}/${communicationGuid}/attachment`,
    );
  }

  /**
   * Updates the archive status of a user communication.
   * @param update The update entity containing the communication ID and new archive status.
   * @returns An Observable of StandardResponse containing null.
   */
  public updateArchive$(update: UserCommunicationUpdate): Observable<StandardResponse<null>> {
    return this.put<null>(`${this._userCommunicationsApiUrl}/archive`, update);
  }

  /**
   * Updates the favorite status of a user communication.
   * @param update The update entity containing the communication ID and new favorite status.
   * @returns An Observable of StandardResponse containing null.
   */
  public updateFavorite$(update: UserCommunicationUpdate): Observable<StandardResponse<null>> {
    return this.put<null>(`${this._userCommunicationsApiUrl}/favorite`, update);
  }

  /**
   * Updates the read status of a user communication.
   * @param update The update entity containing the communication ID and new read status.
   * @returns An Observable of StandardResponse containing null.
   */
  public updateRead$(update: UserCommunicationUpdate): Observable<StandardResponse<null>> {
    return this.put<null>(`${this._userCommunicationsApiUrl}/read`, update);
  }
}
