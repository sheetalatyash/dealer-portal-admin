import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  OnInit,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@classes';
import {
  AccessControlDirective,
  AccessControlLevel,
  AccessControlService,
  EmployeeStatusCode,
  FuzzyKey,
  FuzzySearchResponse,
  FuzzySearchService,
} from '@dealer-portal/polaris-core';
import {
  POLARIS_DESKTOP_BREAKPOINTS,
  POLARIS_TABLET_BREAKPOINTS,
  PolarisHref,
  PolarisLoader,
  PolarisNavigationTab,
  PolarisNotificationService,
  PolarisStatusIcon,
  PolarisTable,
  PolarisTableColumnConfig,
  PolarisTableConfig,
  PolarisTableCustomCellDirective,
  PolarisTablePagination,
} from '@dealer-portal/polaris-ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { UserAdministrationService } from '@services';
import { tap } from 'rxjs';

@UntilDestroy()
@Component({
    imports: [
        PolarisHref,
        PolarisLoader,
        PolarisStatusIcon,
        PolarisTable,
        PolarisTableCustomCellDirective,
        AccessControlDirective,
    ],
    selector: 'ua-user-table',
    styleUrl: './user-table.component.scss',
    templateUrl: './user-table.component.html',
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ]
})
export class UserTableComponent implements OnInit {
  public accessControlLevel: typeof AccessControlLevel = AccessControlLevel;

   /**
    * Computed signal that returns the correct users to display based on the current status code, or null if empty.
    */
  public selectedUsers: Signal<User[] | null> = computed((): User[] | null => {
    const statusCode: string = this.activeStatusCode();
    let users: User[] | null = null;
    switch (statusCode) {
      case EmployeeStatusCode.Active.toString():
        users = this._userAdministrationService.activeUsers();
        break;
      case EmployeeStatusCode.Inactive.toString():
        users = this._userAdministrationService.inactiveUsers();
        break;
      case EmployeeStatusCode.ActivePendingVerification.toString():
        users = this._userAdministrationService.pendingUsers();
        break;
      default:
        users = null;
        break;
    }

    // Only return null if we don't have an array, we want to display an empty table
    return Array.isArray(users) ? users : null;
  });

  public activeSearchTerm: Signal<string> = computed((): string => {
    return (this._userAdministrationService.activeSearchTerm() ?? '').trim().toLowerCase();
  });

  public activeStatusCode: WritableSignal<string> = signal<string>('1');
  public hasReadWriteAccess: WritableSignal<boolean> = signal<boolean>(false);

  public tableConfig!: PolarisTableConfig<User>;

  public filteredUsers: Signal<User[] | null> = computed((): User[] | null => {
    // Apply the filter on only the current selected tab's users
    const users: User[] | null = this.selectedUsers();

    // Explicity check for null, as we want to return an empty array if there are no users
    if (users === null) return null;

    const query: string = this.activeSearchTerm();

    const keys: ReadonlyArray<FuzzyKey<User>> = [
      { name: 'firstName', weight: 0.45 },
      { name: 'lastName', weight: 0.45 },
      { name: 'emailAddress', weight: 0.10 },
    ];

    const response: FuzzySearchResponse<User> = this._fuzzySearch.performSearch<User>({
      items: users,
      query,
      configuration: {
        keys,
        minMatchCharacterLength: 1,
        threshold: 0.2,
        ignoreLocation: true,
        useExtendedSearch: false,
      },
    });

    // Convert ReadonlyArray -> mutable array to match the `User[]` return
    return [...response.results];
  });


  constructor(
    private _userAdministrationService: UserAdministrationService,
    private _polarisNotificationService: PolarisNotificationService,
    private _router: Router,
    private _translate: TranslateService,
    private _accessControlService: AccessControlService,
    private _fuzzySearch: FuzzySearchService,
  ) {
    this._initFilteredUsersEffect();
    this._initUsersEffect();
    this._initSelectedTabEffect();
    this._initActiveTabEffect();
  }

  public ngOnInit(): void {
    this._setTableConfig();
    this._getAccessControlLevel();
  }

  private _initFilteredUsersEffect(): void {
    effect((): void => {
      if (!this.tableConfig) return;

      const filteredUsers: User[] | null = this.filteredUsers();
      this.tableConfig.pagination.totalItems = Array.isArray(filteredUsers) ? filteredUsers.length : 0;
    });
  }

  private _initUsersEffect(): void {
    effect((): void => {
      const users: User[] | null = this.selectedUsers();
      if (Array.isArray(users) && users.length === 0) {
        this._polarisNotificationService.info(this._translate.instant('errors.no-users-found'));
      }
    });
  }

  private _initSelectedTabEffect(): void {
    effect((): void => {
      const navigationTabs: PolarisNavigationTab[] = this._userAdministrationService.userAdministrationNavigationTabs();
      const selected: PolarisNavigationTab | undefined = navigationTabs.find((tab: PolarisNavigationTab): boolean => tab.selected);

      if (selected) {
        this.activeStatusCode.set(String(selected.code));
      }
    });
  }

  private _initActiveTabEffect(): void {
    effect((): void => {
      const code: string = this.activeStatusCode();

      if (code) {
        this._updateTableColumnVisibility(code);
      }
    });
  }

