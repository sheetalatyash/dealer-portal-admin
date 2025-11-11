export class ProductLine {
  [key: string]: string | undefined;

  public accountProductGUID: string = '';
  public productDescription: string = '';
  public productLineName: string = '';
  public name?: string;

  constructor(data: Partial<ProductLine> = {}) {
    Object.assign(this, data);
  }
}
