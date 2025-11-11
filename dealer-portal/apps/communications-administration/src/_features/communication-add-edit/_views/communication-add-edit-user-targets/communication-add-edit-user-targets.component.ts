import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PolarisCheckboxGroup,
  PolarisDialogService,
  PolarisFilePickerFile,
  PolarisFilePickerStatus,
  PolarisGroupOption,
  PolarisNotificationService,
  PolarisSearchBar,
  PolarisSearchBarCategoryResult,
  PolarisSearchBarResult,
  PolarisTableColumnConfig,
} from '@dealer-portal/polaris-ui';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
  AccountUserResponse, CommunicationAccount, CommunicationApplication, Communication,
  CommunicationCode,
  CoreService,
  DealerEmployeeDict,
  DealerEmployeeEntity,
  DealerPortalApiService,
  Department,
  PortalPageEntity,
  ServiceStaffRole,
  StaffRole,
  StandardResponse,
  UserAdminApiService,
} from '@dealer-portal/polaris-core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UserAccountListingVm } from '../../../../_view_models/user-account-listing.vm';
import { BehaviorSubject, Observable, catchError, map, switchMap, fromEvent } from 'rxjs';
import { CommunicationAddEditTargetsComponent } from '../../_components/communication-add-edit-targets/communication-add-edit-targets.component';
import { CommunicationAddEditTargetsBase } from '@classes/communication-add-edit-targets-base.class';

@UntilDestroy()
@Component({
    selector: 'ca-communication-add-edit-user-targets',
    imports: [CommonModule, PolarisCheckboxGroup, PolarisSearchBar, TranslatePipe, CommunicationAddEditTargetsComponent],
    templateUrl: './communication-add-edit-user-targets.component.html',
    styleUrl: './communication-add-edit-user-targets.component.scss'
})
export class CommunicationAddEditUserTargetsComponent extends CommunicationAddEditTargetsBase implements OnInit {
  @Input() communication?: Communication;

  @Output() loadingChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public accountsTableColumns: PolarisTableColumnConfig<UserAccountListingVm>[] = [
    this.createColumnConfig('emailAddress', 'table.col.email-address'),
    this.createColumnConfig('accountName', 'table.col.account-name'),
    this.createColumnConfig('accountId', 'table.col.account-id'),
    this.createColumnConfig('status', 'table.col.status'),
  ];

  public allAccountsSubject: BehaviorSubject<UserAccountListingVm[]> = new BehaviorSubject<UserAccountListingVm[]>([]);
  public allAccounts$: Observable<UserAccountListingVm[]> = this.allAccountsSubject.asObservable();

  public userTargetsFormGroup!: FormGroup;
  public isLoadingCommunicationAccounts: boolean = true;
  public isLoadingSecurityOrAppPermissions: boolean = true;
  public isAtLeastOneUserTargetSelected: boolean = false;
  public uploadingFile?: PolarisFilePickerFile;
  public filePickerFormControl = new FormControl();

  public departmentSelection = this.createGroupOption('departmentSelected', 'option.department');
  public roleSelection = this.createGroupOption('staffRoleSelected', 'option.role');
  public serviceStaffRoleSelection = this.createGroupOption('serviceStaffRoleSelected', 'option.staff-role');
  public securityOrAppPermissionsSelection = this.createGroupOption(
    'securityOrAppPermissionsSelected',
    'option.permission'
  );

  public departmentOptionsFormGroup!: FormGroup;
  public departmentOptions: PolarisGroupOption<string>[] = [];

  public staffRoleOptionsFormGroup!: FormGroup;
  public staffRoleOptions: PolarisGroupOption<string>[] = [];

  public serviceStaffRoleOptionsFormGroup!: FormGroup;
  public serviceStaffRoleOptions: PolarisGroupOption<string>[] = [];

