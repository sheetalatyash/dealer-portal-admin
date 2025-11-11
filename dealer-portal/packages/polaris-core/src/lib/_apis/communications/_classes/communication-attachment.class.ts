export class CommunicationAttachment {
  public name?: string;
  public description?: string;
  public location?: string;
  public attachmentId?: number;
  public attachmentTypeId?: number;

  constructor(private _attachment: Partial<CommunicationAttachment> = {}) {
    Object.assign(this, _attachment);
  }
}
