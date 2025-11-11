import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, RecentAccount } from '@classes';
import { AccountFilterArguments, StandardResponse, UserAccountSchema, UserAccountService, UserInfoApiService, UserInfoManagementApiService } from '@dealer-portal/polaris-core';
import { PolarisLoader, PolarisNavigationTab, PolarisNotificationService, PolarisTabBar } from '@dealer-portal/polaris-ui';
import { AccountSearchDefaults, SearchListTab, SearchTabId } from '@enums';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AccountFilterService } from '@services/account-filter/account-filter.service';
import { AccountService } from '@services/account/account.service';
import { RecentAccountEntity, RecentlyViewedAccountsEntity, RecentlyViewedParams } from '@types';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AccountListComponent } from '../account-list/account-list.component';
import { RecentListComponent } from '../recent-list/recent-list.component';

@UntilDestroy()
@Component({
    selector: 'as-account-results',
    imports: [
        AccountListComponent,
        CommonModule,
        PolarisLoader,
        PolarisTabBar,
        ReactiveFormsModule,
        RecentListComponent,
        TranslatePipe,
    ],
    templateUrl: './account-results.component.html',
    styleUrl: './account-results.component.scss',
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
    ]
})
export class AccountResultsComponent implements OnInit {
  public readonly accountTabId: string = SearchTabId.Accounts;
  public readonly recentTabId: string = SearchTabId.RecentAccounts;
  public readonly tabs: PolarisNavigationTab[] = this._createTabs();
  public accountCount: number = 0;
  public filteredAccountsLoading: boolean = false;
  public recentAccountsLoading: boolean = false;
  public selectedTab?: PolarisNavigationTab;
  public title: string = 'Account Search';
  public firstSearch: boolean = true;
  private readonly _accountsTab: PolarisNavigationTab = this.tabs[SearchListTab.CurrentAccounts];
  private _accounts: BehaviorSubject<Account[] | null> = new BehaviorSubject<Account[] | null>(null);
  private readonly _recentlyViewedTab: PolarisNavigationTab = this.tabs[SearchListTab.RecentAccounts];
  private _recentAccounts: BehaviorSubject<RecentAccount[] | null> = new BehaviorSubject<RecentAccount[] | null>(null);
  public recentAccounts$: Observable<RecentAccount[] | null> = this._recentAccounts.asObservable();
  public accounts$: Observable<Account[] | null> = this._accounts.asObservable();
  public filteredBy: string = '';

  constructor(
    private readonly _accountService: AccountService,
    private readonly _userAccountService: UserAccountService,
    private readonly _userInfoApiService: UserInfoApiService,
    private readonly _userInfoManagementService: UserInfoManagementApiService,
    private readonly _polarisNotificationService: PolarisNotificationService,
    private readonly _filterService: AccountFilterService,
    private readonly _translate: TranslateService,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute)
   {}

  public ngOnInit(): void {
    this._processAccounts();
    this.tabSelected(this._recentlyViewedTab);
  }

  public onAccountDeleted(recentAccount: RecentAccount): void {

    const params: RecentlyViewedParams = {resource: this._userAccountService.userAccount?.userName ?? ''};

    this._userInfoManagementService.delete$<RecentAccount>("/recentlyviewed", { ...params }, recentAccount)
    .pipe(
      untilDestroyed(this),
    )
    .subscribe({

      next: () => {
        // remove deleted account from UI list
        const currentAccounts = this._recentAccounts.value;
        const updatedAccounts: RecentAccount[] = currentAccounts?.filter((account: RecentAccount) => account.userName !== recentAccount.userName) ?? [];

        if (updatedAccounts?.length > 0) {
          this._recentAccounts.next(updatedAccounts);
          this.accountCount = updatedAccounts.length;
        }
        else {
          this._recentAccounts.next(null);
          this.accountCount = 0;
          this._filterService.updateSearchTerm(AccountSearchDefaults.internalAccount);
        }
      },
      error: () => {
        this._polarisNotificationService.danger(this._translate.instant('errors.not-able-to-delete-recently-viewed'));
      }
    });
  }

  public tabSelected(tab: PolarisNavigationTab): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { tab: tab.id },
      queryParamsHandling: 'merge'
    });
    this.selectedTab = tab;
    this.tabs.forEach((tabItem) => { tabItem.selected = false; });
    tab.selected = true;
    if (tab.id === this.recentTabId) {
      this._loadRecentlyViewedAccounts();
    } else {
      this.accountCount = this._accounts.value?.length ?? 0;
    }
  }

  private _createTabs(): PolarisNavigationTab[] {
    return [
      {
        label: this._translate.instant('account-results-view.tabs.recently-viewed'),
        code: SearchListTab.RecentAccounts,
        id: SearchTabId.RecentAccounts,
        selected: false,
      },
      {
        label:  this._translate.instant('account-results-view.tabs.search-results'),
        code: SearchListTab.CurrentAccounts,
        id: SearchTabId.Accounts,
        selected: false,
      }
    ];
  }

  private _processAccounts(): void {
    this.filteredAccountsLoading = true;

    this._filterService.hasChanged$()
      .pipe(
        untilDestroyed(this),
        tap(() => this.filteredAccountsLoading = true),
        switchMap((filterArgs: AccountFilterArguments) => {
          this.filteredBy = this._filterService.filteredBy;

          return (filterArgs.isEmpty) ? of(null) : this._accountService.getAccountsByFilters$(filterArgs);
      })
      )
      .subscribe({
        next: (accounts: Account[] | null) => {
          if (!accounts) {
            this._accounts.next([]);
            this.accountCount = this._recentAccounts.value?.length ? this._recentAccounts.value.length : 0;
          } else {
            this.firstSearch = false;
            this.tabSelected(this._accountsTab);
            this._accounts.next(accounts);
            this.accountCount = accounts.length;
          }
          this.filteredAccountsLoading = false;
        },
        error: () => {
          this._accounts.next([]);
          this.filteredAccountsLoading = false;
        }
      });
  }

  private _loadRecentlyViewedAccounts(): void {

    this.recentAccountsLoading = true;

    this._userInfoApiService.getUserInfo$<RecentlyViewedAccountsEntity>(UserAccountSchema.RecentlyViewed)
      .pipe(
        untilDestroyed(this),
      )
      .subscribe({
        next: (response: StandardResponse<RecentlyViewedAccountsEntity>) => {
          const recentAccounts: RecentAccount[] = [];
          response.data?.recentlyViewed?.map((recentAccount: Partial<RecentAccountEntity>) => {
            recentAccounts.push(new RecentAccount(recentAccount));
          });

          if (!recentAccounts || recentAccounts.length === 0) {
            // if no recently viewed accounts, set search term to a value that will return the default account
            this._filterService.updateSearchTerm(AccountSearchDefaults.internalAccount);
            this._recentAccounts.next(null);
            this.tabSelected(this._accountsTab);
            this.accountCount = 0;
          } else {
            this._recentAccounts.next(recentAccounts);
            this.accountCount = recentAccounts.length;
          }

          this.recentAccountsLoading = false;
        },
        error: () => {
          this._recentAccounts.next(null);
          this.tabSelected(this._accountsTab);
          this.accountCount = 0;
          this.recentAccountsLoading = false;
          this._polarisNotificationService.danger(this._translate.instant('errors.not-able-to-load-recently-viewed'));
        }
      });
  }
}