  private _securityOrAppPermissionsOptionsSubject: BehaviorSubject<PolarisSearchBarCategoryResult<string>[]> = new BehaviorSubject<PolarisSearchBarCategoryResult<string>[]>([]);
  public securityOrAppPermissionsOptions$: Observable<PolarisSearchBarCategoryResult<string>[]> = this._securityOrAppPermissionsOptionsSubject.asObservable();

  private _portalPages: PortalPageEntity[] = [];

  constructor(
    private _coreService: CoreService,
    private _formBuilder: FormBuilder,
    private _rootFormGroup: FormGroupDirective,
    private _userAdminApiService: UserAdminApiService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dealerPortalApiService: DealerPortalApiService,
    protected override _notificationService: PolarisNotificationService,
    protected override _translate: TranslateService,
    protected override _polarisDialogService: PolarisDialogService
  ) {
    super(_polarisDialogService, _notificationService, _translate);
  }

  public ngOnInit(): void {
    this._getFormControls();
    this._getFormData();

    this.initializeFormGroup(
      this.userTargetsFormGroup,
      this.allAccounts$,
    );
    this._subscribeToFormChanges();
    this._loadCommunicationAccounts();
  }

  public onFileSelected(files: File[]): void {
    if (this.handleFilePickerErrors(this.filePickerFormControl)) {
      return;
    }

    if (files?.length > 0) {
      const file = files[0];
      this.uploadingFile = { ...this.filePickerUploading, name: file.name };
      this._processFile(file);
    }
  }

  public onFileCanceled(file: PolarisFilePickerFile): void {
    if (file.status !== PolarisFilePickerStatus.Uploading) {
      this.uploadingFile = undefined;
    }
  }

  public filterSearchResults(
    allResults: PolarisSearchBarCategoryResult<string>[],
    searchText: string): PolarisSearchBarCategoryResult<string>[] {
    const searchTextLowered = searchText.toLowerCase();

    return allResults
      .map((categoryResult: PolarisSearchBarCategoryResult<string>) => ({
        ...categoryResult,
        options: categoryResult.options.filter((option: PolarisSearchBarResult<string>) =>
        option.value.toLowerCase().includes(searchTextLowered) ||
        categoryResult.category.toLowerCase().includes(searchTextLowered))
      }))
      .filter((categoryResult: PolarisSearchBarCategoryResult<string>) => categoryResult.options.length > 0);
  }

  private _loadCommunicationAccounts(): void {
    if (this.communication?.userAccounts) {
      const dealerEmployees =
        this.communication?.userAccounts.map(
          (account: CommunicationAccount): DealerEmployeeEntity =>
            ({
              emailAddress: account.emailAddress,
              dealerId: account.accountNumber,
            } as DealerEmployeeEntity)
        ) || [];
      const dealerEmployeeDict: DealerEmployeeDict = this._convertToDealerEmployeeDict(dealerEmployees);
      this._fetchUserAccounts(dealerEmployeeDict)
        .pipe(untilDestroyed(this))
        .subscribe((accounts: AccountUserResponse[]): void => {
          this._updateAccounts(accounts);
          this.isLoadingCommunicationAccounts = false;
          this.loadingChange.emit(this.isLoading);
        });
    } else {
      this.isLoadingCommunicationAccounts = false;
      this.loadingChange.emit(this.isLoading);
    }
  }

  private _subscribeToFormChanges(): void {
    const securityOrAppPermissionsOptionsControl = this.userTargetsFormGroup.get('securityOrAppPermissionsOptions');

    if (securityOrAppPermissionsOptionsControl) {
      securityOrAppPermissionsOptionsControl.valueChanges.pipe(untilDestroyed(this))
        .subscribe(this._handleSecurityOrAppPermissionsOptionsChange.bind(this));
    }
  }

