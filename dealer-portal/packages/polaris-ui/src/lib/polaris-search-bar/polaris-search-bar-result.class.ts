export class PolarisSearchBarResult<T> {
  public id = '';
  public label = '';
  public value: T | string = '';
  public testId = 'polaris-search-bar-result-default-data-test-id';
  public selected = false;

  constructor(polarisSearchBarResult: Partial<PolarisSearchBarResult<T>> = {}) {
    Object.assign(this as PolarisSearchBarResult<T>, polarisSearchBarResult);
  }
}
