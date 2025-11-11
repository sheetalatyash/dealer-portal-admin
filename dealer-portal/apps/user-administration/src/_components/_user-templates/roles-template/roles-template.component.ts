import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { BaseEntity, DealerOptions, User } from '@classes';
import { PolarisGroupOption, PolarisRadioGroup } from '@dealer-portal/polaris-ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UserAdministrationService } from '@services';
import { NestedFormValues } from '@types';
import { UserTemplateBaseComponent } from 'apps/user-administration/src/_components/_user-templates/user-template-base';
import { DisplayFieldComponent } from '@components/display-field';
import { TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs';

export interface RoleFormData {
  name: string;
  formControl: FormControl;
  formGroup: FormGroup;
  options: PolarisGroupOption<void>[];
}

@UntilDestroy()
@Component({
    selector: 'ua-roles-template',
    imports: [
        CommonModule,
        DisplayFieldComponent,
        PolarisRadioGroup,
        ReactiveFormsModule,
    ],
    templateUrl: './roles-template.component.html',
    styleUrl: './roles-template.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RolesTemplateComponent extends UserTemplateBaseComponent {
  public roleFormData: WritableSignal<RoleFormData | null> = signal<RoleFormData | null>(null);
  public selectedRole: WritableSignal<BaseEntity | null> = signal<BaseEntity | null>(null);
  public userDetails: WritableSignal<User | null> = signal<User | null>(null);

  public instructionsText!: string;
  public errorMessage!: string;
  public errorMessages!: ValidationErrors;
  public pageName: string = 'profile';
  public formName: string = 'role';

  public originalFormValues!: ReturnType<FormControl['getRawValue']>;

  constructor(
    public override translateService: TranslateService,
    public override userAdministrationService: UserAdministrationService,
    private _formBuilder: FormBuilder,
  ) {
    super(translateService, userAdministrationService);

    this.errorMessage = this.translateService.instant('errors.role-is-required');
    this.errorMessages = {required: this.errorMessage};
    this.instructionsText = this.translateService.instant('form.instructions.select-one');

    this._initServiceStaffRolesDataEffect();
    this._initFormEffect();
  }

  private _initServiceStaffRolesDataEffect(): void {
    effect(() => {
      const dealerOptions: DealerOptions | null = this.userAdministrationService.dealerOptions();
      const userDetails: User | null = this.userAdministrationService.userDetails();

      if (!dealerOptions ||!userDetails) return;

      this.userDetails.set(userDetails);
      this._buildRoleFormData();
    });
  }

  private _initFormEffect(): void {
    effect(() => {
      const roleFormData: RoleFormData| null = this.roleFormData();

      if (!roleFormData) return;

      this._updateRoleForm(roleFormData);

    });
  }

  private _updateRoleForm(roleFormData: RoleFormData): void {
    const userDetails: User = this.userAdministrationService.userDetails() as User;

    roleFormData.formControl.patchValue(userDetails.staffRole.name);
    roleFormData.options = this._generateOptions(roleFormData.formGroup);
  }

  private _buildRoleFormData(): void {
    const userDetails: User = this.userAdministrationService.userDetails() as User;
    const formGroup: FormGroup = this._buildFormGroup();
    const formControl: FormControl = new FormControl(userDetails.staffRole.name);

    const options: PolarisGroupOption<void>[] = this._generateOptions(formGroup);

    const roleFormData: RoleFormData = {
      name: this.formName,
      formControl,
      formGroup,
      options,
    }

    roleFormData.formControl.setValidators([Validators.required]);

    if (this.isAddView) {
      // Add view
      roleFormData.formControl.updateValueAndValidity({ emitEvent: false });
    } else {
      // Edit view
      roleFormData.formControl.updateValueAndValidity();
      roleFormData.formControl.markAsTouched();
    }

    this.originalFormValues = roleFormData.formControl.getRawValue();

    this.roleFormData.set(roleFormData);

    this._subscribeToFormEvents();
  }

  private _buildFormGroup(): FormGroup {
    const dealerOptions: DealerOptions = this.userAdministrationService.dealerOptions() as DealerOptions;
    const userDetails: User = this.userAdministrationService.userDetails() as User;
    const formGroup: FormGroup = this._formBuilder.group({});
    const dealerRoles: BaseEntity[] = (dealerOptions.staffRoles || []);
    const userRole: BaseEntity = userDetails.staffRole;

    dealerRoles.forEach((role: BaseEntity): void => {
      role = new BaseEntity(role);

      const formControlName: string = role.name;
      let formControlValue: boolean;

      if (this.isAddView) {
        // New user add view: all options default OFF
        formControlValue = false;
      } else {
        // Edit view: initialize from user details
        formControlValue = userRole.name === formControlName;
      }

      formGroup.addControl(formControlName, new FormControl(formControlValue));
    });

    return formGroup;
  }

  private _subscribeToFormEvents(): void {
    const rolesForm: FormControl | undefined = this.roleFormData()?.formControl;

    if (!rolesForm) return;

    // Track selected roles immediately on load and on changes
    rolesForm.valueChanges.pipe(
      tap((newRoleName: string): void => {
        // Watch for changes
        const raw: NestedFormValues = rolesForm.getRawValue();
        const changed: boolean = this.haveObjectsChanged(this.originalFormValues, raw);
        this.userAdministrationService.rolesFormChanged.set(changed);

        const selected: BaseEntity = this.userAdministrationService.dealerOptions()?.staffRoles.find(
          (role: BaseEntity): boolean => newRoleName === role.name) as BaseEntity;

        this.selectedRole.set(selected);
        const isStaffRole: boolean = newRoleName.toLowerCase() === 'staff';
        this.userAdministrationService.isStaffRole.set(isStaffRole);
      }),
      untilDestroyed(this),
    ).subscribe();

    rolesForm.statusChanges
      .pipe(
        tap((): void => {
          const isInvalid: boolean = rolesForm.invalid;

          // Add view
          if (this.isAddView && !rolesForm.touched) {
            return;
          }

          this.userAdministrationService.rolesFormInvalid.set(isInvalid);
        }),
        untilDestroyed(this),
      ).subscribe();
  }
}
