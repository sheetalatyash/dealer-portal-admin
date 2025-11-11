import { AsyncPipe, CommonModule} from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { AccountUser } from '@classes/index';
import {
  POLARIS_DESKTOP_BREAKPOINTS,
  POLARIS_MOBILE_BREAKPOINTS,
  POLARIS_TABLET_BREAKPOINTS,
  PolarisHref,
  PolarisLoader,
  PolarisNotificationService,
  PolarisStatusIcon,
  PolarisTable,
  PolarisTableColumnConfig,
  PolarisTableConfig,
  PolarisTableCustomCellDirective,
} from '@dealer-portal/polaris-ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DealerPortalService } from '@services/dealer-portal/dealer-portal.service';
import { UserAdminService } from '@services/user-admin/user-admin.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ImpersonateResponse } from '@dealer-portal/polaris-core';

@UntilDestroy()
@Component({
    imports: [
        AsyncPipe,
        CommonModule,
        PolarisHref,
        PolarisLoader,
        PolarisStatusIcon,
        PolarisTable,
        PolarisTableCustomCellDirective,
        TranslatePipe
    ],
    selector: 'as-user-table',
    styleUrl: './user-table.component.scss',
    templateUrl: './user-table.component.html',
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ]
})
export class UserTableComponent implements OnInit {
  @Input() accountNumber!: string;
  @Input() accountName!: string;
  @Input() cityState!: string;
  @Input() searchTerm$: Observable<string>;

  private _users: BehaviorSubject<AccountUser[] | null> = new BehaviorSubject<AccountUser[] | null>(null);

  public activeSearchTerm: string = '';
  public activeStatusCode: string = '1';
  public isLoading: boolean = false;
  public users: AccountUser[] = [];
  public users$: Observable<AccountUser[] | null> = this._users.asObservable();
  public tableConfig!: PolarisTableConfig<AccountUser>;

  constructor(
    private _dealerPortalService: DealerPortalService,
    private _userAdminService: UserAdminService,
    private _notificationService: PolarisNotificationService,
    private _translate: TranslateService
  ) {
    this.searchTerm$ = of('');
  }

  public ngOnInit(): void {
    // If page was restored from back-forward cache, reset loading state.
    window.addEventListener('pageshow', (event: PageTransitionEvent) => {
      if (event.persisted) {
        this._users.next(this.users);
        this.isLoading = false;
      }
    });

    this.isLoading = true;
    this.searchTerm$.pipe(untilDestroyed(this)).subscribe((value: string) => {
      this._filterAccountUsers(value);
    });

    this._setTableConfig();

    this._userAdminService.getUserByAccount$(this.accountNumber).pipe(untilDestroyed(this)).subscribe((users: AccountUser[]) => {

      if (!users || users.length === 0) {
        this._notificationService.warning(this._translate.instant('errors.no-users-found'));
      }
      this.users = users;
      this._users.next(users);
      this.isLoading = false;
    });
  }

  public impersonateUser(accountUser: AccountUser): void {
    this.isLoading = true;

    this._dealerPortalService.impersonateUser$(this.accountNumber, this.accountName, this.cityState, accountUser.userName, accountUser.portalAuthenticationId)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe({
        next: (impersonateResponse: ImpersonateResponse | undefined) => {
          if (impersonateResponse !== undefined) {
            this.isLoading = false;
            window.location.href = impersonateResponse.redirectUrl;
          }

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  private _filterAccountUsers(searchTerm: string): void {
    let users: AccountUser[] | null = structuredClone(this.users);
    if (!users || users.length === 0) {
      return;
    }

    // Filter users based on search term
    users = users.filter((user: AccountUser): boolean => {
      const userAsString: string = JSON.stringify(Object.values(user)).toLowerCase();
      const includesSearchTerm: boolean = userAsString.includes(searchTerm.toLowerCase());

      return includesSearchTerm;
    });
    this._users.next(users);
  }

  private _setTableConfig(): void {
    const columns: PolarisTableColumnConfig<AccountUser>[] = [
      new PolarisTableColumnConfig<AccountUser>({
        key: 'firstName',
        id: 'firstName',
        label: this._translate.instant('table.col.first-name'),
        columnVisibility: [
          'sm',
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
      new PolarisTableColumnConfig<AccountUser>({
        key: 'lastName',
        id: 'lastName',
        label: this._translate.instant('table.col.last-name'),
        columnVisibility: [
          'sm',
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
      new PolarisTableColumnConfig<AccountUser>({
        key: 'userName',
        id: 'userName',
        label: this._translate.instant('table.col.username'),
        columnVisibility: [
          'sm',
          ...POLARIS_MOBILE_BREAKPOINTS,
          ...POLARIS_TABLET_BREAKPOINTS,
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
      new PolarisTableColumnConfig<AccountUser>({
        key: 'primaryContact',
        id: 'primaryContact',
        label: this._translate.instant('table.col.primary-contact'),
        sortable: false,
        alignHeader: 'center',
        alignContent: 'center',
        columnType: 'icon',
        columnVisibility: [
          'sm',
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ]
      }),
      new PolarisTableColumnConfig<AccountUser>({
        key: 'admin',
        id: 'admin',
        label: this._translate.instant('table.col.admin'),
        alignHeader: 'center',
        alignContent: 'center',
        columnType: 'icon',
        columnVisibility: [
          'sm',
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ]
      }),
      new PolarisTableColumnConfig<AccountUser>({
        key: 'points',
        id: 'points',
        label: this._translate.instant('table.col.points'),
        sortable: false,
        alignHeader: 'center',
        alignContent: 'center',
        columnType: 'icon',
        columnVisibility: [
          'sm',
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ]
      }),
      new PolarisTableColumnConfig<AccountUser>({
        key: 'spiff',
        id: 'spiff',
        label: this._translate.instant('table.col.spiff'),
        sortable: false,
        alignHeader: 'center',
        alignContent: 'center',
        columnType: 'icon',
        columnVisibility: [
          'sm',
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ]
      }),
      new PolarisTableColumnConfig<AccountUser>({
        key: 'departments',
        id: 'departments',
        label: this._translate.instant('table.col.departments'),
        columnVisibility: [
          'md',
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ]
      }),
      new PolarisTableColumnConfig<AccountUser>({
        key: 'role',
        id: 'role',
        label: this._translate.instant('table.col.role'),
        sortable: false,
        columnVisibility: [
          'md',
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ]
      }),
      new PolarisTableColumnConfig<AccountUser>({
        key: 'employment',
        id: 'employmentType',
        label: this._translate.instant('table.col.employment-type'),
        sortable: false,
        columnVisibility: [
          'md',
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ]
      }),
      new PolarisTableColumnConfig<AccountUser>({
        id: 'impersonate',
        label: this._translate.instant('table.col.account-access'),
        sortable: false,
        columnType: 'link',
        columnVisibility: [
          'sm',
          ...POLARIS_MOBILE_BREAKPOINTS,
          ...POLARIS_TABLET_BREAKPOINTS,
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
    ];

    this.tableConfig = new PolarisTableConfig<AccountUser>({
      columns, pagination: { uiTestId: '', totalItems: 0 },
    });
  }
}
