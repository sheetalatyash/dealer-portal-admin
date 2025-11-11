import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
  PolarisCheckbox,
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
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  AccountApiService,
  AccountEntity,
  AccountFilterArguments,
  CommunicationAccount,
  Communication,
  CommunicationCode,
  CoreService,
  Country,
  CustomerClass,
  PartnerType,
  SalesHierarchyApiService,
  StateProvince,
  CoreData,
  ProductLineByBusinessUnit,
  ProductLine,
  SalesTerritory,
  StandardResponse,
  GraphQLEdge,
  GetSalesTerritoriesResponse,
  GraphQLError,
  GetAccountsByFileResponse,
  GetAccountsResponse,
  PartnerTypeId,
} from '@dealer-portal/polaris-core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscriber,
  catchError,
  debounceTime,
  exhaustMap,
  map,
  of,
  scan,
  startWith,
  switchMap,
  takeWhile,
  tap,
} from 'rxjs';
import { CommunicationAddEditTargetsComponent } from '../../_components/communication-add-edit-targets/communication-add-edit-targets.component';
import { DealerAccountListingVm } from '../../../../_view_models/dealer-account-listing.vm';
import { CommunicationAddEditTargetsBase } from '@classes/communication-add-edit-targets-base.class';
import { CustomerClassId } from '@enums';

@UntilDestroy()
@Component({
  selector: 'ca-communication-add-edit-account-targets',
  imports: [
    CommonModule,
    PolarisCheckboxGroup,
    PolarisSearchBar,
    TranslatePipe,
    CommunicationAddEditTargetsComponent,
    PolarisCheckbox,
    PolarisSearchBar,
  ],
  templateUrl: './communication-add-edit-account-targets.component.html',
  styleUrl: './communication-add-edit-account-targets.component.scss',
})
export class CommunicationAddEditAccountTargetsComponent extends CommunicationAddEditTargetsBase implements OnInit {
  // Inputs
  @Input() communication?: Communication;

  // Outputs
  @Output() loadingChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Loading States
  public isLoadingCoreData: boolean = false;
  public isLoadingAccountData: boolean = false;
  public isLoadingPartnerTypeData: boolean = false;
  public isLoadingTerritorySelection: boolean = false;

  // Partner Types
  public partnerTypeSelection = this.createGroupOption('partnerTypeSelected', 'option.partner-type', true);
  public partnerTypeOptionsFormGroup!: FormGroup;
  public partnerTypeOptions: PolarisGroupOption<string>[] = [];
  public parentAccountsFormGroup!: FormGroup;
  private _searchTextSubjects: Map<string | number, BehaviorSubject<string>> = new Map();
  private _nextPageSubjects: Map<string | number, Subject<void>> = new Map();
  private _partnerTypeObservables: Map<string | number, BehaviorSubject<PolarisSearchBarResult<string>[]>> = new Map();
  public partnerTypeSearchDebounceTimeMs = 300;

  // Product Lines
  public productLineSelection = this.createGroupOption('productLineSelected', 'option.product-lines');
  public productLineOptionsFormGroup!: FormGroup;
  public productLineSelectAllOption: PolarisGroupOption<string> = new PolarisGroupOption<string>({
    label: this._translate.instant('select-all'),
    formControlName: 'productLinesSelectAll',
  });
  public productLineOptions: PolarisGroupOption<string>[][] = [];

  // Customer Classes
  public customerClassSelection = this.createGroupOption('customerClassSelected', 'option.customer-class', true);
  public customerClassOptionsFormGroup!: FormGroup;
  public customerClassOptions: PolarisGroupOption<string>[][] = [];
  private _priorityCustomerClassIds: CustomerClassId[] = [
    CustomerClassId.Dealer,
    CustomerClassId.Canadian,
    CustomerClassId.International,
  ];

  // Sales Territory
  public salesTerritoryOrRegionSelection = this.createGroupOption(
    'salesTerritoryOrRegionSelected',
    'option.sales-territory',
    true,
  );
  public salesTerritoryOptionsFormControl!: FormControl;
  public territorySearchResultsSubject: BehaviorSubject<PolarisSearchBarResult<string>[]> = new BehaviorSubject<
    PolarisSearchBarResult<string>[]
  >([]);
  public territorySearchResults$: Observable<PolarisSearchBarResult<string>[]> =
    this.territorySearchResultsSubject.asObservable();
  public territorySearchTextSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public territoryNextPageSubject: Subject<void> = new Subject<void>();
  public territorySearchDebounceTimeMs = 300;

  // Country
  public countrySelection = this.createGroupOption('countrySelected', 'option.country', true);
  public countryOptionsFormControl!: FormControl;
  public countryOptions: PolarisSearchBarResult<string>[] = [];
  public countryOptionsFilterFn!: (
    countries: PolarisSearchBarCategoryResult<string>[],
    searchText: string,
  ) => PolarisSearchBarCategoryResult<string>[];

  // State or Province
  public stateOrProvinceSelection = this.createGroupOption('stateOrProvinceSelected', 'option.state-province', true);
  public stateOrProvinceOptionsFormControl!: FormControl;
  public stateOrProvinceOptions: PolarisSearchBarResult<string>[] = [];
  public stateOrProvinceOptionsFilterFn!: (
    stateOrProvinces: PolarisSearchBarCategoryResult<string>[],
    searchText: string,
  ) => PolarisSearchBarCategoryResult<string>[];

  // Specific Accounts
  public accountTargetsFormGroup!: FormGroup;
  public filePickerFormControl = new FormControl();

  public accountsTableColumns: PolarisTableColumnConfig<DealerAccountListingVm>[] = [
    this.createColumnConfig('dealerNumber', 'table.col.dealer-number'),
    this.createColumnConfig('name', 'table.col.account-name'),
    this.createColumnConfig('city', 'table.col.city'),
    this.createColumnConfig('stateOrProvince', 'table.col.state-or-province'),
    this.createColumnConfig('status', 'table.col.status'),
  ];

  public allAccountsSubject: BehaviorSubject<DealerAccountListingVm[]> = new BehaviorSubject<DealerAccountListingVm[]>(
    [],
  );
  public allAccounts$: Observable<DealerAccountListingVm[]> = this.allAccountsSubject.asObservable();
  public isAtLeastOneAccountTargetSelected = false;
  public uploadingFile?: PolarisFilePickerFile;

