import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  Signal,
  signal,
  TemplateRef,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BaseEntity, DealerOptions, User } from '@classes';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UserAdministrationService } from '@services';
import { NestedFormValues } from '@types';
import { UserTemplateBaseComponent } from 'apps/user-administration/src/_components/_user-templates/user-template-base';
import {
  PolarisCheckboxGroup,
  PolarisGroupOption,
  PolarisIcon,
  PolarisDivider,
  PolarisRadioGroup,
  PolarisStatusIcon,
} from '@dealer-portal/polaris-ui';
import { DisplayFieldComponent } from '@components/display-field';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { startWith, tap } from 'rxjs';

export interface ActivityFormData {
  name: string;
  formControl?: FormControl;
  formGroup: FormGroup;
  options: PolarisGroupOption<void>[];
}

@UntilDestroy()
@Component({
    selector: 'ua-activity-template',
  imports: [
    CommonModule,
    DisplayFieldComponent,
    PolarisStatusIcon,
    PolarisCheckboxGroup,
    PolarisRadioGroup,
    ReactiveFormsModule,
    PolarisIcon,
    PolarisDivider,
    TranslatePipe,
  ],
    templateUrl: './activity-template.component.html',
    styleUrl: './activity-template.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ActivityTemplateComponent extends UserTemplateBaseComponent {
  @ViewChild('activePrimaryContactTemplate', { static: true }) activePrimaryContactTemplate!: TemplateRef<unknown>;
  @ViewChild('vendorNumberTemplate', { static: true }) vendorNumberTemplate!: TemplateRef<unknown>;

  public activityFormData: WritableSignal<ActivityFormData | null> = signal<ActivityFormData | null>(null);
  public userDetails: WritableSignal<User | null> = signal<User | null>(null);

  public employmentFormData: WritableSignal<ActivityFormData | null> = signal<ActivityFormData | null>(null);
  public selectedEmploymentType: WritableSignal<BaseEntity | null> = signal<BaseEntity | null>(null);

  public showPoints: Signal<boolean> = computed(() => this.userAdministrationService.isPointsEligible());
  public showSpiffs: Signal<boolean> = computed(() => this.userAdministrationService.isSpiffEligible());
  public showWebInfinity: Signal<boolean> = computed(() => this.userAdministrationService.isWebInfinityEligible());

  public labels: Record<string, string> = {};

  public originalActivityFormValues!: ReturnType<FormGroup['getRawValue']>;
  public originalEmploymentFormValue!: ReturnType<FormControl['getRawValue']>;

  public instructionsText!: string;
  public employmentFormErrorMessage!: string;
  public activePrimaryCommunicationContactWarning!: string;

  public pageName: string = 'profile';
  public activityFormName: string = 'activity';
  public employmentFormName: string = 'employmentType';

  constructor(
    public override translateService: TranslateService,
    public override userAdministrationService: UserAdministrationService,
    private _formBuilder: FormBuilder,
  ) {
    super(translateService, userAdministrationService);

    this.activePrimaryCommunicationContactWarning = this.translateService.instant('errors.active-primary-communication-contact');
    this.employmentFormErrorMessage = this.translateService.instant('errors.employment-type-is-required');
    this.instructionsText = this.translateService.instant('form.instructions.select-all-that-apply');
    this.labels = {
      activeUser: this.translateService.instant('form.active-user'),
      securityAdminAccess: this.translateService.instant('form.security-admin-access'),
      eligibleForSpiffs: this.translateService.instant('form.eligible-for-spiffs'),
      eligibleForPoints: this.translateService.instant('form.eligible-for-points'),
      primaryCommunicationContact: this.translateService.instant('form.primary-communication-contact'),
      webInfinity: this.translateService.instant('form.access-to-intl-dealer-portal'),
      vendorNumber: this.translateService.instant('form.vendor-number'),
    };
    this._initActivityFormDataEffect();
    this._initFormEffect();
    this._initUsersEffect();
    this._initActivePrimaryContactEffect();
  }

  private _initActivityFormDataEffect(): void {
    effect(() => {
      const dealerOptions: DealerOptions | null = this.userAdministrationService.dealerOptions();
      const userDetails: User | null = this.userAdministrationService.userDetails();

      if (!dealerOptions ||!userDetails) return;

      this.userDetails.set(userDetails);
      this._buildActivityFormData();
    });
  }

  private _initFormEffect(): void {
    effect(() => {
      const activityFormData: ActivityFormData| null = this.activityFormData();
      const employmentFormData: ActivityFormData| null = this.employmentFormData();

      if (!activityFormData || !employmentFormData) return;

     this._updateActivityForm(activityFormData, employmentFormData);

    });
  }

  // This effect re-runs when the users list changes, so even if ALL users haven't loaded by the time we are on this component, it will once the call complete
  // TODO: This is only used for checking admin access, if it only needs active users, we can speed it up using this.userAdministrationService.activeUsers()
  private _initUsersEffect(): void {
    effect(() => {
      const userDetails: User | null = this.userAdministrationService.userDetails();
      const users: User[] | null = this.userAdministrationService.users();
      const formData: ActivityFormData | null = this.activityFormData();

      if (userDetails && formData && (users && users.length > 0)) {
        this._setAdminAccess();
      }
    });
  }

  private _initActivePrimaryContactEffect(): void {
    effect(() => {
      const userDetails: User | null = this.userAdministrationService.userDetails();
      const activityFormData: ActivityFormData | null = this.activityFormData();

      if (activityFormData && userDetails) {
        this._setPrimaryCommunicationContact();
      }
    });
  }

  private _buildActivityFormData(): void {
    const userDetails: User = this.userAdministrationService.userDetails() as User;

    const activityFormGroup: FormGroup = this._formBuilder.group({
      [this.labels['activeUser']]: [userDetails.active],
      [this.labels['securityAdminAccess']]: [userDetails.admin],
      [this.labels['eligibleForSpiffs']]: [userDetails.spiffEligible],
      [this.labels['eligibleForPoints']]: [userDetails.pointsEligible],
      [this.labels['primaryCommunicationContact']]: [userDetails.isPrimaryCommunicationContact],
      [this.labels['webInfinity']]: [userDetails.shareToWebInfinity],
    });
    const initialActivityOptions: PolarisGroupOption<void>[] = this._generateOptions(activityFormGroup);
    const filteredActivityOptions: PolarisGroupOption<void>[] = this.getActivityOptions(initialActivityOptions);
    const updatedActivityOptions: PolarisGroupOption<void>[] = this._applyCustomContent(filteredActivityOptions, userDetails);

    const employmentTypeFormControl: FormControl = new FormControl(userDetails.employmentType.name);
    const employmentTypeFormGroup: FormGroup = this._buildFormGroup();
    const employmentTypeOptions: PolarisGroupOption<void>[] = this._generateOptions(employmentTypeFormGroup);

    const activityFormData: ActivityFormData = {
      name: this.activityFormName,
      formGroup: activityFormGroup,
      options: updatedActivityOptions,
    }

    const employmentFormData: ActivityFormData = {
      name: this.employmentFormName,
      formControl: employmentTypeFormControl,
      formGroup: employmentTypeFormGroup,
      options: employmentTypeOptions,
    };

    employmentFormData.formControl?.setValidators([Validators.required]);

    if (this.isAddView) {
      // Add view
      employmentFormData.formControl?.updateValueAndValidity({ emitEvent: false });
    } else {
      // Edit view
      employmentFormData.formControl?.updateValueAndValidity();
      employmentFormData.formControl?.markAsTouched();
    }

    this.originalActivityFormValues = activityFormData.formGroup.getRawValue();
    this.originalEmploymentFormValue = employmentFormData.formControl?.getRawValue();

    this.activityFormData.set(activityFormData);
    this.employmentFormData.set(employmentFormData);

    this._subscribeToFormEvents();
  }

  private _applyCustomContent(
    options: PolarisGroupOption<void>[],
    userDetails: User
  ): PolarisGroupOption<void>[] {
    return options.map((option: PolarisGroupOption<void>) => {
      let customContent: PolarisGroupOption<void>['customContent'] = option.customContent;

      // Case 1 — Active User warning
      if (userDetails.isPrimaryCommunicationContact && option.label === this.labels['activeUser']) {
        customContent = this.activePrimaryContactTemplate;
      }

      // Case 2 — Vendor Number content for Spiffs
      if (userDetails.vendorNumber && option.label === this.labels['eligibleForSpiffs']) {
        customContent = this.vendorNumberTemplate;
      }

      return new PolarisGroupOption<void>({
        ...option,
        customContent,
      });
    });
  }

  private _buildFormGroup(): FormGroup {
    const dealerOptions: DealerOptions = this.userAdministrationService.dealerOptions() as DealerOptions;
    const userDetails: User = this.userAdministrationService.userDetails() as User;
    const formGroup: FormGroup = this._formBuilder.group({});
    const dealerEmploymentTypes: BaseEntity[] = (dealerOptions.employmentTypes || []);
    const userEmploymentType: BaseEntity = userDetails.employmentType;

    dealerEmploymentTypes.forEach((employmentType: BaseEntity): void => {
      employmentType = new BaseEntity(employmentType);
      const formControlName: string = employmentType.name;
      let formControlValue: boolean;

      if (this.isAddView) {
        // New user add view: default OFF
        formControlValue = false;
      } else {
        // Edit view: initialize from user details
        formControlValue = userEmploymentType.name === formControlName;
      }

      formGroup.addControl(formControlName, new FormControl(formControlValue));
    });

    return formGroup;
  }

  public getActivityOptions(options: PolarisGroupOption<void>[]): PolarisGroupOption<void>[] {
    return options.filter((option: PolarisGroupOption<void>): boolean => {
      switch (option.label) {
        case this.labels['primaryCommunicationContact']:
          return this.isDetailsView;

        case this.labels['eligibleForSpiffs']:
          return this.showSpiffs();

        case this.labels['eligibleForPoints']:
          return this.showPoints();

        case this.labels['webInfinity']:
          return this.showWebInfinity();

        default:
          return true;
      }
    });
  }

  private _subscribeToFormEvents(): void {
    const activityForm: FormGroup | undefined = this.activityFormData()?.formGroup;
    const employmentForm: FormControl = this.employmentFormData()?.formControl as FormControl;

    if (!activityForm || !employmentForm) return;

    activityForm.get(this.labels['eligibleForSpiffs'])?.valueChanges.pipe(
      tap((spiffSelected: boolean): void => {
        this.userAdministrationService.spiffSelected.set(spiffSelected);
        if (spiffSelected) {
          activityForm.get(this.labels['eligibleForPoints'])?.patchValue(true);
          activityForm.get(this.labels['eligibleForPoints'])?.disable();
        } else {
          activityForm.get(this.labels['eligibleForPoints'])?.enable();
        }
      }),
      untilDestroyed(this),
    ).subscribe();

    activityForm.valueChanges.pipe(
      tap(() => {
        // Must use getRawValue to include possibly disabled fields
        const raw: NestedFormValues = activityForm.getRawValue();
        const changed: boolean = this.haveObjectsChanged(this.originalActivityFormValues, raw);
        this.userAdministrationService.activityFormChanged.set(changed);
      }),
      untilDestroyed(this),
    ).subscribe();

    employmentForm.valueChanges.pipe(
      startWith(employmentForm.getRawValue()),
      tap((newEmploymentTypeName: string): void => {
        // Watch for changes
        const raw: NestedFormValues = employmentForm.getRawValue();
        const changed: boolean = this.haveObjectsChanged(this.originalEmploymentFormValue, raw);
        this.userAdministrationService.employmentFormChanged.set(changed);

        const selected: BaseEntity = this.userAdministrationService.dealerOptions()?.employmentTypes.find(
          (employmentType: BaseEntity): boolean => newEmploymentTypeName === employmentType.name) as BaseEntity;

        this.selectedEmploymentType.set(selected);
      }),
      untilDestroyed(this),
    ).subscribe();

    employmentForm.statusChanges.pipe(
      tap((): void => {
        const isInvalid: boolean = employmentForm.invalid;

        // Add view
        if (this.isAddView && !employmentForm.touched) {
          return;
        }

        this.userAdministrationService.employmentFormInvalid.set(isInvalid);
      }),
      untilDestroyed(this),
    ).subscribe();

  }

  private _updateActivityForm(
    activityFormData: ActivityFormData,
    employmentFormData: ActivityFormData,
  ): void {
    const userDetails: User = this.userAdministrationService.userDetails() as User;

    activityFormData.formGroup.patchValue({
      [this.labels['activeUser']]: userDetails.active,
      [this.labels['securityAdminAccess']]: userDetails.admin,
      [this.labels['eligibleForSpiffs']]: userDetails.spiffEligible,
      [this.labels['eligibleForPoints']]: userDetails.pointsEligible,
      [this.labels['primaryCommunicationContact']]: userDetails.isPrimaryCommunicationContact,
      [this.labels['webInfinity']]: userDetails.shareToWebInfinity,
    });

    const activityFormOptions: PolarisGroupOption<void>[] = this._generateOptions(activityFormData.formGroup);
    const filtered: PolarisGroupOption<void>[] = this.getActivityOptions(activityFormOptions);

    // reapply custom content here
    activityFormData.options = this._applyCustomContent(filtered, userDetails);

    employmentFormData.formControl?.patchValue(userDetails.employmentType.name);
    employmentFormData.options = this._generateOptions(employmentFormData.formGroup);
  }

  private _setAdminAccess(): void {
    const userDetails: User = this.userAdministrationService.userDetails() as User;
    const users: User[] = this.userAdministrationService.users() as User[];
    const activityForm: FormGroup = this.activityFormData()?.formGroup as FormGroup;
    const adminFormControl: FormControl = activityForm.get(this.labels['securityAdminAccess']) as FormControl;

    const adminUsers: User[] = users.filter((user: User): boolean => {
      const isCurrentUser: boolean = user.portalAuthenticationId === userDetails.portalAuthenticationId;

      return user.admin && !isCurrentUser;
    });

    const noAdminUsers: boolean = adminUsers.length === 0;

    if (noAdminUsers) {
      adminFormControl.patchValue(true);
      adminFormControl.disable();
    }
  }

  public _setPrimaryCommunicationContact(): void {
    const activeUserLabel: string = this.labels['activeUser'];
    const userDetails: User = this.userAdministrationService.userDetails() as User;
    const activityForm: FormGroup = this.activityFormData()?.formGroup as FormGroup;

    if (userDetails.isPrimaryCommunicationContact) {
      activityForm.get(activeUserLabel)?.patchValue(true);
      activityForm.get(activeUserLabel)?.disable();
    } else {
      activityForm.get(activeUserLabel)?.enable();
    }
  }
}
