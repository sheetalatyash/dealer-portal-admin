import { LanguageEntity } from '../../../_apis/core/core.service.api.types';

export class Language {
  public cultureCode: string = '';
  public name: string = '';

  constructor(private _entity: Partial<LanguageEntity> = {}) {
    Object.assign(this, _entity);
  }
}
