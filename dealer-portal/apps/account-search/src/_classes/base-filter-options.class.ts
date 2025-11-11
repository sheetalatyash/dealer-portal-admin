import { PolarisGroupOption, PolarisSearchBarCategoryResult, PolarisSearchBarResult } from '@dealer-portal/polaris-ui';

export abstract class BaseFilterOptions<T> {
  public options?: PolarisGroupOption<T>[] = [];

  protected constructor(filters?: T[]) {
    if (!filters) return;
  }

  public mapToSingleSearchBarCategoryResult(category: string): PolarisSearchBarCategoryResult<string>[] {
    const mappedOptions: PolarisSearchBarResult<string>[] = this.options?.map((option: PolarisGroupOption<T>) => (new PolarisSearchBarResult({
      id: option.testId,
      label: option.label,
      value: option.value.toString(),
      selected: option.selected,
      testId: option.testId
    }))) ?? [];

    const options = mappedOptions.filter(
      (value: PolarisSearchBarResult<string>, index: number, self: PolarisSearchBarResult<string>[]) =>
        self.findIndex((searchResult: PolarisSearchBarResult<string>) => searchResult.id === value.id) === index
    );

    return [new PolarisSearchBarCategoryResult({
      category,
      options,
    })];
  }
}
