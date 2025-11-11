import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NO_ERRORS_SCHEMA,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, ValueChangeEvent } from '@angular/forms';
import {
  AccessControlLevel,
  BaseUserInfo,
  BooleanAsString,
  KebabCasePipe,
  PageAccessoryCategory,
  PermissionPage,
  Permissions,
  PortalUserInternalClaim,
} from '@dealer-portal/polaris-core';
import {
  PolarisAccordion,
  PolarisExpansionPanel,
  PolarisGroupOption,
  PolarisIcon,
  PolarisInput,
  PolarisNotificationService,
  PolarisRadioGroup,
} from '@dealer-portal/polaris-ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UserAdministrationService } from '@services';
import { NestedFormValues } from '@types';
import { BehaviorSubject, Observable, Subscriber, Subscription, take, tap } from 'rxjs';
import { TwoColumnRadioGroupComponent } from '../two-column-radio-group/two-column-radio-group.component';

export interface UniformLists {
  uniform: string[][];
  nonUniform: string[][];
}

@UntilDestroy()
@Component({
  selector: 'uai-permissions-template',
  imports: [
    CommonModule,
    PolarisAccordion,
    PolarisExpansionPanel,
    PolarisRadioGroup,
    PolarisIcon,
    TranslatePipe,
    PolarisInput,
    TwoColumnRadioGroupComponent
  ],
  templateUrl: './permissions-template.component.html',
  styleUrl: './permissions-template.component.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
  ]
})
export class PermissionsTemplateComponent implements OnInit, OnChanges {
  @Input() internalUserInfo?: BaseUserInfo<PortalUserInternalClaim> | null;
  @Input() permissions: Permissions = new Permissions();
  @Input() isDetailsView: boolean = true;
  @Input() public expansionPanelTestId!: string;
  @Output() permissionsUpdated: EventEmitter<Permissions> = new EventEmitter<Permissions>();
  @Output() formInitialized: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();

  private _permissions: BehaviorSubject<Permissions | null> = new BehaviorSubject<Permissions | null>(null);
  public permissions$: Observable<Permissions | null> = this._permissions.asObservable();

  public permissionsForm: FormGroup = new FormGroup({}) as FormGroup;
  private _permissionsFormSubscription!: Subscription;
  public radioMinWidth: string = '95px';
  public uniformLists: UniformLists = { uniform: [], nonUniform: [] };
  public originalFormValues!: ReturnType<FormGroup['getRawValue']>;
  public kebabCasePipe: KebabCasePipe = new KebabCasePipe;
  public accountImpersonationPermissionOptions: PolarisGroupOption<BooleanAsString>[] = [
    this._createGroupOption('-', 'none', 'accountImpersonationPermission'),
    this._createGroupOption('r', 'read', 'accountImpersonationPermission'),
    this._createGroupOption('rw', 'add-edit', 'accountImpersonationPermission')
  ];
  public internalImpersonationPermissionOptions: PolarisGroupOption<string>[] = [
    this._createGroupOption('-', 'none', 'internalImpersonationPermission'),
    this._createGroupOption('r', 'read', 'internalImpersonationPermission'),
    this._createGroupOption('rw', 'add-edit', 'internalImpersonationPermission')
  ];
  public accountStatusOptions: PolarisGroupOption<string>[] = [
    this._createGroupOption('true', 'active', 'isActive'),
    this._createGroupOption('false', 'inactive', 'isActive')
  ];
  public optiPortalAdminStatusOptions: PolarisGroupOption<string>[] = [
    this._createGroupOption('true', 'active', 'isOptimizelyPortalAdmin'),
    this._createGroupOption('false', 'inactive', 'isOptimizelyPortalAdmin')
  ];
  public optiLanguageAdminStatusOptions: PolarisGroupOption<string>[] = [
    this._createGroupOption('true', 'active', 'isOptimizelyLanguageAdmin'),
    this._createGroupOption('false', 'inactive', 'isOptimizelyLanguageAdmin')
  ];
  public optiContentAdminStatusOptions: PolarisGroupOption<string>[] = [
    this._createGroupOption('true', 'active', 'isOptimizelyContentAdmin'),
    this._createGroupOption('false', 'inactive', 'isOptimizelyContentAdmin')
  ];

  public inputCharacterLimit: number = 100;
  public emailCharacterLimit: number = 50;

  // Map to keep track of PermissionPage by control name
  private _controlNameToPermissionPage: Record<string, PermissionPage> = {};

  private _orderedAccessLevels: PageAccessoryCategory[] = [
    new PageAccessoryCategory({
      displayName: "Add / Edit",
      value: AccessControlLevel.ReadWrite
    }),
    new PageAccessoryCategory({
      displayName: "Read Only",
      value: AccessControlLevel.Read
    }),
    new PageAccessoryCategory({
      displayName: "No Access",
      value: AccessControlLevel.None
    })
  ];

