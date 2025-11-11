import { PolarisSearchBarResult } from './polaris-search-bar-result.class';

export class PolarisSearchBarCategoryResult<T> {
    public category = '';
    public options: PolarisSearchBarResult<T>[] = [];

  constructor(polarisSearchBarCategoryResult: Partial<PolarisSearchBarCategoryResult<T>> = {}) {
    Object.assign(this as PolarisSearchBarCategoryResult<T>, polarisSearchBarCategoryResult);
  }
}