  /**
   * Maps page names to their corresponding portal pages, then converts to application entities.
   * This converts the page
   *
   * @param selectedOptions The list of selected page names
   */
  private _handleSecurityOrAppPermissionsOptionsChange(selectedOptions: string[]): void {
    const selectedResults = this._securityOrAppPermissionsOptionsSubject.getValue()
      .map((categoryResult: PolarisSearchBarCategoryResult<string>) => ({
        ...categoryResult,
        options: categoryResult.options.filter(option => selectedOptions.includes(option.value))
      }));

    const portalPages = this._portalPages.filter((page: PortalPageEntity) =>
      selectedResults.some((categoryResult: PolarisSearchBarCategoryResult<string>) =>
        categoryResult.options.some((option: PolarisSearchBarResult<string>) => parseInt(option.id.split('-').pop() || '', 10) === page.contentId)
      )
    );

    const applicationEntities = this._convertToApplicationEntities(portalPages);
    this.userTargetsFormGroup.get('securityOrAppPermissionsSelectedResults')?.setValue(applicationEntities);
  }

  private _processFile(file: File): void {
    this._readUserListFile(file)
      .pipe(
        untilDestroyed(this),
        switchMap((dealerEmployees: DealerEmployeeEntity[]) => {
          const dealerEmployeeDict = this._convertToDealerEmployeeDict(dealerEmployees);

          return this._fetchUserAccounts(dealerEmployeeDict);
        }),
        catchError(() => {
          this.uploadingFile = { ...this.uploadingFile, ...this.filePickerError };

          return [];
        })
      )
      .subscribe((accounts) => {
        this._updateAccounts(accounts);
        this.uploadingFile = { ...this.uploadingFile, ...this.filePickerSuccess };
      });
  }

  private _fetchUserAccounts(dealerEmployeeDict: DealerEmployeeDict): Observable<AccountUserResponse[]> {
    return this._userAdminApiService.getUsersByEmail$(dealerEmployeeDict).pipe(
      untilDestroyed(this),
      map((accountsUsersResponse: StandardResponse<AccountUserResponse[]>): AccountUserResponse[] => {
        const responseData: AccountUserResponse[] = accountsUsersResponse.error
          ? ([] as AccountUserResponse[])
          : (accountsUsersResponse.data as AccountUserResponse[]);
        const responseEmails: Set<string> = new Set(responseData.map((account: AccountUserResponse) => account.emailAddress?.toLowerCase()));
        const missingEmployees: AccountUserResponse[] = [];

        for (const dealerId in dealerEmployeeDict) {
          if (Object.prototype.hasOwnProperty.call(dealerEmployeeDict, dealerId)) {
            dealerEmployeeDict[dealerId].forEach((emailAddress) => {
              if (!responseEmails.has(emailAddress.toLowerCase())) {
                missingEmployees.push({
                  emailAddress,
                  dealers: [{ dealerId }],
                } as AccountUserResponse);
              }
            });
          }
        }

        return [...responseData, ...missingEmployees];
      })
    );
  }

  private _convertToDealerEmployeeDict(dealerEmployees: DealerEmployeeEntity[]): DealerEmployeeDict {
    return dealerEmployees.reduce((acc: DealerEmployeeDict, { dealerId, emailAddress }) => {
      if (!acc[dealerId]) {
        acc[dealerId] = [];
      }
      acc[dealerId].push(emailAddress);

      return acc;
    }, {} as DealerEmployeeDict);
  }

  private _updateAccounts(accounts: AccountUserResponse[]): void {
    const newAccounts = accounts.map((account: AccountUserResponse) => new UserAccountListingVm(account)) ?? [];
    const existingAccounts = this.allAccountsSubject.getValue();
    const mergedAccounts = this.mergeAccounts(existingAccounts, newAccounts);
    this.allAccountsSubject.next(mergedAccounts);
  }

  /**
   * Initializes form control variables for user targets.
   */
  private _getFormControls(): void {
    this.userTargetsFormGroup = this._rootFormGroup.control.controls['userTargets'] as FormGroup;

    this.departmentOptionsFormGroup = this.userTargetsFormGroup.get('departmentOptions') as FormGroup;

    this.staffRoleOptionsFormGroup = this.userTargetsFormGroup.get('staffRoleOptions') as FormGroup;

    this.serviceStaffRoleOptionsFormGroup = this.userTargetsFormGroup.get('serviceStaffRoleOptions') as FormGroup;
  }

