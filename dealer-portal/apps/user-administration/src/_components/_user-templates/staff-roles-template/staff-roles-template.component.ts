import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  OnDestroy,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BaseEntity, DealerOptions, User } from '@classes';
import { ValidationService } from '@dealer-portal/polaris-core';
import { PolarisCheckboxGroup, PolarisGroupOption } from '@dealer-portal/polaris-ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ErrorPayload, UserAdministrationService } from '@services';
import { NestedFormValues } from '@types';
import { UserTemplateBaseComponent } from 'apps/user-administration/src/_components/_user-templates/user-template-base';
import { DisplayFieldComponent } from '@components/display-field';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs';

export interface ServiceStaffRoleFormData {
  name: string;
  formGroup: FormGroup;
  options: PolarisGroupOption<void>[];
}

@UntilDestroy()
@Component({
    selector: 'ua-staff-roles-template',
    imports: [
        CommonModule,
        DisplayFieldComponent,
        PolarisCheckboxGroup,
        ReactiveFormsModule,
        TranslatePipe
    ],
    templateUrl: './staff-roles-template.component.html',
    styleUrl: './staff-roles-template.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StaffRolesTemplateComponent extends UserTemplateBaseComponent implements OnDestroy {
  public serviceStaffRoleFormData: WritableSignal<ServiceStaffRoleFormData | null> = signal<ServiceStaffRoleFormData | null>(null);
  public selectedRoles: WritableSignal<BaseEntity[]> = signal<BaseEntity[]>([]);
  public userDetails: WritableSignal<User | null> = signal<User | null>(null);

  public instructionsText!: string;
  public instructionsTooltipText!: string;
  public errorMessage!: string;
  public pageName: string = 'profile';
  public formName: string = 'ServiceStaffRoles';

  public originalFormValues!: ReturnType<FormGroup['getRawValue']>;

  constructor(
    public override translateService: TranslateService,
    public override userAdministrationService: UserAdministrationService,
    private _formBuilder: FormBuilder,
    private _validationService: ValidationService,
  ) {
    super(translateService, userAdministrationService);

    this.errorMessage = this.translateService.instant('errors.at-least-one-service-staff-role-selected');
    this.instructionsText = this.translateService.instant('form.instructions.select-all-that-apply');
    this.instructionsTooltipText = this.translateService.instant('tooltips.service-staff-roles-tooltip');

    this._initServiceStaffRolesDataEffect();
    this._initFormEffect();
  }

  public ngOnDestroy(): void {
    const clearErrorsPayload: ErrorPayload = {
      page: this.pageName,
      category: this.formName,
    };
    this.onError(clearErrorsPayload);
    this.userAdministrationService.serviceStaffRolesFormInvalid.set(false);
  }

  private _initServiceStaffRolesDataEffect(): void {
    effect(() => {
      const dealerOptions: DealerOptions | null = this.userAdministrationService.dealerOptions();
      const userDetails: User | null = this.userAdministrationService.userDetails();

      if (!dealerOptions ||!userDetails) return;

      this.userDetails.set(userDetails);
      this._buildStaffRoleFormData();
    });
  }

  private _initFormEffect(): void {
    effect(() => {
      const serviceStaffRoleFormData: ServiceStaffRoleFormData| null = this.serviceStaffRoleFormData();

      if (!serviceStaffRoleFormData) return;

      this._updateCheckboxGroup(serviceStaffRoleFormData);
      serviceStaffRoleFormData.options = this._generateOptions(serviceStaffRoleFormData.formGroup);

    });
  }

  private _buildStaffRoleFormData(): void {
    const formGroup: FormGroup = this._buildFormGroup();
    const options: PolarisGroupOption<void>[] = this._generateOptions(formGroup);

    const serviceStaffRoleFormData: ServiceStaffRoleFormData = {
      name: this.formName,
      formGroup,
      options,
    }

    serviceStaffRoleFormData.formGroup.setValidators([this._validationService.atLeastOneSelectedValidator()]);
    serviceStaffRoleFormData.formGroup.markAllAsTouched();
    serviceStaffRoleFormData.formGroup.markAsDirty();
    serviceStaffRoleFormData.formGroup.updateValueAndValidity({ emitEvent: true });

    this.originalFormValues = serviceStaffRoleFormData.formGroup.getRawValue();

    this.serviceStaffRoleFormData.set(serviceStaffRoleFormData);

    this._subscribeToFormGroupEvents();
  }

  private _buildFormGroup(): FormGroup {
    const dealerOptions: DealerOptions = this.userAdministrationService.dealerOptions() as DealerOptions;
    const userDetails: User = this.userAdministrationService.userDetails() as User;
    const formGroup: FormGroup = this._formBuilder.group({});
    const dealerRoles: BaseEntity[] = (dealerOptions.serviceStaffRoles || []);
    const userRoles: BaseEntity[] = (userDetails.serviceStaffRoles || []);

    dealerRoles.forEach((role: BaseEntity): void => {
      role = new BaseEntity(role);

      const formControlName: string = role.name;
      let formControlValue: boolean;

      if (this.isAddView) {
        // New user add view: checkboxes default OFF
        formControlValue = false;
      } else {
        // Edit view: initialize from user details
        formControlValue = userRoles.some(
          (selection: BaseEntity) => selection.name === formControlName
        );
      }

      formGroup.addControl(formControlName, new FormControl(formControlValue));
    })

    return formGroup;
  }

  private _updateCheckboxGroup(serviceStaffRoleFormData: ServiceStaffRoleFormData): void {
    const dealerOptions: DealerOptions = this.userAdministrationService.dealerOptions() as DealerOptions;
    const userDetails: User = this.userAdministrationService.userDetails() as User;

    const formControlName: string = serviceStaffRoleFormData.name;

    const options: BaseEntity[] = (dealerOptions[formControlName] || []) as BaseEntity[];
    const userSelections: BaseEntity[] = (userDetails[formControlName] || []) as BaseEntity[];
    const key: keyof ServiceStaffRoleFormData = 'name';

    // create a new object with the checkbox values based on the user's selections and options
    const updateObject: Record<string, boolean> = options.reduce(
      (checkboxStates: Record<string, boolean>, option: BaseEntity) => {
        const keyValue: string = option[key];
        checkboxStates[keyValue] = userSelections.some(
          (userSelection: BaseEntity): boolean => {
          return userSelection[key] === keyValue;
        });

        return checkboxStates;
      }, {} as Record<string, boolean>);

    // update the checkbox group with the new object
    serviceStaffRoleFormData.formGroup.patchValue({
      [formControlName]: updateObject,
    });
  }

  private _subscribeToFormGroupEvents(): void {
    const serviceStaffRolesForm: FormGroup | undefined = this.serviceStaffRoleFormData()?.formGroup;

    if (!serviceStaffRolesForm) return;

    // Track selected roles immediately on load and on changes
    serviceStaffRolesForm.valueChanges
      .pipe(
        tap((): void => {
          // Watch for changes
          const raw: NestedFormValues = serviceStaffRolesForm.getRawValue();
          const changed: boolean = this.haveObjectsChanged(this.originalFormValues, raw);
          this.userAdministrationService.serviceStaffRolesFormChanged.set(changed);

          const allOptions: BaseEntity[] =
            this.userAdministrationService.dealerOptions()?.serviceStaffRoles?.map(
              (role: BaseEntity) => new BaseEntity(role),
            ) ?? [];

          const selected: BaseEntity[] = allOptions.filter(
            (opt: BaseEntity): boolean => raw[opt.name],
          );

          this.selectedRoles.set(selected);
        }),
        untilDestroyed(this),
      )
      .subscribe();

    serviceStaffRolesForm.statusChanges
      .pipe(
        tap((): void => {
          const isInvalid: boolean = serviceStaffRolesForm.invalid;

          this.userAdministrationService.serviceStaffRolesFormInvalid.set(isInvalid);

          const errorPayload: ErrorPayload = {
            page: this.pageName,
            category: this.formName,
            messages: isInvalid ? [this.errorMessage] : [],
          }
          this.onError(errorPayload);
        }),
        untilDestroyed(this),
      ).subscribe();
  }
}
