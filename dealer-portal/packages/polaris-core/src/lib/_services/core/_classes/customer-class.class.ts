import { CustomerClassEntity } from '../../../_apis/core/core.service.api.types';

export class CustomerClass {
  public id: string = '';
  public name: string = '';

  constructor(private _entity: Partial<CustomerClassEntity> = {}) {
    Object.assign(this, _entity);
  }
}
