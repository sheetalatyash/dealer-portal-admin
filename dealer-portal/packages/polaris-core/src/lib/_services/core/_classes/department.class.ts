import { DepartmentEntity } from '../../../_apis/core/core.service.api.types';

export class Department {
  public id: string = '';
  public name: string = '';

  constructor(private _entity: Partial<DepartmentEntity> = {}) {
    Object.assign(this, _entity);
  }
}
