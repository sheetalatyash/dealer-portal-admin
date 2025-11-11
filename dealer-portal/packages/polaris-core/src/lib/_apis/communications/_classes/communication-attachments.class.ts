import { CommunicationMessage } from './communication-message.class';

export class CommunicationAttachments {
  public communicationGuid: string = '';
  public messages: CommunicationMessage[] = [];

  constructor(private _attachments: Partial<CommunicationAttachments> = {}) {
    Object.assign(this, _attachments);
  }
}
