import { Component, OnInit} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup, FormsModule, ReactiveFormsModule, Validators
} from '@angular/forms';
import { SalesUserAccountUserDOS, SalesUserAccountUserRSM, SalesUserAccountUserSLM } from '@classes/sales-account-user.class';
import { SalesAccount } from '@classes/sales-account.class';
import { UserAccount, SalesUserAccount, UserAccountService, GetAccountsForSalesUserOptions } from '@dealer-portal/polaris-core';
import { PolarisDialogService, PolarisGroupOption, PolarisHeading, PolarisIcon, PolarisInput, PolarisLoader, PolarisNotificationService, PolarisSearchBar, PolarisSelect } from '@dealer-portal/polaris-ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, debounceTime, filter, Observable } from 'rxjs';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';
import { SalesAccountTableComponent } from './components/sales-account-table/sales-account-table.component';
import { SalesAccountService } from '@services/sales-account/sales-account.service';
import { AccountUserLevel, isAccountUserLevel } from '@enums/account-user-level.enum';

@UntilDestroy()
@Component({
  selector: 'as-sales-account',
  imports: [
    FormsModule,
    CommonModule,
    PolarisHeading,
    PolarisIcon,
    PolarisLoader,
    PolarisSearchBar,
    PolarisSelect,
    PolarisInput,
    ReactiveFormsModule,
    SalesAccountTableComponent,
    TranslatePipe,
  ],
  templateUrl: './sales-account.component.html',
  styleUrl: './sales-account.component.scss',
})
export class SalesAccountComponent implements OnInit {
  private readonly _delay300ms: number = 300;
  private _userInfo: BehaviorSubject<UserAccount | null> = new BehaviorSubject<UserAccount | null>(null);
  private _dataSubject = new BehaviorSubject<string>('');
  private _searchTerm: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private _searchTerm$: Observable<string | null> = this._searchTerm.asObservable();
  private _rsmUsers: SalesUserAccountUserRSM[] = [];
  private _slmUsers: SalesUserAccountUserSLM[] = [];
  private _rsmSlmUsers: Map<string, string[]> = new Map<string, string[]>();
  private _salesAccounts: BehaviorSubject<SalesAccount[] | null> = new BehaviorSubject<SalesAccount[] | null>(null);
  private _originalSalesAccounts: SalesAccount[] = [];
  private _selectedUsername: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private _salesManagerOptions$: BehaviorSubject<PolarisGroupOption<string>[]> = new BehaviorSubject<PolarisGroupOption<string>[]>([]);
  private _regionSalesManagerUnassigned: string = this._translate.instant('sales-account-view.region-sales-manager-unassigned');
  private _directorOfSalesUnassigned: string = this._translate.instant('sales-account-view.director-of-sales-unassigned');

  public selectedDirectorOfSales: SalesUserAccountUserDOS | null = null;
  public selectedRegionalManager: SalesUserAccountUserRSM | null = null;
  public selectedSalesManager: SalesUserAccountUserSLM | null = null;
  public isRegionalManager: boolean = false;
  public isSalesManager: boolean = false;

  public salesAccountFormGroup!: FormGroup<{
    directorOfSales: FormControl<string | null>;
    regionalManager: FormControl<string | null>;
    salesManager: FormControl<string | null>;
    searchTerm: FormControl<string | null>;
  }>;
  public isLoading: boolean = false;
  public regionalManagerOptions: PolarisGroupOption<string>[] = [];
  public salesManagerOptions: PolarisGroupOption<string>[] = [];

  public salesManagerOptions$: Observable<PolarisGroupOption<string>[] | null> = this._salesManagerOptions$.asObservable();

