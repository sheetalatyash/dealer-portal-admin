import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  Input,
  signal,
  Signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BaseEntity, CommunicationCategory, User } from '@classes';
import { UserTemplateBaseComponent } from '@components/_user-templates/user-template-base';
import {
  PolarisAccordion,
  PolarisCheckboxGroup,
  PolarisDivider,
  PolarisExpansionPanel,
  PolarisGroupOption,
  PolarisIcon,
} from '@dealer-portal/polaris-ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UserAdministrationService } from '@services';
import _ from 'lodash';
import { tap } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

export interface CommunicationFormData {
  name: string;
  formGroup: FormGroup;
  options: PolarisGroupOption<void>[];
}

@UntilDestroy()
@Component({
  selector: 'ua-communications-template',
  imports: [
    CommonModule,
    PolarisExpansionPanel,
    PolarisCheckboxGroup,
    PolarisIcon,
    PolarisDivider,
    PolarisAccordion,
    TranslatePipe,
  ],
  templateUrl: './communications-template.component.html',
  styleUrl: './communications-template.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CommunicationsTemplateComponent extends UserTemplateBaseComponent {
  @Input() public isAddCommunicationsView: boolean = false;

  public emailCommunicationFormData: WritableSignal<CommunicationFormData | null> = signal<CommunicationFormData | null>(null);
  public notificationCommunicationFormData: WritableSignal<CommunicationFormData | null> = signal<CommunicationFormData | null>(null);

  public originalEmailCommunicationsFormValues!: ReturnType<FormGroup['getRawValue']>;
  public originalNotificationCommunicationsFormValues!: ReturnType<FormGroup['getRawValue']>;

  public emailCommunicationsFormChanged: WritableSignal<boolean> = signal<boolean>(false);
  public notificationCommunicationsFormChanged: WritableSignal<boolean> = signal<boolean>(false);
  public readonly communicationCategoriesChanged: Signal<boolean> = computed(() =>
    this.emailCommunicationsFormChanged() ||
    this.notificationCommunicationsFormChanged()
  );

  public minWidth: string = '95px';
  public readonly emailGroupKey: string = 'email';
  public readonly notificationGroupKey: string = 'notifications';

  public readonly communicationCategories: Signal<CommunicationCategory[]> = computed((): CommunicationCategory[] => {
    return this.userAdministrationService.communicationCategories();
  });

  public readonly emailCommunicationCategories: Signal<CommunicationCategory[]> = computed(
    (): CommunicationCategory[] =>
      (this.userAdministrationService.communicationCategories() ?? [])
        .filter((category: CommunicationCategory): boolean => !category.notification)
        .sort((a: CommunicationCategory, b: CommunicationCategory) => a.name.localeCompare(b.name))
  );

  public readonly notificationCommunicationCategories: Signal<CommunicationCategory[]> = computed(
    (): CommunicationCategory[] =>
      (this.userAdministrationService.communicationCategories() ?? [])
        .filter((category: CommunicationCategory): boolean => category.notification)
        .sort((a: CommunicationCategory, b: CommunicationCategory) => a.name.localeCompare(b.name))
  );

  private _isApplyingDefaults: boolean = false;

  constructor(
    public override translateService: TranslateService,
    public override userAdministrationService: UserAdministrationService,
    private _formBuilder: FormBuilder,
  ) {
    super(translateService, userAdministrationService);

    this._initCommunicationDataEffect();
    this._initUserDetailsEffect();
  }

  private _initCommunicationDataEffect(): void {
    effect((): void => {
      const communicationCategories: CommunicationCategory[] = this.userAdministrationService.communicationCategories();
      const emailCommunicationCategories: CommunicationCategory[] = this.emailCommunicationCategories();
      const notificationCommunicationCategories: CommunicationCategory[] = this.notificationCommunicationCategories();

      if (
        communicationCategories?.length &&
        (emailCommunicationCategories.length || notificationCommunicationCategories.length)
      ) {
        this._buildCommunicationsFormData();
      }
    });
  }

  private _initUserDetailsEffect(): void {
    effect(() => {
      const userDetails: User | null = this.userAdministrationService.userDetails();

      if (!userDetails || !this.isAddCommunicationsView) return;

      untracked((): void => {
        this._setDefaultCommunicationCategories(userDetails.departments);
      });
    });
  }

  private _buildCommunicationsFormData(): void {
    const additionalCheckboxOptions: Partial<PolarisGroupOption<void>> = { minWidth: '95px' };
    const emailCommunicationCategories: CommunicationCategory[] = this.emailCommunicationCategories();
    const notificationCommunicationCategories: CommunicationCategory[] = this.notificationCommunicationCategories();
    const emailCommunicationsFormGroup: FormGroup = this._buildFormGroup(emailCommunicationCategories);
    const notificationCommunicationsFormGroup: FormGroup = this._buildFormGroup(notificationCommunicationCategories);
    const emailCommunicationsOptions: PolarisGroupOption<void>[] = this._generateOptions(emailCommunicationsFormGroup, additionalCheckboxOptions);
    const notificationCommunicationsOptions: PolarisGroupOption<void>[] = this._generateOptions(notificationCommunicationsFormGroup, additionalCheckboxOptions);

    const emailCommunicationFormData: CommunicationFormData = {
      name: this.emailGroupKey,
      formGroup: emailCommunicationsFormGroup,
      options: emailCommunicationsOptions,
    }

    const notificationCommunicationFormData: CommunicationFormData = {
      name: this.notificationGroupKey,
      formGroup: notificationCommunicationsFormGroup,
      options: notificationCommunicationsOptions,
    }

    this.originalEmailCommunicationsFormValues = emailCommunicationFormData.formGroup.getRawValue();
    this.originalNotificationCommunicationsFormValues = notificationCommunicationFormData.formGroup.getRawValue();

    this.emailCommunicationFormData.set(emailCommunicationFormData);
    this.notificationCommunicationFormData.set(notificationCommunicationFormData);

    this._subscribeToFormGroupEvents();
  }

  private _buildFormGroup(categories: CommunicationCategory[]): FormGroup {
    const formGroup: FormGroup = this._formBuilder.group({});


    categories.forEach((category: CommunicationCategory): void => {
      formGroup.addControl(
        category.name,
        new FormControl<boolean>(category.checked)
      );
    });

    return formGroup;
  }

  private _subscribeToFormGroupEvents(): void {
    const emailCommunicationsFormGroup: FormGroup | undefined = this.emailCommunicationFormData()?.formGroup;
    const notificationCommunicationsFormGroup: FormGroup | undefined = this.notificationCommunicationFormData()?.formGroup;

    if (emailCommunicationsFormGroup) {
      emailCommunicationsFormGroup.valueChanges.pipe(
        tap((raw): void => {
          const changed: boolean = this.haveObjectsChanged(this.originalEmailCommunicationsFormValues, raw);
          this.emailCommunicationsFormChanged?.set(changed);
          this._updateSelectedCategories();
        }),
        untilDestroyed(this),
      ).subscribe();
    }

    if (notificationCommunicationsFormGroup) {
      notificationCommunicationsFormGroup.valueChanges.pipe(
        tap((raw): void => {
          const changed: boolean = this.haveObjectsChanged(this.originalNotificationCommunicationsFormValues, raw);
          this.notificationCommunicationsFormChanged.set(changed);
          this._updateSelectedCategories();
        }),
        untilDestroyed(this),
      ).subscribe();
    }
  };

  private _updateSelectedCategories(): void {
    const emailFormGroup: FormGroup | undefined = this.emailCommunicationFormData()?.formGroup;
    const notificationFormGroup: FormGroup | undefined = this.notificationCommunicationFormData()?.formGroup;

    const emailCommunicationCategories: CommunicationCategory[] = this.emailCommunicationCategories();
    const notificationCommunicationCategories: CommunicationCategory[] = this.notificationCommunicationCategories();

    // Map categories and sync the checked state with FormGroup values
    const mappedEmailCommunicationCategories: CommunicationCategory[] = emailCommunicationCategories.map(
      (communicationCategory: CommunicationCategory): CommunicationCategory => ({
        ...communicationCategory,
        checked: emailFormGroup?.get(communicationCategory.name)?.value === true,
      })
    );

    const mappedNotificationCommunicationCategories: CommunicationCategory[] = notificationCommunicationCategories.map(
      (communicationCategory: CommunicationCategory): CommunicationCategory => ({
        ...communicationCategory,
        checked: notificationFormGroup?.get(communicationCategory.name)?.value === true,
      })
    );

    // Merge and deduplicate by category name
    const mergedCommunicationCategories: CommunicationCategory[] = _.uniqBy(
      [...mappedEmailCommunicationCategories, ...mappedNotificationCommunicationCategories],
      (communicationCategory: CommunicationCategory): string => communicationCategory.name
    );

    this.userAdministrationService.communicationCategories.set(mergedCommunicationCategories);
  }

  /**
   * Applies default communication categories based on the user's departments.
   * Mirrors the legacy "Communicationdefault" business rules.
   */
  private _setDefaultCommunicationCategories(departments: readonly BaseEntity[]): void {
    if (this._isApplyingDefaults) return;
    this._isApplyingDefaults = true;

    try {
      const emailData: CommunicationFormData | null = this.emailCommunicationFormData();
      const notificationData: CommunicationFormData | null = this.notificationCommunicationFormData();

      if (!emailData || !notificationData) return;

      const emailForm: FormGroup = emailData.formGroup;
      const notificationForm: FormGroup = notificationData.formGroup;

      // Combine all form controls into one map for easier iteration
      const allControls: Record<string, FormControl<boolean>> = {
        ...(emailForm.controls as Record<string, FormControl<boolean>>),
        ...(notificationForm.controls as Record<string, FormControl<boolean>>),
      };

      /**
       * Normalize a value for comparison.
       */
      const normalizeValue: (value: string) => string = (value: string): string => value.trim().toLowerCase();

      /**
       * Build a set of canonical department names we will match against.
       */
      const departmentNames: Set<string> = new Set<string>(
        departments.map((dept: BaseEntity) => normalizeValue(dept.name))
      );

      /**
       * Define the matching logic between department and category names.
       */
      const departmentToCategoryMap: Record<string, (categoryName: string) => boolean> = {
        sales: (categoryName: string): boolean =>
          categoryName.includes('sales') || categoryName.includes('marketing'),

        service: (categoryName: string): boolean =>
          categoryName.includes('service'),

        pga: (categoryName: string): boolean =>
          categoryName.includes('pg&a'),

        'f&i': (categoryName: string): boolean =>
          categoryName.includes('finance'),
      };

      /**
       * Determines if a given category should be checked based on department membership.
       */
      const shouldBeChecked = (normalizedCategoryName: string): boolean => {
        for (const deptName of departmentNames) {
          if (deptName.includes('sales')) {
            if (departmentToCategoryMap['sales'](normalizedCategoryName)) return true;
          } else if (deptName.includes('service')) {
            if (departmentToCategoryMap['service'](normalizedCategoryName)) return true;
          } else if (deptName.includes('pg&a') || deptName.includes('pga')) {
            if (departmentToCategoryMap['pga'](normalizedCategoryName)) return true;
          } else if (deptName.includes('f&i') || deptName.includes('finance')) {
            if (departmentToCategoryMap['f&i'](normalizedCategoryName)) return true;
          }
        }

        return false;
      };

      /**
       * RULE: Always check these mandatory categories for new users
       */
      const mandatoryCategories: readonly string[] = [
        'Polaris Announcements and News',
      ];

      const normalizedMandatoryCategories: Set<string> = new Set<string>(
        mandatoryCategories.map(normalizeValue)
      );

      /**
       * Apply the default check states to all controls.
       */
      Object.entries(allControls).forEach(([categoryName, control]: [string, FormControl<boolean>]) => {
        const normalizedCategoryName: string = normalizeValue(categoryName);
        let shouldCheck: boolean = shouldBeChecked(normalizedCategoryName);

        // For new users, always select mandatory categories
        if (this.isAddCommunicationsView && normalizedMandatoryCategories.has(normalizedCategoryName)) {
          shouldCheck = true;
        }

        if (control.value !== shouldCheck) {
          control.setValue(shouldCheck, { emitEvent: true });
        }
      });

      // Sync updates back to the signal service
      this._updateSelectedCategories();
    } finally {
      this._isApplyingDefaults = false;
    }
  }
}
