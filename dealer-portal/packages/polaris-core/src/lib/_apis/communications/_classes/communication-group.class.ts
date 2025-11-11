import { CommunicationType } from '../_enums';

export class CommunicationGroup {
  public groupId?: number;
  public subGroupId?: number;
  public name?: string | CommunicationType;


  constructor(private _group: Partial<CommunicationGroup> = {}) {
    Object.assign(this, _group);
  }
}