  private _setTableConfig(): void {
    const columns: PolarisTableColumnConfig<User>[] = [
      new PolarisTableColumnConfig<User>({
        key: 'firstName',
        id: 'firstName',
        label: this._translate.instant('first-name'),
        columnVisibility: [
          'sm',
          ...POLARIS_TABLET_BREAKPOINTS,
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
      new PolarisTableColumnConfig<User>({
        key: 'lastName',
        id: 'lastName',
        label: this._translate.instant('last-name'),
        columnVisibility: [
          'sm',
          ...POLARIS_TABLET_BREAKPOINTS,
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
      new PolarisTableColumnConfig<User>({
        key: 'emailAddress',
        id: 'emailAddress',
        label: this._translate.instant('username-email'),
        columnVisibility: [
          'xs',
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
      new PolarisTableColumnConfig<User>({
        key: 'isPrimaryCommunicationContact',
        id: 'isPrimaryCommunicationContact',
        label: this._translate.instant('table.col.primary-contact'),
        sortable: false,
        alignHeader: 'center',
        alignContent: 'center',
        columnType: 'icon',
      }),
      new PolarisTableColumnConfig<User>({
        key: 'admin',
        id: 'admin',
        label: this._translate.instant('table.col.admin'),
        alignHeader: 'center',
        alignContent: 'center',
        columnType: 'icon',
        columnVisibility: POLARIS_DESKTOP_BREAKPOINTS,
      }),
      new PolarisTableColumnConfig<User>({
        key: 'pointsEligible',
        id: 'pointsEligible',
        label: this._translate.instant('table.col.points'),
        sortable: false,
        alignHeader: 'center',
        alignContent: 'center',
        columnType: 'icon',
        columnVisibility: this._userAdministrationService.isPointsEligible() ? POLARIS_DESKTOP_BREAKPOINTS : [],
      }),
      new PolarisTableColumnConfig<User>({
        key:'spiffEligible',
        id:'spiffEligible',
        label: this._translate.instant('table.col.spiff'),
        sortable: false,
        alignHeader: 'center',
        alignContent: 'center',
        columnType: 'icon',
        columnVisibility: this._userAdministrationService.isSpiffEligible() ? POLARIS_DESKTOP_BREAKPOINTS : [],
      }),
      new PolarisTableColumnConfig<User>({
        key: 'departmentString',
        id: 'departmentString',
        label: this._translate.instant('table.col.departments'),
        columnVisibility: ['xxl'],
      }),
      new PolarisTableColumnConfig<User>({
        key:'roleString',
        id: 'roleString',
        label: this._translate.instant('role'),
        sortable: false,
        columnVisibility: ['xxl'],
      }),
      new PolarisTableColumnConfig<User>({
        key: 'employmentTypeString',
        id: 'employmentTypeString',
        label: this._translate.instant('employment-type'),
        sortable: false,
        columnVisibility: ['xxl'],
      }),
      new PolarisTableColumnConfig<User>({
        id:'verification',
        label: this._translate.instant('table.col.verification'),
        alignHeader: 'center',
        alignContent: 'center',
        sortable: false,
        columnType: 'link',
        columnVisibility: [],
      }),
      new PolarisTableColumnConfig<User>({
        id: 'actions',
        label: this._translate.instant('table.col.actions'),
        sortable: false,
        alignHeader: 'center',
        alignContent: 'center',
        columnType: 'link',
        columnVisibility: [
          'sm',
          ...POLARIS_TABLET_BREAKPOINTS,
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
    ];

    this.tableConfig = new PolarisTableConfig<User>({
      columns,
      pagination: new PolarisTablePagination({
        totalItems: 0,
      }),
    });
  }

  private _getAccessControlLevel(): void {
    this._accessControlService.hasAccess({ level: AccessControlLevel.ReadWrite, exactMatch: true }).pipe(
      tap((hasAccess: boolean): void => {
        this.hasReadWriteAccess.set(hasAccess);
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  /**
   * Handles column visibility based on the active status code.
   *
   * @param activeStatusCode - The current active status code used to determine column visibility.
   */
  private _updateTableColumnVisibility(activeStatusCode: string): void {
    if (!this.tableConfig?.columns) return;

    this.tableConfig.columns.forEach((column: PolarisTableColumnConfig<User>): void => {

      // Show/hide the 'Resend verification email' column based on the active status code
      if (column.id === 'verification') {
        column.columnVisibility = activeStatusCode === '1' ? [] : ['xxl'];
      }
    });
  }

  public navigateToUserPage(user: User, state: string): void {
    // TODO: Add BreakpointObserver.observe to handle navigation based on screen size
    // TODO: If mobile, click the whole row to navigate to the user's profile page
    this._router.navigate([`/user/${state}/profile`, user.portalAuthenticationId]);
  }

  public resendVerificationEmail(user: User): void {
    this._userAdministrationService.resendVerificationEmail$(user.emailAddress).pipe(
      tap((response: boolean): void => {
        if (response) {
          this._polarisNotificationService.success(this._translate.instant(
            'notifications.email-resent-success'));
        } else {
          this._polarisNotificationService.danger(this._translate.instant(
            'notifications.email-resent-error'));
        }
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  public onLoadMore(): void {
    // TODO: Implement logic to load more users.
  }
}