  constructor(
    private _accountApiService: AccountApiService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _coreService: CoreService,
    private _rootFormGroup: FormGroupDirective,
    private _formBuilder: FormBuilder,
    private _salesHierarchyApiService: SalesHierarchyApiService,
    protected override _polarisDialogService: PolarisDialogService,
    protected override _notificationService: PolarisNotificationService,
    protected override _translate: TranslateService,
  ) {
    super(_polarisDialogService, _notificationService, _translate);
  }

  public ngOnInit(): void {
    this._initializeFormGroups();
    this._setupCustomerClassSelectedSubscription();
    this.isLoadingCoreData = true;
    this.loadingChange.emit(this.isLoading);
    this._coreService
      .getCoreData$({
        partnerTypes: true,
        productLineByBusinessUnit: true,
        customerClasses: true,
        countries: true,
        stateAndProvinces: true,
      })
      .pipe(untilDestroyed(this))
      .subscribe((coreData: CoreData) => {
        this._initializeCoreData(coreData);
        this._setupPartnerTypeSelectedSubscription();
        this._setupTerritorySelectedSubscription();
        this._setAccountTargetsValidator();
      });

    this.initializeFormGroup(this.accountTargetsFormGroup, this.allAccounts$);
    this._fetchCommunicationSpecificAccounts();
  }

  private _initializeFormGroups(): void {
    this.accountTargetsFormGroup = this._rootFormGroup.control.controls['accountTargets'] as FormGroup;
    this.partnerTypeOptionsFormGroup = this.accountTargetsFormGroup.get('partnerTypeOptions') as FormGroup;
    this.productLineOptionsFormGroup = this.accountTargetsFormGroup.get('productLineOptions') as FormGroup;
    this.customerClassOptionsFormGroup = this.accountTargetsFormGroup.get('customerClassOptions') as FormGroup;
    this.parentAccountsFormGroup = this.accountTargetsFormGroup.get('parentAccountsOptions') as FormGroup;
    this.salesTerritoryOptionsFormControl = this.accountTargetsFormGroup.get(
      'salesTerritoryOrRegionOptions',
    ) as FormControl;
    this.countryOptionsFormControl = this.accountTargetsFormGroup.get('countryOptions') as FormControl;
    this.stateOrProvinceOptionsFormControl = this.accountTargetsFormGroup.get('stateOrProvinceOptions') as FormControl;
  }

  private _initializeCoreData(coreData: CoreData): void {
    this._getPartnerTypeOptions(coreData.partnerTypes);
    this._getProductLineOptions(coreData.productLinesByBusinessUnit);
    this._getCustomerClassOptions(coreData.customerClasses);
    this._getCountryOptions(coreData.countries);
    this._getStateOrProvinceOptions(coreData.stateProvinces);
    this._initializeSearchSubjects(coreData.partnerTypes);
    this._fetchCommunicationParentAccounts();
    this._fetchCommunicationTerritories();
    this.isLoadingCoreData = false;
    this.loadingChange.emit(this.isLoading);
  }

  private _setupPartnerTypeSelectedSubscription(): void {
    const partnerTypeSelectedControl = this.accountTargetsFormGroup.get('partnerTypeSelected');
    if (!partnerTypeSelectedControl) {
      return;
    }

    partnerTypeSelectedControl.valueChanges.pipe(untilDestroyed(this)).subscribe((selected: boolean) => {
      if (!selected) {
        const controls = this.partnerTypeOptionsFormGroup.controls;
        Object.keys(controls).forEach((key) => {
          if (controls[key].value) {
            controls[key].setValue(false, { emitEvent: false });
          }
        });
        this.partnerTypeOptionsFormGroup.updateValueAndValidity({ onlySelf: true });
      }
    });
  }

  private _setupTerritorySelectedSubscription(): void {
    const territorySelectedControl = this.accountTargetsFormGroup.get('salesTerritoryOrRegionSelected');
    if (!territorySelectedControl) {
      return;
    }

    territorySelectedControl.valueChanges.pipe(untilDestroyed(this)).subscribe((selected: boolean) => {
      if (!selected) {
        const currentTerritories = this.territorySearchResultsSubject.getValue();
        if (currentTerritories.some((result) => result.selected)) {
          const updatedTerritories = currentTerritories.map((result) => ({
            ...result,
            selected: false,
          }));
          this.territorySearchResultsSubject.next(updatedTerritories);
          this._changeDetectorRef.detectChanges();
        }
      }
    });
  }

  private _setupCustomerClassSelectedSubscription(): void {
    const customerClassSelectedControl = this.accountTargetsFormGroup.get('customerClassSelected');
    if (customerClassSelectedControl) {
      customerClassSelectedControl.valueChanges.pipe(untilDestroyed(this)).subscribe((selected: boolean) => {
        if (selected) {
          this._reselectDefaultCustomerClasses();
        } else {
          this._resetAllCustomerClasses();
        }
      });
    }
  }

  private _reselectDefaultCustomerClasses(): void {
    const formGroup = this.customerClassOptionsFormGroup;
    const controlValues = formGroup.value;
    const hasAnySelected = Object.keys(controlValues)
      .filter((id: string) => id !== 'customerClassSelectAll')
      .some((id: string) => controlValues[id]);

    if (!hasAnySelected) {
      this._priorityCustomerClassIds.forEach((id: CustomerClassId) => {
        if (formGroup.get(id)) {
          formGroup.get(id)?.setValue(true, { emitEvent: false });
        }
      });
      formGroup.updateValueAndValidity({ onlySelf: true });
      this._changeDetectorRef.detectChanges();
    }
  }

  private _resetAllCustomerClasses(): void {
    const formGroup = this.customerClassOptionsFormGroup;
    Object.keys(formGroup.controls).forEach((id: string) => {
      formGroup.get(id)?.setValue(false, { emitEvent: false });
    });

    formGroup.updateValueAndValidity({ onlySelf: true });
    this._changeDetectorRef.detectChanges();
  }

  private _setAccountTargetsValidator(): void {
    this.accountTargetsFormGroup.setValidators(this._atLeastOneAccountTargetSelectedValidator());
    this.accountTargetsFormGroup.updateValueAndValidity();
    this._changeDetectorRef.detectChanges();
  }

