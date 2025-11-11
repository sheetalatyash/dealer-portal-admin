export class PolarisNavigationTab {
  public label: string = '';
  public code: number = 0;
  public id: string = '';
  public selected: boolean = false;
  public disabled?: boolean = false;
  public testId?: string = 'polaris-navigation-tab';

  constructor(polarisNavigationTab: Partial<PolarisNavigationTab>) {
    Object.assign(this, polarisNavigationTab);
  }
}
