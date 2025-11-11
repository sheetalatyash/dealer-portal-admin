export class Status {
  public id?: string;
  public name?: string;

  constructor(private _entity: Partial<Status> = {}) {
    Object.assign(this, _entity);
  }
}
