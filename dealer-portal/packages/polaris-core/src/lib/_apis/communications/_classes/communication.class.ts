import { CommunicationType } from '../_enums';
import { CommunicationAccount } from './communication-account.class';
import { CommunicationApplication } from './communication-application.class';
import { CommunicationAttachment } from './communication-attachment.class';
import { CommunicationCode } from './communication-code.class';
import { CommunicationGroup } from './communication-group.class';
import { CommunicationMessage } from './communication-message.class';
import { CommunicationProductLine } from './communication-product-line.class';

export class Communication {
  // ID Fields
  public communicationGuid?: string;
  public statusId?: number;
  public messageId?: number;

  // Metadata Fields
  public isFavorite?: boolean;
  public isRead?: boolean;
  public isArchive?: boolean;
  public status?: string;

  // Date Fields
  public createdDate?: string;
  public startDate?: string;
  public endDate?: string;

  // Created By Fields
  public createdBy?: string;
  public createdByFirstName?: string;
  public createdByLastName?: string;

  // Group Fields
  public groupId?: number;
  public subGroupId?: number;
  public group?: CommunicationGroup;
  public subGroup?: CommunicationGroup;
  public groupName?: CommunicationType;

  // Message / Attachment Fields
  public defaultMessage?: CommunicationMessage;
  public messages?: CommunicationMessage[];
  public title?: string;
  public message?: string;
  public attachments?: CommunicationAttachment[];
  public videoLinks?: string[];

  // Account Target Fields
  public partnerTypes?: CommunicationCode[];
  public custClasses?: CommunicationCode[];
  public productLines?: CommunicationProductLine[];
  public territories?: CommunicationCode[];
  public countries?: CommunicationCode[];
  public stateOrProvinces?: CommunicationCode[];
  public accounts?: CommunicationAccount[];
  public parentAccounts?: CommunicationAccount[];
  public cultureCodes?: string[];

  // User Target Fields
  public departments?: CommunicationCode[];
  public roles?: CommunicationCode[];
  public serviceStaffRoles?: CommunicationCode[];
  public applications?: CommunicationApplication[];
  public userAccounts?: CommunicationAccount[];

  constructor(private _communication: Partial<Communication> = {}) {
    Object.assign(this, _communication);
  }

  /**
   * Converts the current communication instance into a new instance
   * containing only the fields necessary for saving translation entities.
   *
   * @returns A new `Communication` instance with selected fields:
   * `communicationGuid`, `defaultMessage`, and `messages`.
   */
  public toSaveTranslationsEntity(): Communication {
    return new Communication({
      communicationGuid: this.communicationGuid,
      defaultMessage: this.defaultMessage,
      messages: this.messages,
    });
  }
}
