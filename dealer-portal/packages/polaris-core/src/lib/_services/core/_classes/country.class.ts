import { CountryEntity } from '../../../_apis/core/core.service.api.types';

export class Country {
  public code: string = '';
  public name: string = '';

  constructor(private _entity: Partial<CountryEntity> = {}) {
    Object.assign(this, _entity);
  }
}
