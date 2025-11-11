export class CommunicationApplication {
  public applicationId: number = 0;
  public pageId: number = 0;
  public applicationName: string = '';
  public applicationCategory: string = '';

  constructor(private _application: Partial<CommunicationApplication> = {}) {
    Object.assign(this, _application);
  }
}
