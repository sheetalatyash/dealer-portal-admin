export class DealerSupportCase {
  public contactName: string = '';
  public contactPhone: string = '';
  public question: string = '';

  constructor(widget: Partial<DealerSupportCase> = {}) {
    Object.assign(this, widget);
  }
}
