export class CommunicationCategory {
  public name: string = '';
  public id: string = '';
  public notification: boolean = true;
  public checked: boolean = true;

  constructor(category: Partial<CommunicationCategory> = {}) {
    Object.assign(this, category);
  }
}
