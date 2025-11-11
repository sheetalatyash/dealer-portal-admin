import { CommunicationAttachment } from './communication-attachment.class';

export class CommunicationMessage {
  public messageId?: number;
  public communicationGuid?: string;
  public cultureCode?: string;
  public title?: string;
  public messageBody?: string;
  public keywords?: string;
  public internalNotes?: string;
  public statusId?: number;
  public approvalDate?: string;
  public approvedBy?: string;
  public attachments?: CommunicationAttachment[];

  constructor(private _message: Partial<CommunicationMessage> = {}) {
    Object.assign(this, _message);
  }
}
