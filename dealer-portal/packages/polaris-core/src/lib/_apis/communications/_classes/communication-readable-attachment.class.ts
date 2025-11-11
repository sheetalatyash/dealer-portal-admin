export class CommunicationReadableAttachment {
  public attachmentId?: number;
  public url?: string;

  constructor(private _attachment: Partial<CommunicationReadableAttachment> = {}) {
    Object.assign(this, _attachment);
  }
}