  /**
   * Fetches form data and initializes options for various selections.
   */
  private _getFormData(): void {
    this._coreService
      .getCoreData$({ departments: true, staffRoles: true, serviceStaffRoles: true })
      .pipe(untilDestroyed(this))
      .subscribe((coreData) => {
        this._getDepartmentOptions(coreData.departments);
        this._getStaffRoleOptions(coreData.staffRoles);
        this._getServiceStaffRoleOptions(coreData.serviceStaffRoles);
        this._getSecurityOrAppPermissionsOptions();

        this.userTargetsFormGroup.setValidators(this._atLeastOneUserTargetSelectedValidator());
        this.userTargetsFormGroup.updateValueAndValidity();
        this._changeDetectorRef.detectChanges();
      });
  }

  /**
   * Retrieves department options and sets up form controls for them.
   * @param departmentData Array of department data.
   */
  private _getDepartmentOptions(departmentData: Department[]): void {
    const selectedDepartments = new Set(this.communication?.departments?.map((department: CommunicationCode) => department.code));

    for (const department of departmentData) {
      this.departmentOptionsFormGroup.addControl(
        department.id,
        this._formBuilder.control(selectedDepartments.has(department.id))
      );
    }

    this.departmentOptions = departmentData.map((department: Department) => {
      return new PolarisGroupOption<string>({
        label: department.name,
        value: department.id,
        formControlName: department.id,
      });
    });
  }

  /**
   * Retrieves staff role options and sets up form controls for them.
   * @param staffRoleData Array of staff role data.
   */
  private _getStaffRoleOptions(staffRoleData: StaffRole[]): void {
    const selectedStaffRoles = new Set(this.communication?.roles?.map((staffRole: CommunicationCode): string => staffRole.code));

    for (const staffRole of staffRoleData) {
      this.staffRoleOptionsFormGroup.addControl(
        staffRole.id,
        this._formBuilder.control(selectedStaffRoles.has(staffRole.id))
      );
    }

    this.staffRoleOptions = staffRoleData.map((staffRole: StaffRole) => {
      return new PolarisGroupOption<string>({
        label: staffRole.name,
        value: staffRole.id,
        formControlName: staffRole.id,
      });
    });
  }

  /**
   * Retrieves service staff role options and sets up form controls for them.
   * @param serviceStaffRoleData Array of service staff role data.
   */
  private _getServiceStaffRoleOptions(serviceStaffRoleData: ServiceStaffRole[]): void {
    const selectedServiceStaffRoles = new Set(
      this.communication?.serviceStaffRoles?.map((serviceStaffRole: CommunicationCode): string => serviceStaffRole.code)
    );

    for (const serviceStaffRole of serviceStaffRoleData) {
      this.serviceStaffRoleOptionsFormGroup.addControl(
        serviceStaffRole.id,
        this._formBuilder.control(selectedServiceStaffRoles.has(serviceStaffRole.id))
      );
    }

    this.serviceStaffRoleOptions = serviceStaffRoleData.map((serviceStaffRole: ServiceStaffRole) => {
      return new PolarisGroupOption<string>({
        label: serviceStaffRole.name,
        value: serviceStaffRole.id,
        formControlName: serviceStaffRole.id,
      });
    });
  }

