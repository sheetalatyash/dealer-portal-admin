import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PolarisGroupOption } from '@dealer-portal/polaris-ui';
import { TranslateService } from '@ngx-translate/core';
import { ErrorPayload, UserAdministrationService } from '@services';
import _ from 'lodash';

@Component({
    selector: 'ua-user-template-base',
    imports: [
        CommonModule,
        ReactiveFormsModule,
    ],
    templateUrl: './user-template-base.component.html',
    styleUrl: './user-template-base.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserTemplateBaseComponent {
  @Input() public isAddView: boolean = false;
  @Input() public isDetailsView: boolean = false;
  @Input() public expansionPanelTestId!: string;

  constructor(
    public translateService: TranslateService,
    public userAdministrationService: UserAdministrationService,
  ) {
  }
  public _generateOptions(formGroup: FormGroup, otherOptions?: Partial<PolarisGroupOption<void>>): PolarisGroupOption<void>[] {
    const options: PolarisGroupOption<void>[] = [];

    Object.keys(formGroup.controls).map((key: string): void => {
      const newOption: PolarisGroupOption<void> = new PolarisGroupOption<void>({
        value: key,
        label: key,
        formControlName: key,
        tooltip: this.getTooltip(key),
        selected: formGroup.get(key)?.value === true,
        ...(otherOptions ?? {}),
      });

      options.push(newOption);
    });

    return options;
  }

  /**
   * Retrieves a tooltip string based on the provided key.
   *
   * @param key - The key for which the tooltip is to be retrieved.
   *              It represents a specific form control name.
   * @returns A string containing the tooltip for the given key, or
   *          `undefined` if no tooltip is available for the key.
   */
  public getTooltip(key: string): string | undefined {
    switch (key) {
      case 'Active User':
        return this.translateService.instant('tooltips.active-user-tooltip');
      case 'Security Admin Access':
        return this.translateService.instant('tooltips.security-admin-access-tooltip');
        case 'Eligible for Spiffs':
        return this.translateService.instant('tooltips.eligible-for-spiffs-tooltip');
      case 'Eligible for Points':
        return this.translateService.instant('tooltips.eligible-for-points-tooltip');
      case 'Primary communication contact':
        return this.translateService.instant('tooltips.primary-communication-contact-tooltip');
      case 'Access to INTL dealer portal (Web Infinity)':
        return this.translateService.instant('tooltips.access-to-intl-dealer-portal-tooltip');
      default:
        return '';
    }
  }

  public haveObjectsChanged<T extends Record<string, boolean>>(
    objA: T,
    objB: T
  ): boolean {
    const toMap = (obj: T): Map<keyof T, T[keyof T]> =>
      new Map(Object.entries(obj) as [keyof T, T[keyof T]][]);

    return !_.isEqual(toMap(objA), toMap(objB));
  }

  /**
   * Emits an event when an error is active or cleared.
   * @param errorPayload
   */
  public onError(errorPayload: ErrorPayload): void {
    this.userAdministrationService.setError(errorPayload);
  }
}