  constructor(
    private _userAdministrationService: UserAdministrationService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _polarisNotificationService: PolarisNotificationService,
    private _translate: TranslateService,
  ) {}

  public ngOnInit(): void {
    this._subscribeToPermissions();
  }

  public ngOnChanges(changes: Record<string, SimpleChange>): void {
    const permissionChanges: SimpleChange = changes['permissions'];

    if (permissionChanges && permissionChanges.currentValue) {
      this._permissions.next(permissionChanges.currentValue);
    }
  }

  private _subscribeToPermissions(): void {
    this.permissions$.pipe(
      tap((permissions: Permissions | null): void => {

        if (permissions) {
          this._createPermissionsForm(permissions);
        }
      }),
      untilDestroyed(this),
    ).subscribe(() => {
      this._setAdditionalClaimsFormControls();
    });
  }

  private _setAdditionalClaimsFormControls(): void {
    const claims = this.internalUserInfo?.claims;
    const controls = [
      { name: 'accountImpersonationPermission', value: claims?.accountImpersonationPermission || AccessControlLevel.None },
      { name: 'internalImpersonationPermission', value: claims?.internalImpersonationPermission || AccessControlLevel.None },
      { name: 'isActive', value: String(claims?.isActive?.toLowerCase() === 'true') },
      { name: 'isOptimizelyPortalAdmin', value: String(claims?.isOptimizelyPortalAdmin?.toLowerCase() === 'true') },
      { name: 'isOptimizelyLanguageAdmin', value: String(claims?.isOptimizelyLanguageAdmin?.toLowerCase() === 'true') },
      { name: 'isOptimizelyContentAdmin', value: String(claims?.isOptimizelyContentAdmin?.toLowerCase() === 'true') },
      { name: 'helpDeskNumber', value: this.isDetailsView ? claims?.helpDeskNumber : '' },
      { name: 'email', value: claims?.email || '' },
      { name: 'givenName', value: claims?.givenName || '' },
      { name: 'familyName', value: claims?.familyName || '' },
      { name: 'salesRepId', value: claims?.salesRepId || '' },
      { name: 'salesRole', value: claims?.salesRole || '' },
    ];

    controls.forEach(({ name, value }) => {
        this.permissionsForm.addControl(name, new FormControl(value));
      if (this.isDetailsView) {
        this.getFormControl(name).disable();
      }
    });

    this.permissionsForm.addValidators(this._isPermissionsFormValid());
    this.permissionsForm.updateValueAndValidity();
    this.formInitialized.emit(this.permissionsForm);

    this._changeDetectorRef.detectChanges();
  }

  private _createPermissionsForm(permissions: Permissions): void {
    if (this._permissionsFormSubscription) {
      this._permissionsFormSubscription.unsubscribe();

      this._clearAllControls$().pipe(
        take(1),
        tap((permissionsFormIsEmpty: boolean): void => {
          if (permissionsFormIsEmpty) {
            this._populatePermissionsForm(permissions);
          }
        }),
      ).subscribe();
    } else {
      this._populatePermissionsForm(permissions);
    }
  }