  /**
   * Retrieves security or app permissions options and sets up form controls for them.
   */
  private _getSecurityOrAppPermissionsOptions(): void {
    this._dealerPortalApiService.fetchAvailableMenus$().pipe(untilDestroyed(this))
      .subscribe((portalPages: PortalPageEntity[]) => {
        this._portalPages = portalPages;
        const groupedPages = this._groupPortalPagesByCategory(portalPages);
        this._securityOrAppPermissionsOptionsSubject.next(this._convertToSearchResults(groupedPages));
        this._loadCommunicationSecurityAppPermissions();
      });
  }

/**
 * Groups portal pages for easy construction of the search-bar hierarchy.
 *
 * @param portalPages A list of Optimizely page objects
 * @returns The pages grouped by category
 */
  private _groupPortalPagesByCategory(portalPages: PortalPageEntity[]): { [key: string]: PortalPageEntity[] } {
    return portalPages.reduce((accumulator, page) => {
      const category = page.category || 'Uncategorized';
      if (!accumulator[category]) {
        accumulator[category] = [];
      }
      accumulator[category].push(page);

      return accumulator;
    }, {} as { [key: string]: PortalPageEntity[] });
  }

/**
 * Builds the search-bar hierarchy from the grouped pages.
 *
 * @param groupedPages Maps category names to their respective pages
 * @returns The list of search-bar category results
 */
  private _convertToSearchResults(groupedPages: { [key: string]: PortalPageEntity[] }): PolarisSearchBarCategoryResult<string>[] {
    return Object.keys(groupedPages).map((category: string) => {
      return new PolarisSearchBarCategoryResult<string>({
        category,
        options: groupedPages[category]
          .map(page => new PolarisSearchBarResult<string>({
            id: `portal-page-${page.contentId}`,
            label: page.name,
            value: page.name
          }))

          // TODO: This duplicate filtering can be removed once Opti. menu display names are corrected.
          .filter((searchResult: PolarisSearchBarResult<string>, index: number, self: PolarisSearchBarResult<string>[]) => self.findIndex((result: PolarisSearchBarResult<string>) => result.value === searchResult.value) === index)
      });
    });
  }

  private _loadCommunicationSecurityAppPermissions(): void {
    if (this.communication?.applications) {
      const selectedApps = this.communication.applications.map((application: CommunicationApplication) => application.applicationName);
      if (selectedApps.length > 0) {
        this.userTargetsFormGroup.get('securityOrAppPermissionsOptions')?.setValue(selectedApps);
        const selectionApplied = this._securityOrAppPermissionsOptionsSubject.getValue().map((categoryResult: PolarisSearchBarCategoryResult<string>) =>
        ({
          ...categoryResult,
          options: categoryResult.options.map((option: PolarisSearchBarResult<string>) => ({ ...option, selected: selectedApps.includes(option.value) }))
        })
        );
        this._securityOrAppPermissionsOptionsSubject.next(selectionApplied);
        this.userTargetsFormGroup.get('securityOrAppPermissionsSelected')?.setValue(true);
      }
    }

    this.isLoadingSecurityOrAppPermissions = false;
    this.loadingChange.emit(this.isLoading);
  }

  /**
   * Converts portal pages to application entities.
   *
   * @param pages
   * @returns
   */
  private _convertToApplicationEntities(pages: PortalPageEntity[]): CommunicationApplication[] {
    return pages.map((page: PortalPageEntity): CommunicationApplication => ({
      pageId: page.contentId,
      applicationName: page.name,
      applicationCategory: page.category
    } as CommunicationApplication));
  }

  /**
   * Checks if a form control is selected.
   * @param formControlName Name of the form control.
   * @returns True if selected, otherwise false.
   */
  private _isControlSelected(formControlName: string): boolean {
    return this.userTargetsFormGroup.get(formControlName)?.value ?? false;
  }

