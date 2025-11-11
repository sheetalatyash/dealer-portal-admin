import { StaffRoleEntity } from '../../../_apis/core/core.service.api.types';

export class StaffRole {
  public id: string = '';
  public name: string = '';

  constructor(private _entity: Partial<StaffRoleEntity> = {}) {
    Object.assign(this, _entity);
  }
}
