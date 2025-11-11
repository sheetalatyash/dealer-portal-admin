import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  CountryFilterOptions,
  PartnerTypeFilterOptions,
  ProductFamilyFilterOptions,
  StateProvinceFilterOptions,
  StatusFilterOptions,
} from '@classes';
import { CustomerClassFilterOptions } from '@classes/customer-class-filter-options.class';
import { Status } from '@classes/status.class';
import {
  AccountFilterArguments,
  CoreData,
  CoreDataOptions,
  CoreService,
  Country,
  CustomerClass,
  Environment,
  ENVIRONMENT_CONFIG,
  PartnerType,
  ProductLine,
  ProductLineByFamily,
  StateProvince,
} from '@dealer-portal/polaris-core';
import {
  PolarisButton,
  PolarisCheckbox,
  PolarisGroupOption, PolarisHref,
  PolarisSearchBar,
} from '@dealer-portal/polaris-ui';
import { AccountSearchDefaults, ClassCodeType, ExpansionPanelDataFormat } from '@enums';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AccountFilterService } from '@services/account-filter/account-filter.service';
import { FilterExpansionPanelComponent } from './filter-expansion-panel.component';

@UntilDestroy()
@Component({
  selector: 'as-account-filters',
  imports: [
    FilterExpansionPanelComponent,
    CommonModule,
    PolarisButton,
    PolarisCheckbox,
    PolarisSearchBar,
    ReactiveFormsModule,
    TranslatePipe,
    PolarisHref,
  ],
  templateUrl: './account-filter.component.html',
  styleUrls: ['./account-filter.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AccountFilterComponent implements OnInit {
  private static _defaultCustomerClasses: string[] = [
    ClassCodeType.Dealer,
    ClassCodeType.Adventure,
    ClassCodeType.Fleet,
    ClassCodeType.International,
    ClassCodeType.Canadian,
    ClassCodeType.RegionalSalesManager,
    ClassCodeType.SalesManager,
  ];
  private _isFirstSearchTerm: boolean = true;
  private _useCommonClassCodesKey: string = '';

  public filtersForm!: FormGroup;
  public productsForm!: FormGroup;
  public classFilter?: CustomerClassFilterOptions = new CustomerClassFilterOptions([]);
  public countryFilter?: CountryFilterOptions = new CountryFilterOptions([]);
  public partnerFilter?: PartnerTypeFilterOptions = new PartnerTypeFilterOptions([]);
  public productFamilyFilter?: ProductFamilyFilterOptions = new ProductFamilyFilterOptions([]);
  public stateFilter?: StateProvinceFilterOptions = new StateProvinceFilterOptions([]);

  public statusFilter?: StatusFilterOptions = new StatusFilterOptions([]);
  public title: string = this._translate.instant('title.account-search');
  public isSearchTermTooShort: boolean = false;
  public minimumCharactersMessage: string = this._translate.instant('minimum-chars-message');
  public isFilterEmpty: boolean = true;
  public ExpansionPanelDataFormat = ExpansionPanelDataFormat;
  public searchTerm: string = '';
  public commonClassCodeControl: FormControl = new FormControl(false);
  public useCommonClassCodes: boolean = false;

  constructor(
    @Inject(ENVIRONMENT_CONFIG) environment: Environment,
    private _formBuilder: FormBuilder,
    private readonly _service: CoreService,
    private readonly _filterService: AccountFilterService,
    private readonly _translate: TranslateService,
  ) {
    this.filtersForm = this._formBuilder.group({});
    this.productsForm = this._formBuilder.group({});
    this._useCommonClassCodesKey = `useCommonClassCodes${environment.isProduction ? '' : '-' + environment.environmentName}`;
  }

  public ngOnInit(): void {
    this._loadFilterData();
    this._subscribeToFilterChanges();
  }

  public applyFilter(): void {
    const filters = new AccountFilterArguments();

    this.stateFilter?.options?.forEach((option: PolarisGroupOption<StateProvince>) => {
      if (this.filtersForm.controls[option.value].value && option.data?.code) {
        filters.stateProvinceCodes.push(option.data.code);
      }
    });

    this.countryFilter?.options?.forEach((option: PolarisGroupOption<Country>) => {
      if (this.filtersForm.controls[option.value].value && option.data?.code) {
        filters.countryCodes.push(option.data.code);
      }
    });

    this.classFilter?.options?.forEach((option: PolarisGroupOption<CustomerClass>) => {
      if (this.filtersForm.controls[option.value].value && option.data?.id) {
        filters.customerClasses.push(option.data?.id);
      }
    });

    this.partnerFilter?.options?.forEach((option: PolarisGroupOption<PartnerType>) => {
      if (this.filtersForm.controls[option.value].value && option.data?.name) {
        filters.partnerTypes.push(option.data?.name);
      }
    });

    this.productFamilyFilter?.options?.forEach((option: PolarisGroupOption<ProductLineByFamily>) => {
      option.data?.productLines?.forEach((productLine: ProductLine) => {
        if (
          productLine?.name &&
          this.productsForm.contains(productLine.name) &&
          this.productsForm.controls[productLine.name].value
        ) {
          filters.productLines.push(productLine.name);
        }
      });
    });

    this.statusFilter?.options?.forEach((option: PolarisGroupOption<Status>) => {
      if (this.filtersForm.controls[option.value].value && option.data?.id) {
        filters.statuses.push(option.data?.id);
      }
    });

    this.isFilterEmpty = filters.isEmpty;
    this._filterService.updateFilters(filters);
  }

  public applySearch(searchTerm: string): void {
    this.isSearchTermTooShort = false;

    if (!searchTerm && searchTerm.length === 0) {
      this._filterService.updateSearchTerm(searchTerm);

      return;
    } else if (searchTerm.length < 3) {
      this.isSearchTermTooShort = true;

      return;
    }

    this._filterService.updateSearchTerm(searchTerm, this._isFirstSearchTerm);
    this._isFirstSearchTerm = this._isFirstSearchTerm && searchTerm === AccountSearchDefaults.internalAccount;
  }

  public clearAllFilters(): void {
    // TODO: this is a temporary solution to a bug with clearing the countries and states search bar / options.
    // this will reset the app as requested by Aravind to unblock testing and not spend more time on this issue.
    window.location.reload();

    // this.filtersForm.reset();
    // this.productsForm.reset();
    // this.isFilterEmpty = true;
  }

  public commonClassCodeChange(event: { checked: boolean; }): void {

    this.useCommonClassCodes = event.checked;

    // persist user preference in local storage
    if (window.localStorage) {
      localStorage.setItem(this._useCommonClassCodesKey, this.useCommonClassCodes.toString());
    }

    // update form controls based on user preference
    AccountFilterComponent._defaultCustomerClasses.forEach(element => {
      this.filtersForm.controls[element].setValue(this.useCommonClassCodes);
    });

    this._filterService.applyDefaultFilters(this.useCommonClassCodes ? AccountFilterComponent._defaultCustomerClasses : []);
  }


  private _loadFilterData(): void {

    // retrieve user preference in local storage
    if (window.localStorage) {
      this.useCommonClassCodes = localStorage.getItem(this._useCommonClassCodesKey) === 'true';
      this.commonClassCodeControl.setValue(this.useCommonClassCodes);
    }

    const coreDataNeeded: CoreDataOptions = {
      countries: true,
      partnerTypes: true,
      productLineByFamily: true,
      stateAndProvinces: true,
      customerClasses: true,
    };

    this._service
      .getCoreData$(coreDataNeeded)
      .pipe(untilDestroyed(this))
      .subscribe((coreData: CoreData): void => {
        this.classFilter = new CustomerClassFilterOptions(
          coreData.customerClasses,
          this.useCommonClassCodes ? AccountFilterComponent._defaultCustomerClasses : [],
          this.filtersForm,
        );
        const filteredAndUniqueCountries = this._filterInvalidAndDuplicates<Country>(
          coreData.countries,
          (item: Country) => item.code !== item.name,
          'code',
        );
        this.countryFilter = new CountryFilterOptions(filteredAndUniqueCountries, this.filtersForm);
        this.partnerFilter = new PartnerTypeFilterOptions(coreData.partnerTypes, this.filtersForm);
        this.productFamilyFilter = new ProductFamilyFilterOptions(coreData.productLinesByFamily, this.filtersForm);
        const filteredAndUniqueStateProvinces = this._filterInvalidAndDuplicates<StateProvince>(
          coreData.stateProvinces,
          (item: StateProvince) => item.code !== item.countryCode,
          'code',
        );
        this.stateFilter = new StateProvinceFilterOptions(filteredAndUniqueStateProvinces, this.filtersForm);
        this.statusFilter = new StatusFilterOptions(
          [new Status({ name: this._translate.instant('include-inactive'), id: 'includeInactive' })],
          this.filtersForm,
        );

        // initialize default filters from user preference
        this._filterService.applyDefaultFilters(this.useCommonClassCodes ? AccountFilterComponent._defaultCustomerClasses : []);
      });
  }

  private _filterInvalidAndDuplicates<T>(items: T[], predicate: (item: T) => boolean, key: keyof T): T[] {
    // filter out invalid items
    const filteredList = items.filter(predicate);
    // filter out duplicates
    const uniqueItems = filteredList.filter(
      (item, index, self) => index === self.findIndex((t) => t[key] === item[key]),
    );

    return uniqueItems;
  }

  private _subscribeToFilterChanges(): void {
    // this is needed to set the search term in the search bar when recent accounts is empty
    // and the default account number is set programmatically.
    this._filterService
      .hasChanged$()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          this.searchTerm = this._filterService.searchTerm;
        },
      });
  }
}
