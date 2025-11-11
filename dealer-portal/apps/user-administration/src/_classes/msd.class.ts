export class Msd {
  MsdStatus: string = '';
  MsdProductLine: string = '';
  ServiceOperationsCompletion: string = '';
  SetupCompletion: string = '';
  BronzeCompletion: string = '';
  SilverCompletion: string = '';
  GoldCompletion: string = '';

  constructor(data: Partial<Msd> = {}) {
    Object.assign(this, data);
  }
}