  private _readUserListFile(file: File): Observable<DealerEmployeeEntity[]> {
    const reader = new FileReader();

    const fileRead$ = fromEvent(reader, 'load').pipe(
      map(() => {
        const content = reader.result as string;
        const delimiters = [',', '\t', ';', '|'];
        let rows: string[][] = [];

        // Since a CSV file may have different delimiters, try each until a row is successfully split.
        for (const delimiter of delimiters) {
          rows = content.split('\n').map((row) => row.split(delimiter).map((cell) => cell.trim()));
          if (rows[0].length > 1) {
            break;
          }
        }

        const [dealerIdHeader, userEmailHeader] = rows[0];
        if (dealerIdHeader?.toLowerCase() !== 'dealerid' || userEmailHeader?.toLowerCase() !== 'useremail') {
          this._notificationService.danger(this._translate.instant('specific-accounts.upload-errors.invalid-header'));
          throw new Error();
        }

        return rows
          .slice(1)
          .map((row) => ({
            dealerId: row[0],
            emailAddress: row[1],
          }))
          .filter((row) => row.dealerId && row.emailAddress) as DealerEmployeeEntity[];
      })
    );

    reader.readAsText(file);

    return fileRead$;
  }

  /**
   * Validator function to ensure at least one user target is selected.
   * @returns Validation errors if no user target is selected, otherwise null.
   */
  private _atLeastOneUserTargetSelectedValidator(): ValidatorFn {
    return (): ValidationErrors | null => {
      let isAnySelected = false;
      if (this.isAnyOptionalGeneralTargetSelected) {
        if (this.isDepartmentSelected) {
          isAnySelected = Object.values(this.departmentOptionsFormGroup.value).some((selected) => selected as boolean);

          if (!isAnySelected) {
            return { noDepartmentSelection: true };
          }
        }

        if (this.isRoleSelected) {
          isAnySelected = Object.values(this.staffRoleOptionsFormGroup.value).some((selected) => selected as boolean);

          if (!isAnySelected) {
            return { noStaffRoleSelection: true };
          }
        }

        if (this.isSecurityOrAppPermissionsSelected) {
          isAnySelected = this.userTargetsFormGroup.get('securityOrAppPermissionsOptions')?.value?.length > 0;

          if (!isAnySelected) {
            return { noSecurityOrAppPermissionsSelection: true };
          }
        }

        if (this.isServiceStaffRoleSelected) {
          isAnySelected = Object.values(this.serviceStaffRoleOptionsFormGroup.value).some(
            (selected) => selected as boolean
          );

          if (!isAnySelected) {
            return { noServiceStaffRoleSelection: true };
          }
        }
      } else if (this.isSpecificAccountsSelected) {
        isAnySelected = this.userTargetsFormGroup.get('specificAccountOptions')?.value?.length > 0;
        if (!isAnySelected) {
          return { noSpecificAccountSelection: true };
        }
      }
      this._changeDetectorRef.detectChanges();

      return null;
    };
  }

  public get isAnyOptionalGeneralTargetSelected(): boolean {
    return (
      this.isDepartmentSelected ||
      this.isRoleSelected ||
      this.isServiceStaffRoleSelected ||
      this.isSecurityOrAppPermissionsSelected
    );
  }

  /**
   * Checks if the department option is selected.
   * @returns True if selected, otherwise false.
   */
  public get isDepartmentSelected(): boolean {
    return this._isControlSelected('departmentSelected');
  }

  /**
   * Checks if the role option is selected.
   * @returns True if selected, otherwise false.
   */
  public get isRoleSelected(): boolean {
    return this._isControlSelected('staffRoleSelected');
  }

  /**
   * Checks if the service staff role option is selected.
   * @returns True if selected, otherwise false.
   */
  public get isServiceStaffRoleSelected(): boolean {
    return this._isControlSelected('serviceStaffRoleSelected');
  }

  /**
   * Checks if the security or app permissions option is selected.
   * @returns True if selected, otherwise false.
   */
  public get isSecurityOrAppPermissionsSelected(): boolean {
    return this._isControlSelected('securityOrAppPermissionsSelected');
  }

  public get isSpecificAccountsSelected(): boolean {
    return this._isControlSelected('specificAccountSelected');
  }

  public get isLoading(): boolean {
    return this.isLoadingCommunicationAccounts || this.isLoadingSecurityOrAppPermissions;
  }
}
