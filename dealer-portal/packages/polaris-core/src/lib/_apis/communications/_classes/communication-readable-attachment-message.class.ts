import { CommunicationReadableAttachment } from './communication-readable-attachment.class';

export class CommunicationReadableAttachmentMessage {
  public messageId?: number;
  public fileAttachments?: CommunicationReadableAttachment[];

  constructor(private message: Partial<CommunicationReadableAttachmentMessage> = {}) {
    Object.assign(this, message);
  }
}