  public search$ = this._dataSubject.asObservable();
  public title: string = this._translate.instant('sales-account-view.title');
  public account: string = '';
  public accountName: string = '';
  public accountCityState: string = '';
  public userInfo$: Observable<UserAccount | null> = this._userInfo.asObservable();
  public minimumCharactersMessage: string = this._translate.instant('minimum-characters-message');
  public salesAccounts$: Observable<SalesAccount[] | null> = this._salesAccounts.asObservable();
  public selectedUsername$: Observable<string | null> = this._selectedUsername.asObservable();

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _dialogService: PolarisDialogService,
    private readonly _salesAccountService: SalesAccountService,
    private readonly _polarisNotificationService: PolarisNotificationService,
    private readonly _userAccountService: UserAccountService,
    private readonly _translate: TranslateService
  ) {}

  public ngOnInit(): void {

    this._subscribeToSalesHierarchy();
    this._subscribeToSearchTerm();

    this.salesAccountFormGroup = this._formBuilder.group({
      directorOfSales: ['', Validators.required],
      regionalManager: [''],
      salesManager: [''],
      searchTerm: ['', [Validators.minLength(3)]],
    });
  }

  public applySearch(searchTerm: string): void {
    this._searchTerm.next(searchTerm);
  }

  public openHelpDialog(): void {
    this._dialogService.open(HelpDialogComponent);
  }

  public onSelectRegionalManager(username: string): void {

    this.salesManagerOptions = [];
    this._salesManagerOptions$.next(this.salesManagerOptions);

    const rsmUser = this._rsmSlmUsers.get(username);
    if (rsmUser) {
      rsmUser.forEach((user: string) => {
        const foundUser = this._slmUsers.find((slm) => slm.username?.toLowerCase() === user.toLowerCase());
        if (foundUser) {
          this.salesManagerOptions.push(
            new PolarisGroupOption<string>({
              label: `${foundUser.first} ${foundUser.last}`,
              value: foundUser.username,
            })
          );
        }
      });

      this.salesAccountFormGroup.get('searchTerm')?.setValue('');
      this._salesManagerOptions$.next(this.salesManagerOptions);
      this._selectedUsername.next(username);
      this._filterAccounts(username);
    }
  }

  public onSelectSalesManager(username: string): void {

    this._selectedUsername.next(username);
    this._filterAccounts(username);
  }

  private _filterAccounts(value: string): void {
    // the value is a username, account number, or account name; it's an open search in JSON
    const keywords = [value.toLowerCase(), this._selectedUsername?.getValue()?.toLowerCase(), this._searchTerm.getValue()?.toLowerCase()].filter(
      (k): k is string => typeof k === 'string'
    );

    const salesAccounts = this._originalSalesAccounts.filter((accounts: SalesAccount): boolean => {
      const userAsString: string = JSON.stringify(Object.values(accounts)).toLowerCase();
      const includesSearchTerm: boolean = keywords.every((keyword) => userAsString.includes(keyword));

      return includesSearchTerm;
    });

    this._salesAccounts.next(salesAccounts);
  }

  private _subscribeToSalesHierarchy(): void {

    const userAccount = this._userAccountService.userAccount;
    const currentUsername = userAccount?.userName ?? '';
    this.isLoading = true;

    const options : GetAccountsForSalesUserOptions = { salesUserUsername: currentUsername };
    this._salesAccountService
      .getAccountsForSalesByFilters$(options)
      .pipe(untilDestroyed(this))
      .subscribe((salesUserAccounts: SalesUserAccount[]) => {
        if (!salesUserAccounts || salesUserAccounts.length === 0) {
          this._polarisNotificationService.warning(
            this._translate.instant('sales-account-view.sales-user-accounts-not-found')
          );
          this._salesAccounts.next([]);
          this.isLoading = false;

          return;
        }

        const accountMap = new Map<string, SalesAccount>();
        const dosMap = new Map<string, SalesUserAccountUserDOS>();
        const rsmMap = new Map<string, SalesUserAccountUserRSM>();
        const slmMap = new Map<string, SalesUserAccountUserSLM>();
        const currentUserLevel = isAccountUserLevel(salesUserAccounts[0].territoryTypeName);

        salesUserAccounts.forEach((account) => {
          if (account.level3SalesUserDomainUsername) {
            dosMap.set(account.level3SalesUserDomainUsername, new SalesUserAccountUserDOS(account));
          }
          if (account.level2SalesUserDomainUsername) {
            rsmMap.set(account.level2SalesUserDomainUsername, new SalesUserAccountUserRSM(account));
          }
          if (account.level1SalesUserDomainUsername) {
            slmMap.set(account.level1SalesUserDomainUsername, new SalesUserAccountUserSLM(account));
          }

          // assign sales manager to the regional manager
          if (account.level2SalesUserDomainUsername) {
            if (this._rsmSlmUsers.has(account.level2SalesUserDomainUsername)) {
              const updatedAccount = this._rsmSlmUsers.get(account.level2SalesUserDomainUsername);
              if (updatedAccount && account.level1SalesUserDomainUsername) {
                const foundParent = updatedAccount.find(
                  (parent) => parent.toLowerCase() === account.level1SalesUserDomainUsername?.toLowerCase()
                );
                if (!foundParent) {
                  updatedAccount.push(account.level1SalesUserDomainUsername);
                  this._rsmSlmUsers.set(account.level2SalesUserDomainUsername, updatedAccount);
                }
              }
            } else if (account.level2SalesUserDomainUsername !== '' && account.level1SalesUserDomainUsername) {
              this._rsmSlmUsers.set(account.level2SalesUserDomainUsername, [account.level1SalesUserDomainUsername]);
            }
          }

          if (account.accountNumber) {
            accountMap.set(account.accountNumber, new SalesAccount(account));
          }
        });

        // Convert the Map values to an array of unique accounts
        this._rsmUsers = [...new Set(rsmMap.values())];
        this._rsmUsers.sort((a, b) => (a?.first ?? '').localeCompare(b?.first ?? ''));

        this._slmUsers = [...new Set(slmMap.values())];
        this._slmUsers.sort((a, b) => (a?.first ?? '').localeCompare(b?.first ?? ''));

        this._originalSalesAccounts = [...new Set(accountMap.values())];
        this._originalSalesAccounts.sort((a, b) => (a?.accountName ?? '').localeCompare(b?.accountName ?? ''));

        // set the regional manager and sales manager options
        this.regionalManagerOptions = [this._selectOneOption()];
        this._rsmUsers.forEach((user: SalesUserAccountUserRSM) => {
          this.regionalManagerOptions.push(
            new PolarisGroupOption<string>({
              label: `${user.first} ${user.last}`,
              value: user.username,
            })
          );
        });

        this.salesManagerOptions = [this._selectOneOption()];
        this._slmUsers.forEach((user: SalesUserAccountUserSLM) => {
          this.salesManagerOptions.push(
            new PolarisGroupOption<string>({
              label: `${user.first} ${user.last}`,
              value: user.username,
            })
          );
        });

        // set the sales users and accounts
        this._setSelectedUsernamesForDisplay(currentUserLevel, dosMap, rsmMap, slmMap);
        this._selectedUsername.next(currentUsername);
        this._salesAccounts.next(this._originalSalesAccounts);

        this.isLoading = false;
      });
  }

  private _selectOneOption(): PolarisGroupOption<string> {
    return new PolarisGroupOption<string>({
      label: this._translate.instant('sales-account-view.select-one'),
      value: ''
    });
  }

  private _setSelectedUsernamesForDisplay(
    currentUserLevel: AccountUserLevel,
    dosMap: Map<string, SalesUserAccountUserDOS>,
    rsmMap: Map<string, SalesUserAccountUserRSM>,
    slmMap: Map<string, SalesUserAccountUserSLM>
  ): void {

    // get the first user from each map and create a full name to display
    const dos = dosMap?.values()?.next()?.value ?? null;
    const dosName = dos ? `${dos?.first} ${dos?.last}` : this._directorOfSalesUnassigned;
    const rsm = rsmMap?.values()?.next()?.value ?? null;
    const rsmName = rsm ? `${rsm?.first} ${rsm?.last}` : this._regionSalesManagerUnassigned;
    const slm = slmMap?.values()?.next()?.value ?? null;
    const slmName = `${slm?.first} ${slm?.last}`;

    switch (currentUserLevel) {
      case AccountUserLevel.DirectorOfSales:
        this.salesAccountFormGroup.get('directorOfSales')?.setValue(dosName);
        break;
      case AccountUserLevel.RegionalManager:
        this.isRegionalManager = true;
        this.salesAccountFormGroup.get('directorOfSales')?.setValue(dosName);
        this.salesAccountFormGroup.get('regionalManager')?.setValue(rsmName);
        break;
      case AccountUserLevel.SalesManager:
        this.isSalesManager = true;
        this.salesAccountFormGroup.get('directorOfSales')?.setValue(dosName);
        this.salesAccountFormGroup.get('regionalManager')?.setValue(rsmName);
        this.salesAccountFormGroup.get('salesManager')?.setValue(slmName);
        break;
      default:
        break;
    }
  }

  private _subscribeToSearchTerm(): void {

    this._searchTerm$
      .pipe(
        filter((searchTerm: string | null): searchTerm is string => searchTerm !== null),
        debounceTime(this._delay300ms),
        untilDestroyed(this)
      )
      .subscribe((searchTerm) => {
        this._filterAccounts(searchTerm);
      });
  }
}
