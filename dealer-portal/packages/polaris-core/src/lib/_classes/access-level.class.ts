
export class AccessLevel {
  public none: boolean = true;
  public readOnly: boolean = false;
  public readWrite: boolean = false;

  constructor(accessLevel: Partial<AccessLevel> = {}) {
    Object.assign(this, accessLevel);
  }
}
