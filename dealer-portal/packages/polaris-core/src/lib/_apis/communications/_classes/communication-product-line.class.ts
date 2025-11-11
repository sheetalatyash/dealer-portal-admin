import { CommunicationCode } from './communication-code.class';

export class CommunicationProductLine extends CommunicationCode{
  productLineId?: number;

  constructor(data: Partial<CommunicationProductLine> = {}) {
    super(data);

    Object.assign(this, data);
  }
}
