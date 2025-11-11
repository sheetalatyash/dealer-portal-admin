import {
  CommunicationAttachment,
  CommunicationMessage,
  Language,
} from '@dealer-portal/polaris-core';

export class CommunicationTranslation {
  public cultureCode: string = '';
  public language: string = '';
  public title: string = '';
  public messageBody: string = '';
  public statusId?: number;
  public attachments: CommunicationAttachment[] = [];

  constructor(private _translation: Partial<CommunicationMessage> = {}, private _language?: Language) {
    Object.assign(this, _translation);
    this.language = _language?.name ?? '';
  }
}
