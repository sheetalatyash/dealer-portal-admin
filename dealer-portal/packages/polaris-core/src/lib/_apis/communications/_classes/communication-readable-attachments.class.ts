import { CommunicationReadableAttachmentMessage } from './communication-readable-attachment-message.class';

export class CommunicationReadableAttachments {
  public communicationGuid: string = '';
  public messages: CommunicationReadableAttachmentMessage[] = [];

  constructor(private _attachments: Partial<CommunicationReadableAttachments> = {}) {
    Object.assign(this, _attachments);
  }
}
