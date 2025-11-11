export class CommunicationCode {
  code: string = '';

  constructor(private _code: Partial<CommunicationCode> = {}) {
    Object.assign(this, _code);
  }
}
