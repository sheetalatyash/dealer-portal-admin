export class Dealer {
  public custClass: string = '';
  public dealerId: string = '';
  public dealerName: string = '';
  public employeeId: string = '';
  public partnerType: string = '';
  public systemId: string = '';


  constructor(private _data: Partial<Dealer> = {}) {
    Object.assign(this, _data);
  }
}
