export class CommunicationStatus {
  public statusId: number = 0;
  public name?: string;

  constructor(private _status: Partial<CommunicationStatus> = {}) {
    Object.assign(this, _status);
  }
}
