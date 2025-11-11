
export class AdditionalClaim {
  public isSelected: boolean = false;
  public name: string = '';
  public value: string = '';

  /**
   * Constructs a new instance of the AdditionalClaim class.
   *
   * @param data - An optional object containing initial values for the entity properties.
   *               If not provided, default values will be used.
   */
  constructor(data: Partial<AdditionalClaim> = {}) {
    Object.assign(this, data);
  }
}
