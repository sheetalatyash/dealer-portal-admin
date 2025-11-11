export class PolarisChipListItem<T> {
  public id = '';
  public label = '';
  public value: T | string = '';
  public testId = 'polaris-chip-list-item-default-data-test-id';
  public selected = false;

  constructor(polarisChipListItem: Partial<PolarisChipListItem<T>> = {}) {
    Object.assign(this as PolarisChipListItem<T>, polarisChipListItem);
  }
}