  private _populatePermissionsForm(permissions: Permissions): void {
    permissions.pages.forEach((page: PermissionPage): void => {
      const pageGroup: FormGroup = new FormGroup({});
      this.permissionsForm.addControl(this._getControlName(page), pageGroup);

      // Recursive function to handle children
      const addChildControls = (parentGroup: FormGroup, categories: PermissionPage[], depth: number): void => {
        categories.forEach((category: PermissionPage): void => {

          // Map control name to PermissionPage. Used in handleCategorySelectionChange
          const controlName = this._getControlName(category);
          this._controlNameToPermissionPage[controlName] = category;

          if (category.children && category.children.length > 0 && depth === 1) {
            // If the category has children, and we are no lower than the category level, create a FormGroup
            const categoryGroup: FormGroup = new FormGroup({});
            parentGroup.addControl(this._getControlName(category), categoryGroup);

            // Recursively handle children
            addChildControls(categoryGroup, category.children, depth + 1);

            // Add a FormControl for the category's access value
            categoryGroup.addControl(this._getControlName(category), new FormControl());
          } else {
            // If it's a bottom-level node, add a FormControl with the access value
            parentGroup.addControl(this._getControlName(category), new FormControl(category.access || '-'));
          }
        });
      };

      // Start recursion for the current page's children with initial depth of 1
      if (page.children && page.children.length > 0) {
        addChildControls(pageGroup, page.children, 1);
      }
    });

    // Set the initial uniform lists
    this.uniformLists = this._getUniformLists(this.permissionsForm.value);

    // Set the original form values
    if (!this.originalFormValues) {
      this.originalFormValues = structuredClone(this.permissionsForm.getRawValue());
    }

    this._permissionsFormSubscription = this.permissionsForm.valueChanges.pipe(
      tap((nestedFormValues: NestedFormValues): void => {
        this.uniformLists = this._getUniformLists(nestedFormValues);
        const flattenedValues: Record<string, AccessControlLevel> = this._flattenPermissions(nestedFormValues);

        permissions.pages = this._mapFormValuesToOriginalStructure(permissions.pages, flattenedValues);
        this.permissionsUpdated.emit(permissions);
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  private _mapFormValuesToOriginalStructure(
    originalStructure: PermissionPage[],
    flattenedAccess: Record<string, AccessControlLevel>
  ): PermissionPage[] {
    const traverseAndUpdate = (permissions: PermissionPage[]): PermissionPage[] => {
      return permissions.map((permission: PermissionPage): PermissionPage => {
        // Create a new object with updated access
        return {
          ...permission,
          access: flattenedAccess[this._getControlName(permission)] ?? permission.access, // Update access if it exists in the map
          children: permission.children ? traverseAndUpdate(permission.children) : [], // Recurse into children
        };
      });
    };

    return traverseAndUpdate(originalStructure);
  }

  private _flattenPermissions(formValues: NestedFormValues): Record<string, AccessControlLevel> {
    const result: Record<string, AccessControlLevel> = {};

    for (const key in formValues) {
      if (typeof formValues[key] === 'object' && formValues[key] !== null) {
        // Merge the results from deeper levels
        Object.assign(result, this._flattenPermissions(formValues[key]));
      } else {
        // Add the bottom-level key-value pair
        result[key] = formValues[key];
      }
    }

    return result;
  }

  private _isPermissionsFormValid(): ValidatorFn {
    return (): ValidationErrors | null => {

      if (!this.permissionsForm.get('helpDeskNumber')?.value) {
        return { noHelpDeskTicketNumber: true };
      }

      this._changeDetectorRef.detectChanges();

      return null;
    };
  }

  private _createGroupOption<T>(value: string, translationPath: string, formControlName: string, selected?: boolean, tooltip?: string, testId?: string, disabled?: boolean): PolarisGroupOption<T> {
    return new PolarisGroupOption<T>({
      value,
      label: this._translate.instant(translationPath),
      disabled,
      selected,
      formControlName,
      minWidth: this.radioMinWidth,
      tooltip,
      testId
    });
  }

  public getFormControl(controlName: string): FormControl {
    return this.permissionsForm.controls[controlName] as FormControl;
  }

  public generatePermissionOptions(permission: PermissionPage, page?: PermissionPage): PolarisGroupOption<void>[] {
    const options: PolarisGroupOption<void>[] = [];
    let newAccessLevel: AccessControlLevel = permission.access;
    let isUniform: boolean = false;
    const isCategoryLevel: boolean = !!page;

    if (isCategoryLevel) {
      const pageName: string = this._getControlName(page as PermissionPage);
      const categoryName: string = this._getControlName(permission);
      const uniformItem: [string, string] = [pageName, categoryName];
      isUniform = this._isUniform(uniformItem);

      const values: string[] = Object.values(this.permissionsForm.get(pageName)?.get(categoryName)?.value);
      const uniformValue: AccessControlLevel = values[0] as AccessControlLevel;
      newAccessLevel = isUniform ? uniformValue : permission.access;
    }

    const selectable: boolean = (isCategoryLevel && isUniform) || !isCategoryLevel;

    const permissions: Permissions = this._permissions.getValue() as Permissions;

    permissions.pageAccessCategories.forEach((accessLevel: PageAccessoryCategory): void => {
      const option: PolarisGroupOption<void> = new PolarisGroupOption({
        value: accessLevel.value,
        selected: selectable ? newAccessLevel === accessLevel.value : false,
        minWidth: this.radioMinWidth,
        formControlName: this._getControlName(permission),
        testId: `${this.kebabCasePipe.transform(permission.applicationName ?? '')}-application-${this.kebabCasePipe.transform(accessLevel.displayName)}`,
      });

      // check if accessLevel.value in permission.availablepageaccesstypes, ex is read/only available for this page
      if (!permission.availablePageAccessTypes.some(availLevel => availLevel.value === accessLevel.value)) {
        option.disabled = true;
      }
      options.push(option);
    });

    return options;
  }
  
  public getNestedFormControl(
    page: PermissionPage,
    category: PermissionPage,
    permission?: PermissionPage,
  ): FormControl {
    let formControl: FormControl = new FormControl();
    const pageFormGroup: FormGroup = this.permissionsForm.get(this._getControlName(page)) as FormGroup;
    const categoryFormGroup: FormGroup | AbstractControl | null = pageFormGroup.get(this._getControlName(category));
    const originPermission: PermissionPage = permission || category;
    const nestedFormControl: FormControl | null = categoryFormGroup instanceof FormGroup ? categoryFormGroup.get(this._getControlName(originPermission)) as FormControl : null;

    if (nestedFormControl instanceof FormControl) {
      formControl = nestedFormControl;
    }

    return formControl;
  }

  private _getControlName(permission: PermissionPage): string {
    return `${permission.menuName} ${permission.contentId}`;
  }

  public handleCategorySelectionChange(
    event: ValueChangeEvent<unknown>,
    page: PermissionPage,
    category: PermissionPage,
  ): void {
    const pageFormGroup: FormGroup = this.permissionsForm.get(this._getControlName(page)) as FormGroup;
    const categoryFormGroup: FormGroup = pageFormGroup.get(this._getControlName(category)) as FormGroup;

    Object.keys(categoryFormGroup.controls).forEach((key: string): void => {
      const control: AbstractControl | null = categoryFormGroup.get(key);

      if (control instanceof FormControl) {
        // check mapped permissions to see if event.value is valid for this page
        const availablePageAccessTypes = this._controlNameToPermissionPage[key].availablePageAccessTypes;
        if (availablePageAccessTypes.some(availLevel => availLevel?.value === event?.value)) {
          control.setValue(event.value, { emitEvent: false });
        }
        // if event.value is not valid,iterate through permission levels (highest perms to lowest perms)
        // to find next highest available level
        else {
          for (const level of this._orderedAccessLevels) {
            if (level.value < (event.value as AccessControlLevel)) { // AccessControlLevel.None < AccessControlLevel.Read < AccessControlLevel.ReadWrite
              // if access control level is lower than selected category level, assign it
              control.setValue(level.value, { emitEvent: false });
              break; 
            }
          }          
        }
      }
    });
  }

  private _getUniformLists(nestedFormValues: NestedFormValues): UniformLists {
    const uniform: string[][] = [];
    const nonUniform: string[][] = [];

    for (const pageKey in nestedFormValues) {
      if (Object.prototype.hasOwnProperty.call(nestedFormValues, pageKey)) {
        const page: NestedFormValues = nestedFormValues[pageKey];

        for (const categoryKey in page) {
          if (Object.prototype.hasOwnProperty.call(page, categoryKey)) {
            const category: NestedFormValues = page[categoryKey];


            // Remove the self-referential key from consideration
            const filteredCategory: { [k: string]: unknown; } = Object.fromEntries(
              Object.entries(category).filter(([key]): boolean => key !== categoryKey)
            );

            const values: string[] = Object.values(filteredCategory) as string[];
            const isEmptyCategory: boolean = values.length === 0;
            const isUniform: boolean = values.every((value): boolean => value === values[0]);

            if (!isEmptyCategory && isUniform) {
              uniform.push([pageKey, categoryKey]); // Record uniform hierarchy
            } else {
              nonUniform.push([pageKey, categoryKey]); // Record non-uniform hierarchy
            }
          }
        }
      }
    }

    return { uniform, nonUniform };
  }

  private _isUniform(hierarchy: [string, string]): boolean {
    return this.uniformLists.uniform.some((value: string[]): boolean => {
      return value[0] === hierarchy[0] && value[1] === hierarchy[1];
    });
  }

  public resetPermissions(accountNumber: string, userName: string): void {
    this._userAdministrationService.getPermissions$(accountNumber, userName).pipe(
      tap((permissions: Permissions): void => {
        this._permissions.next(null);
        this._changeDetectorRef.detectChanges();
        this.permissionsUpdated.emit(permissions);

        this._polarisNotificationService.info(this._translate.instant('notifications.permissions-reset'));
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  private _clearAllControls$(): Observable<boolean> {
    return new Observable<boolean>((observer: Subscriber<boolean>): void => {
      const controlNames: string[] = Object.keys(this.permissionsForm.controls);

      controlNames.forEach((name: string): void => {
        this.permissionsForm.removeControl(name);
      });


      // Emit true if the formGroup is empty
      const isEmpty: boolean = Object.keys(this.permissionsForm.controls).length === 0;
      observer.next(isEmpty);
      observer.complete();
    });
  }
  // update general permissions (not for specific pages)
  public permissionsFormChanged(): boolean {
    return !this._userAdministrationService.isDeepEqual(this.originalFormValues, this.permissionsForm.getRawValue());
  }
}
