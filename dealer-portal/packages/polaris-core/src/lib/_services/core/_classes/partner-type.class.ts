import { PartnerTypeEntity } from '../../../_apis/core/core.service.api.types';

export class PartnerType {
  public id: string = '';
  public name: string = '';

  constructor(private _entity: Partial<PartnerTypeEntity> = {}) {
    Object.assign(this, _entity);
  }
}