  public onFileSelected(files: File[]): void {
    if (this.handleFilePickerErrors(this.filePickerFormControl)) {
      return;
    }

    if (files?.length > 0) {
      this.isLoadingAccountData = true;
      this.loadingChange.emit(this.isLoading);

      const file = files[0];
      this.uploadingFile = { ...this.filePickerUploading, name: file.name };
      this._accountApiService
        .getAccountsByFile$(file)
        .pipe(
          untilDestroyed(this),
          tap((result: StandardResponse<GetAccountsByFileResponse>) => {
            if (result.error && result.error instanceof GraphQLError) {
              throw new Error(result.error.errors.map((error) => error.message).join(','));
            } else {
              const newAccounts =
                result.data?.uploadAccountFile?.map((account) => new DealerAccountListingVm(account)) ?? [];
              const existingAccounts = this.allAccountsSubject.getValue();
              const mergedAccounts = this.mergeAccounts(existingAccounts, newAccounts);
              this.allAccountsSubject.next(mergedAccounts);
              this.uploadingFile = { ...this.uploadingFile, ...this.filePickerSuccess };
            }
          }),
          catchError((error: { message?: string }) => {
            this._notificationService.danger(error.message ?? this._translate.instant('generic-upload-error'));
            this.uploadingFile = { ...this.uploadingFile, ...this.filePickerError };
            this.isLoadingAccountData = false;
            this.loadingChange.emit(this.isLoading);

            return [];
          }),
        )
        .subscribe(() => {
          this.isLoadingAccountData = false;
          this.loadingChange.emit(this.isLoading);
        });
    }
  }

  public onFileCanceled(file: PolarisFilePickerFile): void {
    if (file.status !== PolarisFilePickerStatus.Uploading) {
      this.uploadingFile = undefined;
    }
  }

  public onPartnerTypeSearch(partnerType: string | number, searchText: string): void {
    const searchTextSubject = this._searchTextSubjects.get(partnerType);
    if (searchTextSubject) {
      searchTextSubject.next(searchText);
    }
  }

  public onPartnerTypeScroll(partnerType: string | number): void {
    const nextPageSubject = this._nextPageSubjects.get(partnerType);
    if (nextPageSubject) {
      nextPageSubject.next();
    }
  }

  public onTerritorySearch(searchText: string): void {
    this.territorySearchTextSubject.next(searchText);
  }

  public onTerritoryScroll(): void {
    this.territoryNextPageSubject.next();
  }

  public getFormControl(formGroup: FormGroup, controlName: string): FormControl {
    return formGroup.controls[controlName] as FormControl;
  }

  public useTooltipAction(controlName: string): boolean {
    return ['Dealer of Distributor', 'Dealer of Subsidiary'].includes(controlName);
  }

  private _deduplicateSearchBarResults(results: PolarisSearchBarResult<string>[]): PolarisSearchBarResult<string>[] {
    const territorySearchResultMap: Map<string, PolarisSearchBarResult<string>> = new Map();
    for (const result of results) {
      if (result.value && !territorySearchResultMap.has(result.value)) {
        territorySearchResultMap.set(result.value, result);
      }
    }

    return Array.from(territorySearchResultMap.values());
  }

  private _mapTerritoryAccountsToSearchBarResults(
    accounts: SalesTerritory[],
    selectedMap?: Map<string, PolarisSearchBarResult<string>>,
    defaultSelected: boolean = false,
  ): PolarisSearchBarResult<string>[] {
    const results: PolarisSearchBarResult<string>[] = [];

    // Preserve already selected items even if not returned in current accounts page
    if (selectedMap) {
      for (const [, existingResult] of selectedMap.entries()) {
        if (existingResult.selected) {
          // Push the existing selected result. Duplicates can occur if a selected item appears in
          // both the preserved selections and the new accounts list; these are removed later via deduplication.
          results.push(
            new PolarisSearchBarResult<string>({
              id: existingResult.id,
              label: existingResult.label,
              value: existingResult.value,
              selected: true,
            }),
          );
        }
      }
    }

    for (const account of accounts) {
      if (!account.territoryName) {
        continue;
      }
      const value: string = account.territoryName;
      const selected: boolean =
        selectedMap && selectedMap.has(value) ? selectedMap.get(value)?.selected ?? false : defaultSelected;
      results.push(
        new PolarisSearchBarResult<string>({
          id: account.territoryName,
          label:
            account.salesUserFirstName && account.salesUserLastName
              ? `${account.territoryName} - ${account.salesUserFirstName} ${account.salesUserLastName}`
              : `${account.territoryName}`,
          value,
          selected,
        }),
      );
    }

    // Sort by id ascending, then deduplicate
    results.sort((a, b) => (a.id ?? '').localeCompare(b.id ?? ''));

    return this._deduplicateSearchBarResults(results);
  }

