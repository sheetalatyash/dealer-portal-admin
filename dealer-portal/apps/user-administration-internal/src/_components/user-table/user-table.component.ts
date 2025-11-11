import { AsyncPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import {
  AccessControlDirective, AccessControlLevel,
  BaseUserInfo,
  PortalUserInternalClaim,
  UserInfoService
} from '@dealer-portal/polaris-core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  PolarisHref,
  PolarisLoader,
  PolarisStatusIcon,
  PolarisTable,
  PolarisTableColumnConfig,
  PolarisTableConfig,
  PolarisTableCustomCellDirective,
} from '@dealer-portal/polaris-ui';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@UntilDestroy()
@Component({
    imports: [
        AsyncPipe,
        PolarisHref,
        PolarisLoader,
        PolarisStatusIcon,
        PolarisTable,
        PolarisTableCustomCellDirective,
        TranslatePipe,
        AccessControlDirective,
    ],
    selector: 'uai-user-table',
    styleUrl: './user-table.component.scss',
    templateUrl: './user-table.component.html',
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ]
})
export class UserTableComponent implements OnInit {
  @Input() data$!: Observable<BaseUserInfo<PortalUserInternalClaim>[]>;
  @Input() totalCount$!: Observable<number>;
  @Input() loading!: boolean;
  @Input() pageSize: number = this._userInfoService.defaultPageSize;
  @Output() loadMore: EventEmitter<void> = new EventEmitter<void>();

  private _currentPageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  public currentPage$: Observable<number> = this._currentPageSubject.asObservable();
  private _displayedDataSubject: BehaviorSubject<BaseUserInfo<PortalUserInternalClaim>[] | null> = new BehaviorSubject<BaseUserInfo<PortalUserInternalClaim>[] | null>(null);
  public displayedData$: Observable<BaseUserInfo<PortalUserInternalClaim>[] | null> = this._displayedDataSubject.asObservable();
  public tableConfig!: PolarisTableConfig<BaseUserInfo<PortalUserInternalClaim>>;
  public readonly accessControlLevel: typeof AccessControlLevel = AccessControlLevel;

  constructor(
    private _userInfoService: UserInfoService,
    private _router: Router,
    private _translate: TranslateService
  ) {
  }

  public ngOnInit(): void {
    this._setTableConfig();
    combineLatest([this.data$, this.currentPage$, this.totalCount$])
      .pipe(
        untilDestroyed(this),
        map(([data, currentPage, totalCount]) => this._paginate(data, currentPage, totalCount))
      )
      .subscribe(data => {
        this._displayedDataSubject.next(data);
      });
  }

  private _paginate(data: BaseUserInfo<PortalUserInternalClaim>[], currentPage: number, totalCount: number): BaseUserInfo<PortalUserInternalClaim>[] {
    this.tableConfig.pagination.totalItems = totalCount;

    return data.slice(0, this.pageSize * currentPage);
  }

  private _setTableConfig(): void {
    const columns: PolarisTableColumnConfig<BaseUserInfo<PortalUserInternalClaim>>[] = [
      new PolarisTableColumnConfig<BaseUserInfo<PortalUserInternalClaim>>({
        key: 'claims.givenName',
        id: 'claims.givenName',
        label: this._translate.instant('first-name'),
      }),
      new PolarisTableColumnConfig<BaseUserInfo<PortalUserInternalClaim>>({
        key: 'claims.familyName',
        id: 'claims.familyName',
        label: this._translate.instant('last-name'),
      }),
      new PolarisTableColumnConfig<BaseUserInfo<PortalUserInternalClaim>>({
        key: 'claims.userName',
        id: 'claims.userName',
        label: this._translate.instant('username'),
      }),
      new PolarisTableColumnConfig<BaseUserInfo<PortalUserInternalClaim>>({
        key: 'claims.email',
        id: 'claims.email',
        label: this._translate.instant('email'),
      }),
      new PolarisTableColumnConfig<BaseUserInfo<PortalUserInternalClaim>>({
        key: 'claims.salesRole',
        id: 'claims.salesRole',
        label: this._translate.instant('sales-role'),
      }),
      new PolarisTableColumnConfig<BaseUserInfo<PortalUserInternalClaim>>({
        key: 'claims.salesRepId',
        id: 'claims.salesRepId',
        label: this._translate.instant('sales-rep-id'),
      }),
      new PolarisTableColumnConfig<BaseUserInfo<PortalUserInternalClaim>>({
        key: 'claims.accountImpersonationPermission',
        id: 'claims.accountImpersonationPermission',
        label: this._translate.instant('account-impersonation'),
        columnType: 'custom',
        sortable: false,
      }),
      new PolarisTableColumnConfig<BaseUserInfo<PortalUserInternalClaim>>({
        key: 'claims.internalImpersonationPermission',
        id: 'claims.internalImpersonationPermission',
        label: this._translate.instant('internal-impersonation'),
        columnType: 'custom',
        sortable: false,
      }),
      new PolarisTableColumnConfig<BaseUserInfo<PortalUserInternalClaim>>({
        key: 'claims.isActive',
        id: 'claims.isActive',
        label: this._translate.instant('active'),
        columnType: 'icon',
        alignContent: 'center',
      }),
      new PolarisTableColumnConfig<BaseUserInfo<PortalUserInternalClaim>>({
        key: 'claims.isOptimizelyPortalAdmin',
        id: 'claims.isOptimizelyPortalAdmin',
        label: this._translate.instant('opti-admin'),
        columnType: 'icon',
        alignContent: 'center',
      }),
      new PolarisTableColumnConfig<BaseUserInfo<PortalUserInternalClaim>>({
        id: 'actions',
        label: this._translate.instant('table.col.actions'),
        sortable: false,
        alignHeader: 'center',
        alignContent: 'center',
        columnType: 'link',
      }),
    ];

    this.tableConfig = new PolarisTableConfig<BaseUserInfo<PortalUserInternalClaim>>({
      columns,
      pagination: {
        uiTestId: 'internal-user-table-pagination',
        totalItems: 0,
      },
    });
  }

  public onLoadMore() {
    this.loadMore.emit();
    this._currentPageSubject.next(this._currentPageSubject.value + 1);
  }

  public navigateToUserPage(user: BaseUserInfo<PortalUserInternalClaim>, state: string): void {
    // TODO: Add BreakpointObserver.observe to handle navigation based on screen size
    // TODO: If mobile, click the whole row to navigate to the user's profile page
    this._userInfoService.setInternalUserInfo(user);

    this._router.navigate([`/user/${state}/profile`, user.id]);
  }

  /**
   * @function getNestedValue
   * @param {BaseUserInfo<PortalUserInternalClaim>} user
   * @param {string} key - key of the value or nested value
   * @return {string} - The value of the nested key
   *
   * // TODO: This could possibly be a core function.
   * It's a good way to grab a nested value if passed in a key in dot notation
   */
  public getNestedValue(user: BaseUserInfo<PortalUserInternalClaim>, key: string): string {
    const value = key.split('.').reduce((acc: unknown, part: string): unknown => {
      if (acc && typeof acc === 'object' && part in acc) {
        return (acc as Record<string, unknown>)[part];
      }

      return undefined; // Key doesn't exist
    }, user as unknown);

    // Convert only non-object values to string
    return typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
  }
}
