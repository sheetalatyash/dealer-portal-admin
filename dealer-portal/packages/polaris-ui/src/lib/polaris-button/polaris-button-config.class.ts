import { PolarisThemeLevel } from '../polaris-ui-base';
import { ButtonAction } from './polaris-button-action.enum';

export class ButtonConfig {
  public label: ButtonAction = ButtonAction.Default;
  public theme: PolarisThemeLevel = PolarisThemeLevel.Primary;
  public testId: string = 'polaris-button';
  public visible: boolean = false;

  constructor(data: Partial<ButtonConfig> = {}) {
    Object.assign(this, data);
  }
}
