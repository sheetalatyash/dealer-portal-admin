import { Communication } from '@dealer-portal/polaris-core';

export class CommunicationListingVm {
  public communicationGuid: string = '';
  public title: string = '';
  public status: string = '';
  public startDate?: string = '';
  public endDate?: string = '';
  public group: string = '';
  public subGroup: string = '';
  public createdDate?: string = '';
  public createdBy: string;
  public cultureCodes: string[] = [];

  constructor(private _communication: Partial<Communication> = {}) {
    Object.assign(this, _communication);
    this.createdBy = `${_communication.createdByFirstName ?? ''} ${_communication.createdByLastName ?? ''}`;
    this.cultureCodes =
      _communication.cultureCodes?.map((cultureCode: string): string => {
        return cultureCode.toUpperCase();
      }) ?? [];
  }
}
