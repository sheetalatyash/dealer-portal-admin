export class CommunicationAttachmentDetails {
  public attachmentId: number = 0;
  public url: string = '';

  constructor(private _attachmentDetails: Partial<CommunicationAttachmentDetails> = {}) {
    Object.assign(this, _attachmentDetails);
  }

}
