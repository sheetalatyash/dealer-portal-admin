export class CommunicationAccountSummary {
  totalCount?: number;
  countryCodes?: string[];
  customerClasses?: string[];

  constructor(private _communication: Partial<CommunicationAccountSummary> = {}) {
    Object.assign(this, _communication);
  }
}
