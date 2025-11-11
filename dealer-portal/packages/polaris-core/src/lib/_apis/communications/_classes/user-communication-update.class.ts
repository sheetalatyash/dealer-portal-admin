export class UserCommunicationUpdate {
  public communicationGuid: string[] = [];
  public value: boolean = false;

  constructor(private _userCommunicationUpdate: Partial<UserCommunicationUpdate> = {}) {
    Object.assign(this, _userCommunicationUpdate);
  }
}
