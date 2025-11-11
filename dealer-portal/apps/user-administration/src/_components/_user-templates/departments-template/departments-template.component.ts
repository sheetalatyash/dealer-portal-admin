import {
  AfterViewInit,
  Component,
  computed,
  effect,
  Input,
  OnChanges,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { BaseEntity, DealerOptions, User } from '@classes';
import {
  DepartmentChangeDialogComponent
} from '@components/_user-templates/department-change-dialog/department-change-dialog.component';
import { ValidationService } from '@dealer-portal/polaris-core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ErrorPayload, UserAdministrationService } from '@services';
import { NestedFormValues } from '@types';
import { UserTemplateBaseComponent } from 'apps/user-administration/src/_components/_user-templates/user-template-base';
import { DisplayFieldComponent } from '@components/display-field';
import { PolarisCheckboxGroup, PolarisDialogService, PolarisGroupOption } from '@dealer-portal/polaris-ui';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';
import { distinctUntilChanged, tap } from 'rxjs';

export interface DepartmentsFormData {
  name: string;
  formGroup: FormGroup;
  options: PolarisGroupOption<void>[];
}

@UntilDestroy()
@Component({
    selector: 'ua-departments-template',
    imports: [
        CommonModule,
        DisplayFieldComponent,
        ReactiveFormsModule,
        PolarisCheckboxGroup,
    ],
    templateUrl: './departments-template.component.html',
    styleUrl: './departments-template.component.scss',
})
export class DepartmentsTemplateComponent extends UserTemplateBaseComponent implements OnChanges, AfterViewInit {
  /**
   * Indicates whether the department change dialog should be shown on every change.
   * If 'true', the dialog will show each time the value changes.
   * If 'false', the dialog will only show once on the first change.
   * @type {boolean}
   */
  @Input() public alwaysShowDepartmentDialog: boolean = true;

  /**
   * Indicates whether the secondary dialog action should be shown.
   * @type {boolean}
   */
  @Input() public showSecondaryDialogAction: boolean = false;

  @Input() public override isAddView: boolean = false;
  private _isAddView: WritableSignal<boolean> = signal(false);

  @Input() public override isDetailsView: boolean = false;
  private _isDetailsView: WritableSignal<boolean> = signal(false);

  public departmentsFormData: WritableSignal<DepartmentsFormData | null> = signal<DepartmentsFormData | null>(null);
  public selectedDepartments: WritableSignal<BaseEntity[]> = signal<BaseEntity[]>([]);
  public userDetails: WritableSignal<User | null> = signal<User | null>(null);

  public instructionsText!: string;
  public instructionsTooltipText!: string;
  public errorMessage!: string;
  public errorMessages!: ValidationErrors;
  public pageName: string = 'profile';
  public formName: string = 'departments';

  public originalFormValues!: ReturnType<FormGroup['getRawValue']>;

  private _hasShownDepartmentChangeDialog: WritableSignal<boolean> = signal<boolean>(false);
  private _formReady: WritableSignal<boolean> = signal<boolean>(false);
  private _departmentsFormChangedOnce: WritableSignal<boolean> = signal<boolean>(false);
  private _shouldShowDepartmentDialog: Signal<boolean> = computed(() =>
    !this._hasShownDepartmentChangeDialog() &&
    this._formReady() &&
    !this._isAddView() &&
    !this._isDetailsView() &&
    (this.userAdministrationService.departmentsFormChanged() || this._departmentsFormChangedOnce())
  );

  constructor(
    public override translateService: TranslateService,
    public override userAdministrationService: UserAdministrationService,
    private _dialogService: PolarisDialogService,
    private _formBuilder: FormBuilder,
    private _validationService: ValidationService,
  ) {
    super(translateService, userAdministrationService);

    this.errorMessage = this.translateService.instant('errors.at-least-one-department-selected');
    this.errorMessages = {atLeastOneSelected: this.errorMessage};
    this.instructionsText = this.translateService.instant('form.instructions.select-all-that-apply');
    this.instructionsTooltipText = this.translateService.instant('tooltips.departments-tooltip');

    this._initDepartmentsDataEffect();
    this._initFormEffect();
    this._initSpiffSelectedEffect()
  }

  public ngAfterViewInit(): void {
    this._formReady.set(true);
  }

  public ngOnChanges(): void {
    this._isAddView.set(this.isAddView);
  }

  private _initDepartmentsDataEffect(): void {
    effect(() => {
      const dealerOptions: DealerOptions | null = this.userAdministrationService.dealerOptions();
      const userDetails: User | null = this.userAdministrationService.userDetails();

      if (!dealerOptions ||!userDetails) return;

      this.userDetails.set(userDetails);
      this._buildDepartmentsFormData();
    });
  }

  private _initFormEffect(): void {
    effect(() => {
      const departmentsFormData: DepartmentsFormData| null = this.departmentsFormData();

      if (!departmentsFormData) return;

      this._updateCheckboxGroup(departmentsFormData);
      departmentsFormData.options = this._generateOptions(departmentsFormData.formGroup);

    });
  }

  private _initSpiffSelectedEffect(): void {
    effect(() => {
      const spiffSelected: boolean = this.userAdministrationService.spiffSelected();

      if (spiffSelected) {
        this.departmentsFormData()?.formGroup.get('Sales')?.patchValue(true);
        this.departmentsFormData()?.formGroup.get('Sales')?.disable();
      } else {
        this.departmentsFormData()?.formGroup.get('Sales')?.enable();
      }
    });
  }

  private _buildDepartmentsFormData(): void {
    const formGroup: FormGroup = this._buildFormGroup();
    const options: PolarisGroupOption<void>[] = this._generateOptions(formGroup);

    const departmentsFormData: DepartmentsFormData = {
      name: this.formName,
      formGroup,
      options,
    }

    departmentsFormData.formGroup.setValidators([this._validationService.atLeastOneSelectedValidator()]);

    if (this.isAddView) {
      // Add view: don’t emit errors until touched
      departmentsFormData.formGroup.updateValueAndValidity({ emitEvent: false });
    } else {
      // Edit view: run validators right away
      departmentsFormData.formGroup.updateValueAndValidity();
      departmentsFormData.formGroup.markAsTouched();
    }

    this.originalFormValues = departmentsFormData.formGroup.getRawValue();

    this.departmentsFormData.set(departmentsFormData);

    this._subscribeToFormGroupEvents();
  }

  private _buildFormGroup(): FormGroup {
    const dealerOptions: DealerOptions = this.userAdministrationService.dealerOptions() as DealerOptions;
    const userDetails: User = this.userAdministrationService.userDetails() as User;
    const formGroup: FormGroup = this._formBuilder.group({});
    const dealerDepartments: BaseEntity[] = (dealerOptions.departments || []);
    const userDepartments: BaseEntity[] = (userDetails.departments || []);

    dealerDepartments.forEach((department: BaseEntity): void => {
      department = new BaseEntity(department);

      const formControlName: string = department.name;
      let formControlValue: boolean;

      if (this.isAddView) {
        // New user add view: checkboxes default OFF
        formControlValue = false;
      } else {
        // Edit view: initialize from user details
        formControlValue = userDepartments.some(
          (selection: BaseEntity) => selection.name === formControlName
        );
      }

      formGroup.addControl(formControlName, new FormControl(formControlValue));
    });

    return formGroup;
  }

  private _updateCheckboxGroup(departmentsFormData: DepartmentsFormData): void {
    const dealerOptions: DealerOptions = this.userAdministrationService.dealerOptions() as DealerOptions;
    const userDetails: User = this.userAdministrationService.userDetails() as User;

    const dealerDepartments: BaseEntity[] = dealerOptions.departments || [];
    const userDepartments: BaseEntity[] = userDetails.departments || [];

    dealerDepartments.forEach((dealerDepartment: BaseEntity) => {
      const isSelected: boolean = userDepartments.some(
        (userDepartment: BaseEntity) => userDepartment.name === dealerDepartment.name
      );

      if (isSelected) {
        departmentsFormData.formGroup.get(dealerDepartment.name)?.patchValue(isSelected);
        departmentsFormData.formGroup.get(dealerDepartment.name)?.updateValueAndValidity();
      }
    });


    if (this.userAdministrationService.spiffSelected()) {
      departmentsFormData.formGroup.get('Sales')?.patchValue(true, { emitEvent: false });
      departmentsFormData.formGroup.get('Sales')?.disable({ emitEvent: false });
    }
  }

  private _subscribeToFormGroupEvents(): void {
    const departmentsForm: FormGroup | undefined = this.departmentsFormData()?.formGroup;

    if (!departmentsForm) return;

    // Track selected roles immediately on load and on changes
    departmentsForm.valueChanges
      .pipe(
        distinctUntilChanged((prev, curr) => _.isEqual(prev, curr)),
        tap((): void => {
          // Watch for changes
          const raw: NestedFormValues = departmentsForm.getRawValue();
          const changed: boolean = this.haveObjectsChanged(this.originalFormValues, raw);

          if (changed) {
            this._departmentsFormChangedOnce.set(changed);
          }

          this.userAdministrationService.departmentsFormChanged.set(changed);

          if (this._shouldShowDepartmentDialog()) {
            this._hasShownDepartmentChangeDialog.set(!this.alwaysShowDepartmentDialog);
            this._openDepartmentChangeDialog();
          }

          this.userAdministrationService.isServiceDepartment.set(raw['Service']);

          const allOptions: BaseEntity[] =
            this.userAdministrationService.dealerOptions()?.departments?.map(
              (role: BaseEntity) => new BaseEntity(role),
            ) ?? [];

          const selected: BaseEntity[] = allOptions.filter(
            (opt: BaseEntity): boolean => raw[opt.name],
          );

          this.selectedDepartments.set(selected);
        }),
        untilDestroyed(this),
      )
      .subscribe();

    departmentsForm.statusChanges
      .pipe(
        tap((): void => {
          const isInvalid: boolean = departmentsForm.invalid;

          // Add view
          if (this.isAddView && !departmentsForm.touched) {
            return;
          }

          this.userAdministrationService.departmentsFormInvalid.set(isInvalid);

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

  private _openDepartmentChangeDialog(): void {
    this._dialogService.open(DepartmentChangeDialogComponent, {
      width: '600px',
      disableClose: true,
      data: {
        htmlMessage: this.translateService.instant('department-change-dialog-message'),
        primaryButtonLabel: this.translateService.instant('buttons.confirm'),
        secondaryButtonLabel: this.showSecondaryDialogAction ? this.translateService.instant('buttons.go-back') : null,
        title: this.translateService.instant('title.department-change-dialog-title'),
      },
    });
  }
}
