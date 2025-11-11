import { ServiceStaffRoleEntity } from '../../../_apis/core/core.service.api.types';

export class ServiceStaffRole {
  public id: string = '';
  public name: string = '';

  constructor(private _entity: Partial<ServiceStaffRoleEntity> = {}) {
    Object.assign(this, _entity);
  }
}