  private _fetchCommunicationTerritories(): void {
    if (!this.communication?.territories?.length) {
      this._finishTerritoryLoading();
      this._buildTerritorySearchSubscription();

      return;
    }

    this.isLoadingTerritorySelection = true;
    this.loadingChange.emit(this.isLoading);

    const territoryCodes: string[] = this.communication.territories.map(
      (territory: CommunicationCode) => territory.code,
    );
    this.salesTerritoryOptionsFormControl.setValue(territoryCodes.map((code: string) => parseInt(code, 10)));

    this._fetchAllTerritoryAccounts(territoryCodes)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (accounts: SalesTerritory[]) => {
          const dedupedResults: PolarisSearchBarResult<string>[] = this._mapTerritoryAccountsToSearchBarResults(
            accounts,
            undefined,
            true,
          );
          this.territorySearchResultsSubject.next(dedupedResults);
        },
        complete: () => {
          this._buildTerritorySearchSubscription();
        },
      });
  }

  private _fetchAllTerritoryAccounts(territoryCodes: string[]): Observable<SalesTerritory[]> {
    if (!Array.isArray(territoryCodes) || territoryCodes.length === 0) {
      return of([]);
    }

    let continuationToken: string | undefined;

    return new Observable<SalesTerritory[]>((observer: Subscriber<SalesTerritory[]>) => {
      const fetchNext = () => {
        this._salesHierarchyApiService
          .getSalesTerritories$({ territoryCodes, after: continuationToken })
          .pipe(untilDestroyed(this))
          .subscribe((response: StandardResponse<GetSalesTerritoriesResponse>) => {
            const newNodes: SalesTerritory[] = this._extractSalesTerritories(response.data);
            observer.next(newNodes);

            const pageInfo = response?.data?.salesTerritories?.pageInfo;
            continuationToken = pageInfo?.endCursor;

            if (pageInfo?.hasNextPage) {
              fetchNext();
            } else {
              observer.complete();
            }
          });
      };
      fetchNext();
    }).pipe(
      untilDestroyed(this),
      scan<SalesTerritory[], SalesTerritory[]>(
        (accumulator: SalesTerritory[], curr: SalesTerritory[]) => [...accumulator, ...curr],
        [],
      ),
    );
  }

  private _extractSalesTerritories(response?: GetSalesTerritoriesResponse): SalesTerritory[] {
    return response?.salesTerritories?.edges?.map((edge: GraphQLEdge<SalesTerritory>) => edge.node) ?? [];
  }

  private _finishTerritoryLoading(): void {
    this.isLoadingTerritorySelection = false;
    this.loadingChange.emit(this.isLoading);
  }

  private _buildTerritorySearchSubscription(): void {
    this.territorySearchTextSubject
      .pipe(
        debounceTime(this.territorySearchDebounceTimeMs),
        untilDestroyed(this),
        switchMap((searchText: string) => this._searchTerritoryWithPagination(searchText)),
      )
      .subscribe((dedupedResults: PolarisSearchBarResult<string>[] | null) => {
        this.territorySearchResultsSubject.next(dedupedResults ?? []);
        if (this.isLoadingTerritorySelection) {
          this.accountTargetsFormGroup.get('salesTerritoryOrRegionSelected')?.setValue(true);
          this._finishTerritoryLoading();
        }
      });
  }

  private _searchTerritoryWithPagination(searchText: string): Observable<PolarisSearchBarResult<string>[]> {
    let continuationToken: string | undefined;
    let hasNextPage: boolean = true;

    return this.territoryNextPageSubject.pipe(
      untilDestroyed(this),
      startWith(null),
      exhaustMap(() =>
        this._salesHierarchyApiService.getSalesTerritories$({
          searchText,
          after: continuationToken,
        }),
      ),
      map((response: StandardResponse<GetSalesTerritoriesResponse>) => response.data),
      tap((territoriesResponse?: GetSalesTerritoriesResponse) => {
        continuationToken = territoriesResponse?.salesTerritories?.pageInfo?.endCursor;
        hasNextPage = territoriesResponse?.salesTerritories?.pageInfo?.hasNextPage === true;
      }),
      takeWhile(() => hasNextPage, true),
      scan((accumulator: SalesTerritory[], response?: GetSalesTerritoriesResponse) => {
        const newNodes: SalesTerritory[] = this._extractSalesTerritories(response);
        const accIds: Set<string> = new Set(
          accumulator.map((salesTerritory: SalesTerritory) => salesTerritory.territoryName as string),
        );
        const filteredNewNodes: SalesTerritory[] = newNodes.filter(
          (salesTerritory: SalesTerritory) => !accIds.has(salesTerritory.territoryName as string),
        );

        return [...accumulator, ...filteredNewNodes];
      }, []),
      map((accounts: SalesTerritory[]) => {
        const currentResults: PolarisSearchBarResult<string>[] = this.territorySearchResultsSubject.getValue();
        const currentSelectedMap: Map<string, PolarisSearchBarResult<string>> = new Map(
          currentResults
            .filter((searchResult: PolarisSearchBarResult<string>) => searchResult.selected)
            .map((searchResult) => [searchResult.value, searchResult]),
        );

        return this._mapTerritoryAccountsToSearchBarResults(accounts, currentSelectedMap, false);
      }),
    );
  }

  private _fetchCommunicationParentAccounts(): void {
    if (!this.communication?.parentAccounts?.length) {
      this._updatePartnerTypeSelections();
      this.isLoadingPartnerTypeData = false;
      this.loadingChange.emit(this.isLoading);

      return;
    }

    const dealerNumbers: string[] =
      this.communication?.parentAccounts
        ?.map((account: CommunicationAccount): string | undefined => account.number)
        .filter((num: string | undefined): num is string => typeof num === 'string') ?? [];

    this._fetchAllAccounts(dealerNumbers)
      .pipe(untilDestroyed(this))
      .subscribe((accumulatedResults: AccountEntity[]) => {
        if (accumulatedResults.length > 0) {
          this._processParentAccounts(accumulatedResults);
        } else {
          this._updatePartnerTypeSelections();
        }
      });
  }

  private _fetchAllAccounts(dealerNumbers: string[]): Observable<AccountEntity[]> {
    if (!Array.isArray(dealerNumbers) || dealerNumbers.length === 0) {
      return of([]);
    }

    let accumulatedResults: AccountEntity[] = [];
    let continuationToken: string | undefined;

    return new Observable<AccountEntity[]>((observer: Subscriber<AccountEntity[]>) => {
      const fetchNextPage = () => {
        this._accountApiService
          .getAccounts$(
            new AccountFilterArguments({
              dealerNumbers,
              continuationToken,
            }).toGetAccountsVariables(),
          )
          .pipe(untilDestroyed(this))
          .subscribe((response: StandardResponse<GetAccountsResponse>) => {
            const accounts = response.data?.accounts?.nodes ?? [];
            accumulatedResults = [...accumulatedResults, ...accounts];
            continuationToken = response.data?.accounts?.pageInfo?.endCursor;

            if (response.data?.accounts?.pageInfo?.hasNextPage) {
              fetchNextPage();
            } else {
              observer.next(accumulatedResults);
              observer.complete();
            }
          });
      };

      fetchNextPage();
    });
  }

  private _processParentAccounts(accounts: AccountEntity[]): void {
    accounts.forEach((account: AccountEntity) => {
      const partnerTypeKey = this._getFormGroupNameForPartnerType(account.partnerType as string);
      const currentValues = this.parentAccountsFormGroup.get(partnerTypeKey)?.value;
      if (!currentValues.includes(account.dealerNumber)) {
        currentValues.push(account.dealerNumber);
        this.parentAccountsFormGroup.get(partnerTypeKey)?.setValue(currentValues);
      }

      let partnerTypeSubject = this._partnerTypeObservables.get(partnerTypeKey);
      if (!partnerTypeSubject) {
        partnerTypeSubject = new BehaviorSubject<PolarisSearchBarResult<string>[]>([]);
        this._partnerTypeObservables.set(partnerTypeKey, partnerTypeSubject);
      }

      const currentResults = partnerTypeSubject.getValue();
      const currentResult = currentResults.find(
        (searchResult: PolarisSearchBarResult<string>) => searchResult.id === account.dealerNumber,
      );
      if (!currentResult) {
        const updatedResults = [
          ...currentResults,
          new PolarisSearchBarResult<string>({
            id: account.dealerNumber,
            label: account.name,
            value: account.dealerNumber,
            selected: true,
          }),
        ];
        partnerTypeSubject.next(updatedResults);
      } else {
        currentResult.selected = true;
        partnerTypeSubject.next(currentResults);
      }
    });

    this._updatePartnerTypeSelections();
  }

  private _updatePartnerTypeSelections(): void {
    for (const partnerTypeKey of this._partnerTypeObservables.keys()) {
      const isSavedToCommunication = this.communication?.partnerTypes?.some(
        (partnerType: CommunicationCode) => partnerType.code === partnerTypeKey,
      );
      if (isSavedToCommunication) {
        this.partnerTypeOptionsFormGroup
          .get(this._getFormGroupNameForPartnerType(partnerTypeKey as string))
          ?.setValue(true);
      }
    }

    this.accountTargetsFormGroup.get('partnerTypesSelected')?.setValue(true);
    this.isLoadingPartnerTypeData = false;
    this.loadingChange.emit(this.isLoading);
  }

  private _initializeSearchSubjects(partnerTypeData: PartnerType[]): void {
    this.isLoadingPartnerTypeData = true;
    partnerTypeData
      // TODO: Remove this filter when we're ready to populate all partner types
      .filter((partnerType: PartnerType) =>
        ['Dealer of Distributor', 'Dealer of Subsidiary'].includes(partnerType.name),
      )
      .forEach((partnerType: PartnerType) => {
        const searchTextSubject = new BehaviorSubject<string>('');
        const nextPageSubject = new Subject<void>();

        this._searchTextSubjects.set(partnerType.id, searchTextSubject);
        this._nextPageSubjects.set(partnerType.id, nextPageSubject);

        this._buildSearchSubscription(partnerType.id, searchTextSubject, nextPageSubject);
      });
  }

  public getPartnerTypeObservable(partnerType: string | number): Observable<PolarisSearchBarResult<string>[]> {
    return this._partnerTypeObservables.get(partnerType)?.asObservable() ?? of([]);
  }

  public isPartnerTypeConditionMet(key: string): Observable<boolean> {
    const formControl = this.getFormControl(this.partnerTypeOptionsFormGroup, key);
    const option = this.partnerTypeOptions.find((opt) => opt.formControlName === key);

    return formControl.valueChanges.pipe(
      startWith(formControl.value),
      map(
        (value: boolean) =>
          value && (option?.value === 'Dealer of Subsidiary' || option?.value === 'Dealer of Distributor'),
      ),
    );
  }

  private _buildSearchSubscription(
    partnerType: string | number,
    searchText$: BehaviorSubject<string>,
    nextPage$: Subject<void>,
  ): void {
    const partnerTypeSubject = new BehaviorSubject<PolarisSearchBarResult<string>[]>([]);
    this._partnerTypeObservables.set(partnerType, partnerTypeSubject);

    searchText$
      .pipe(
        debounceTime(this.partnerTypeSearchDebounceTimeMs),
        untilDestroyed(this),
        switchMap((searchText: string) => {
          let continuationToken: string | undefined;

          return nextPage$.pipe(
            untilDestroyed(this),
            startWith(null),
            exhaustMap(() =>
              this._accountApiService.getAccounts$(
                new AccountFilterArguments({
                  partnerTypes: [this._getSearchNameForPartnerType(partnerType.toString())],
                  accountNameOrNumber: searchText,
                  continuationToken,
                }).toGetAccountsVariables(),
              ),
            ),
            tap((accountResponse: StandardResponse<GetAccountsResponse>) => {
              continuationToken = accountResponse?.data?.accounts?.pageInfo?.endCursor;
            }),
            takeWhile(
              (accountResponse: StandardResponse<GetAccountsResponse>) =>
                accountResponse?.data?.accounts?.pageInfo?.hasNextPage === true,
              true,
            ),
            scan(
              (acc: AccountEntity[], accountEntityResponse: StandardResponse<GetAccountsResponse>) =>
                acc.concat(accountEntityResponse?.data?.accounts?.nodes ?? []),
              [],
            ),
          );
        }),
      )
      .subscribe((accounts: AccountEntity[]) => {
        partnerTypeSubject.next(
          accounts.map(
            (account: AccountEntity) =>
              new PolarisSearchBarResult({
                id: account.dealerNumber,
                label: account.name,
                value: account.dealerNumber as string,
              }),
          ),
        );
      });
  }

  /**
   * Temporary method to map partner type names to form group names.
   *
   * NOTE: Currently, we save all partner type selections to the same communication field (parentAccounts) in the communications API.
   * Since we only save the dealer number of the distributor or subsidiary for Dealer of Distributor/Subsidiary selections, there's not currently
   * a way to tell whether it was selected for the Distributor/Subsidiary target or the Dealer of Distributor/Subsidiary target.
   * For now we will use the dealer of distributor/subsidiary form group for both since those are the only partner types currently implemented.
   * @param partnerType The partner type name.
   */
  private _getFormGroupNameForPartnerType(partnerType: string | number): string {
    switch (partnerType) {
      case 'Dealer':
        return 'Dealer';

      case 'Distributor':
      case 'Dealer of Distributor':
        return 'Dealer of Distributor';

      case 'Subsidiary':
      case 'Dealer of Subsidiary':
        return 'Dealer of Subsidiary';

      default:
        return '';
    }
  }

  /**
   * Temporary method to map partner type names to search field names.
   *
   * NOTE: The dealer of distributor/subsidiary search bars display distributors/subsidiaries instead of their associated dealers.
   * This is used to search to retrieve the correct results when the user types in the searchbox.
   * @param partnerType The partner type name.
   */
  private _getSearchNameForPartnerType(partnerType: string | number): string {
    switch (partnerType) {
      case 'Dealer':
        return 'Dealer';

      case 'Distributor':
      case 'Dealer of Distributor':
        return 'Distributor';

      case 'Subsidiary':
      case 'Dealer of Subsidiary':
        return 'Subsidiary';

      default:
        return '';
    }
  }

  /**
   * Retrieves partner type options and sets up form controls for them.
   * @param partnerTypeData Array of partner type data.
   */
  private _getPartnerTypeOptions(partnerTypeData: PartnerType[]): void {
    for (const partner of partnerTypeData) {
      this.partnerTypeOptionsFormGroup.addControl(partner.id, this._formBuilder.control(false));
      this.parentAccountsFormGroup.addControl(partner.id, this._formBuilder.control([]));
    }

    this.partnerTypeOptions = partnerTypeData.map((partner: PartnerType) => {
      // Note: The initial selection state for Dealer of Distributor/Subsidiary is managed elsewhere.
      // This is because we need to fetch data from an API before setting the selection state.
      // When we integrate the other partner types with APIs this will likely be removed as well.
      const needsTooltip = ['Dealer of Subsidiary', 'Dealer of Distributor'].includes(partner.id);
      const isSavedToCommunication =
        this.communication?.partnerTypes?.some((partnerType: CommunicationCode) => partnerType.code === partner.id) &&
        !needsTooltip;
      if (isSavedToCommunication) {
        this.partnerTypeOptionsFormGroup.get(partner.id)?.setValue(true);
      }

      return new PolarisGroupOption<string>({
        label: partner.name,
        value: partner.id,
        formControlName: partner.id,
        selected: isSavedToCommunication,
        tooltip: needsTooltip ? 'placeholder' : '',
      });
    });
  }

  private _setupSelectAllCheckbox(formGroup: FormGroup, selectAllOptionId: string): void {
    // Set select all to true if all options are checked
    const optionKeys = Object.keys(formGroup.controls).filter((key: string) => key !== selectAllOptionId);
    const allChecked = optionKeys.every((key) => formGroup.get(key)?.value === true);
    if (allChecked) {
      formGroup.get(selectAllOptionId)?.setValue(true, { emitEvent: false });
    }
    formGroup
      .get(selectAllOptionId)
      ?.valueChanges.pipe(untilDestroyed(this))
      .subscribe((selectAll: boolean) => {
        Object.keys(formGroup.controls).forEach((key: string) => {
          if (key !== selectAllOptionId) {
            formGroup.get(key)?.setValue(selectAll, { emitEvent: false });
          }
        });
        // Ensure the form group updates after bulk change
        formGroup.updateValueAndValidity({ onlySelf: true });
      });

    // When any option changes, update the select all checkbox
    formGroup.valueChanges.pipe(untilDestroyed(this)).subscribe((options) => {
      const keys = Object.keys(options).filter((key: string) => key !== selectAllOptionId);
      const allKeysChecked = keys.every((key: string) => options[key]);
      const selectAllControl = formGroup.get(selectAllOptionId);
      if (selectAllControl?.value !== allKeysChecked) {
        selectAllControl?.setValue(allKeysChecked, { emitEvent: false });
      }
    });
  }

  /**
   * Retrieves product line options and sets up form controls for them.
   * @param productLineData Array of product line data grouped by family.
   */
  private _getProductLineOptions(productLineData: ProductLineByBusinessUnit[]): void {
    const selectedProductLines = new Set(
      this.communication?.productLines?.map((partnerType: CommunicationCode) => partnerType.code),
    );

    for (const businessUnit of productLineData) {
      businessUnit.productLines.sort((productLineA: ProductLine, productLineB: ProductLine) => {
        if (productLineA.defaultSortOrder == null && productLineB.defaultSortOrder == null) {
          return 0;
        }
        if (productLineA.defaultSortOrder == null) {
          return 1;
        }
        if (productLineB.defaultSortOrder == null) {
          return -1;
        }

        return productLineA.defaultSortOrder - productLineB.defaultSortOrder;
      });

      for (const productLine of businessUnit.productLines) {
        this.productLineOptionsFormGroup.addControl(
          productLine.name ?? '',
          this._formBuilder.control(selectedProductLines.has(productLine.name ?? '')),
        );
      }
    }

    // Create an array of product line options grouped by product family to display each family's options in a separate column.
    this.productLineOptions = productLineData.map((businessUnit: ProductLineByBusinessUnit) => {
      return businessUnit.productLines.map((productLine: ProductLine) => {
        return new PolarisGroupOption<string>({
          label: productLine.description,
          value: productLine.name,
          formControlName: productLine.name,
        });
      });
    });

    // Add select all as an option (needs to be separate from the rest of the checkboxes) since we are grouping the product line options.
    const selectAllOptionId = this.productLineSelectAllOption.formControlName;
    this.productLineOptionsFormGroup.addControl(selectAllOptionId, this._formBuilder.control(false));

    this._setupSelectAllCheckbox(this.productLineOptionsFormGroup, selectAllOptionId);
  }

  /**
   * Retrieves customer class options and sets up form controls for them.
   * @param customerClassData Array of customer class data.
   */
  private _getCustomerClassOptions(customerClassData: CustomerClass[]): void {
    const selectedCustomerClasses = new Set(
      this.communication?.custClasses?.map((customerClass: CommunicationCode) => customerClass.code),
    );

    // Add select all as an option to the customer class options.
    const selectAllOptionId = 'customerClassSelectAll';

    // Bring DLR, CND, INT to the top of the list (after select all)
    const priorityCustomerClasses = this._priorityCustomerClassIds
      .map((id: CustomerClassId) => customerClassData.find((customerClass: CustomerClass) => customerClass.id === id))
      .filter((customerClass) => customerClass !== undefined);
    const otherClasses = customerClassData.filter(
      (customerClass: CustomerClass) => !this._priorityCustomerClassIds.includes(customerClass.id as CustomerClassId),
    );

    const options = [
      new CustomerClass({ id: selectAllOptionId, name: this._translate.instant('select-all') }),
      ...priorityCustomerClasses,
      ...otherClasses,
    ];

    for (const customerClass of options) {
      const isSelected = selectedCustomerClasses.has(customerClass.id);
      this.customerClassOptionsFormGroup.addControl(customerClass.id, this._formBuilder.control(isSelected));
    }

    // Setup the select all checkbox to select all customer class options.
    this._setupSelectAllCheckbox(this.customerClassOptionsFormGroup, selectAllOptionId);

    // Split the customer class options into 4 alphabetic columns.
    const partitions = [];
    const optionsToSplit = [...options];
    for (let i = 4; i > 0; i--) {
      partitions.push(optionsToSplit.splice(0, Math.ceil(optionsToSplit.length / i)));
    }

    this.customerClassOptions = partitions.map((customerClassPartition) => {
      return customerClassPartition.map((customerClass) => {
        const label =
          customerClass.id === selectAllOptionId ? customerClass.name : `${customerClass.name} (${customerClass.id})`;

        return new PolarisGroupOption<string>({
          label,
          value: customerClass.id,
          formControlName: customerClass.id,
        });
      });
    });
  }

  /**
   * Retrieves country options and sets up form controls for them.
   * @param countryData Array of country data.
   */
  private _getCountryOptions(countryData: Country[]): void {
    const selectedCountries: Set<string> = new Set(
      this.communication?.countries?.map((country: CommunicationCode) => country.code),
    );
    const uniqueCountries: Country[] = Array.from(
      countryData
        .reduce(
          (countryCodeMap: Map<string, Country>, country: Country) => countryCodeMap.set(country.code, country),
          new Map<string, Country>(),
        )
        .values(),
    );

    this.countryOptionsFilterFn = (
      countryResults: PolarisSearchBarCategoryResult<string>[],
      searchText: string,
    ): PolarisSearchBarCategoryResult<string>[] => {
      let displayedResults: PolarisSearchBarCategoryResult<string>[] = [];
      for (const category of countryResults) {
        const countries = category.options.filter((country: PolarisSearchBarResult<string>) =>
          country.label.toLowerCase().includes(searchText.toLowerCase()),
        );
        displayedResults = [...displayedResults, { options: countries, category: category.category }];
      }

      return displayedResults;
    };

    this.countryOptions = uniqueCountries.map((country: Country) => {
      return new PolarisSearchBarResult<string>({
        id: country.code,
        label: country.name,
        value: country.code,
        selected: selectedCountries.has(country.code),
      });
    });
    this.accountTargetsFormGroup.get('countrySelected')?.setValue(selectedCountries.size > 0);
  }

  /**
   * Retrieves state or province options and sets up form controls for them.
   * @param stateOrProvinceData Array of state or province data.
   */
  private _getStateOrProvinceOptions(stateOrProvinceData: StateProvince[]): void {
    const selectedStateOrProvinces: Set<string> = new Set(
      this.communication?.stateOrProvinces?.map((stateProvince: CommunicationCode) => stateProvince.code),
    );
    const uniqueStateOrProvinces: StateProvince[] = Array.from(
      stateOrProvinceData
        .reduce(
          (stateProvinceMap: Map<string, StateProvince>, stateProvince: StateProvince) =>
            stateProvinceMap.set(stateProvince.code as string, stateProvince),
          new Map<string, StateProvince>(),
        )
        .values(),
    );

    this.stateOrProvinceOptionsFilterFn = (
      stateOrProvinces: PolarisSearchBarCategoryResult<string>[],
      searchText: string,
    ): PolarisSearchBarCategoryResult<string>[] => {
      let displayedResults: PolarisSearchBarResult<string>[] = [];
      for (const stateOrProvince of stateOrProvinces) {
        const results = stateOrProvince.options.filter((state) =>
          state.label.toLowerCase().includes(searchText.toLowerCase()),
        );
        displayedResults = [...displayedResults, ...results];
      }

      return [{ options: displayedResults, category: '' }];
    };

    this.stateOrProvinceOptions = uniqueStateOrProvinces.map((stateOrProvince: StateProvince) => {
      return new PolarisSearchBarResult<string>({
        id: stateOrProvince.code,
        label: stateOrProvince.name,
        value: stateOrProvince.code,
        selected: selectedStateOrProvinces.has(stateOrProvince.code ?? ''),
      });
    });
    this.accountTargetsFormGroup.get('stateOrProvinceSelected')?.setValue(selectedStateOrProvinces.size > 0);
  }

  private _fetchCommunicationSpecificAccounts(): void {
    const dealerNumbers: string[] =
      this.communication?.accounts
        ?.map((account: CommunicationAccount) => account.number)
        .filter((num): num is string => typeof num === 'string') ?? [];

    if (dealerNumbers?.length > 0) {
      this.isLoadingAccountData = true;
      this._accountApiService
        .getAccounts$(new AccountFilterArguments({ dealerNumbers }).toGetAccountsVariables(dealerNumbers.length))
        .pipe(
          tap((response) => {
            if (response.data?.accounts?.nodes) {
              const accounts = response.data.accounts?.nodes.map((account) => new DealerAccountListingVm(account));
              this.allAccountsSubject.next(accounts);
              this.accountTargetsFormGroup.get('specificAccountSelected')?.setValue(true);
            }
          }),
          untilDestroyed(this),
        )
        .subscribe(() => {
          this.isLoadingAccountData = false;
          this.loadingChange.emit(this.isLoading);
        });
    }
  }

  /**
   * Validator function to ensure Product Lines is selected and at least one value is chosen.
   * Also checks if other options are selected, and if so, at least one value is chosen for each.
   * @returns Validation errors if requirements are not met, otherwise null.
   */
  private _atLeastOneAccountTargetSelectedValidator(): ValidatorFn {
    return (): ValidationErrors | null => {
      // Product Lines is required
      if (!this.isProductLineSelected) {
        return { noProductLineSelection: true };
      }
      // Check at least one product line value is selected (excluding select all)
      const productLineValues = { ...this.productLineOptionsFormGroup.value };
      delete productLineValues['productLinesSelectAll'];
      const isAnyProductLineSelected = Object.values(productLineValues).some((selected) => selected as boolean);
      if (!isAnyProductLineSelected) {
        return { noProductLineSelection: true };
      }

      // If Partner Type is selected, at least one value must be chosen
      if (this.isPartnerTypeSelected) {
        // If Dealer of Distributor or Dealer of Subsidiary is selected, at least one value must be chosen from the search bar.
        const parentAccountValues = { ...this.parentAccountsFormGroup.value };
        if (
          this.isPartnerTypeDealerOfDistributorSelected &&
          !parentAccountValues[PartnerTypeId.DealerOfDistributor]?.length
        ) {
          return { noPartnerTypeDealerOfDistributorSelection: true };
        }
        if (
          this.isPartnerTypeDealerOfSubsidiarySelected &&
          !parentAccountValues[PartnerTypeId.DealerOfSubsidiary]?.length
        ) {
          return { noPartnerTypeDealerOfSubsidiarySelection: true };
        }

        const partnerTypeValues = { ...this.partnerTypeOptionsFormGroup.value };
        const isAnyPartnerTypeSelected = Object.values(partnerTypeValues).some((selected) => selected as boolean);
        if (!isAnyPartnerTypeSelected) {
          return { noPartnerTypeSelection: true };
        }
      }

      // If Customer Class is selected, at least one value must be chosen (excluding select all)
      if (this.isCustomerClassSelected) {
        const customerClassValues = { ...this.customerClassOptionsFormGroup.value };
        delete customerClassValues['customerClassSelectAll'];
        const isAnyCustomerClassSelected = Object.values(customerClassValues).some((selected) => selected as boolean);
        if (!isAnyCustomerClassSelected) {
          return { noCustomerClassSelection: true };
        }
      }

      // If Sales Territory/Region is selected, at least one value must be chosen
      if (this.isSalesTerritoryOrRegionSelected) {
        const salesTerritoryValues = this.salesTerritoryOptionsFormControl.value;
        if (!salesTerritoryValues || !salesTerritoryValues.length) {
          return { noSalesTerritoryOrRegionSelection: true };
        }
      }

      // If Country is selected, at least one value must be chosen
      if (this.isCountrySelected) {
        const countryValues = this.countryOptionsFormControl.value;
        if (!countryValues || !countryValues.length) {
          return { noCountrySelection: true };
        }
      }

      // If State/Province is selected, at least one value must be chosen
      if (this.isStateOrProvinceSelected) {
        const stateOrProvinceValues = this.stateOrProvinceOptionsFormControl.value;
        if (!stateOrProvinceValues || !stateOrProvinceValues.length) {
          return { noStateOrProvinceSelection: true };
        }
      }

      // If Specific Accounts is selected, at least one must be chosen
      if (this.isSpecificAccountsSelected) {
        const specificAccountValues = this.accountTargetsFormGroup.get('specificAccountOptions')?.value;
        if (!specificAccountValues || !specificAccountValues.length) {
          return { noSpecificAccountSelection: true };
        }
      }

      this._changeDetectorRef.detectChanges();

      return null;
    };
  }

  /**
   * Checks if the partner type option is selected.
   * @returns True if selected, otherwise false.
   */
  public get isPartnerTypeSelected(): boolean {
    return this.accountTargetsFormGroup.get('partnerTypeSelected')?.value ?? false;
  }

  /**
   * Checks if the Dealer of Distributor partner type is selected.
   * @returns True if selected, otherwise false.
   */
  public get isPartnerTypeDealerOfDistributorSelected(): boolean {
    return this.partnerTypeOptionsFormGroup.value[PartnerTypeId.DealerOfDistributor] ?? false;
  }

  /**
   * Checks if the Dealer of Subsidiary partner type is selected.
   * @returns True if selected, otherwise false.
   */
  public get isPartnerTypeDealerOfSubsidiarySelected(): boolean {
    return this.partnerTypeOptionsFormGroup.value[PartnerTypeId.DealerOfSubsidiary] ?? false;
  }

  /**
   * Checks if the product line option is selected.
   * @returns True if selected, otherwise false.
   */
  public get isProductLineSelected(): boolean {
    return this.accountTargetsFormGroup.get('productLineSelected')?.value ?? false;
  }

  /**
   * Checks if the customer class option is selected.
   * @returns True if selected, otherwise false.
   */
  public get isCustomerClassSelected(): boolean {
    return this.accountTargetsFormGroup.get('customerClassSelected')?.value ?? false;
  }

  /**
   * Checks if the sales territory or region option is selected.
   * @returns True if selected, otherwise false.
   */
  public get isSalesTerritoryOrRegionSelected(): boolean {
    return this.accountTargetsFormGroup.get('salesTerritoryOrRegionSelected')?.value ?? false;
  }

  /**
   * Checks if the country option is selected.
   * @returns True if selected, otherwise false.
   */
  public get isCountrySelected(): boolean {
    return this.accountTargetsFormGroup.get('countrySelected')?.value ?? false;
  }

  /**
   * Checks if the state or province option is selected.
   * @returns True if selected, otherwise false.
   */
  public get isStateOrProvinceSelected(): boolean {
    return this.accountTargetsFormGroup.get('stateOrProvinceSelected')?.value ?? false;
  }

  /**
   * Checks if specific accounts option are selected.
   * @returns True if selected, otherwise false.
   */
  public get isSpecificAccountsSelected(): boolean {
    return this.accountTargetsFormGroup.get('specificAccountSelected')?.value ?? false;
  }

  /**
   * Checks if any optional general account target is selected.
   * @returns True if any optional general account target is selected, otherwise false.
   */
  public get isAnyOptionalGeneralTargetSelected(): boolean {
    return (
      this.isPartnerTypeSelected ||
      this.isCustomerClassSelected ||
      this.isSalesTerritoryOrRegionSelected ||
      this.isCountrySelected ||
      this.isStateOrProvinceSelected
    );
  }

  public get isLoading(): boolean {
    return (
      this.isLoadingCoreData ||
      this.isLoadingAccountData ||
      this.isLoadingPartnerTypeData ||
      this.isLoadingTerritorySelection
    );
  }
}
