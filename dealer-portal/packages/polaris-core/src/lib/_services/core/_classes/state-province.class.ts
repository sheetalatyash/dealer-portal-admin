import { StateProvinceEntity } from '../../../_apis/core/core.service.api.types';

export class StateProvince {
  public code?: string;
  public countryCode?: string;
  public name?: string;

  constructor(private _entity: Partial<StateProvinceEntity> = {}) {
    Object.assign(this, _entity);
  }
}
