import { Component, computed, effect, Input, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { User } from '@classes';
import { Account, EmployeeStatusCode, PermissionPage, Permissions, UserAccount } from '@dealer-portal/polaris-core';
import { PermissionsService, UserAdministrationService, UserTypes } from '@services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  PolarisButton,
  PolarisGroupOption,
  PolarisNavigationTab,
  PolarisNotificationService,
  PolarisSearchBar,
  PolarisSearchBarCategoryResult,
  PolarisSearchBarResult,
  PolarisSelect,
  PolarisTabBar,
} from '@dealer-portal/polaris-ui';
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  finalize,
  tap,
} from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@UntilDestroy()
@Component({
    selector: 'ua-control-bar',
    imports: [
      MatPaginatorModule,
      ReactiveFormsModule,
      PolarisSelect,
      PolarisSearchBar,
      TranslatePipe,
      PolarisButton,
      PolarisTabBar,
    ],
    templateUrl: './control-bar.component.html',
    styleUrl: './control-bar.component.scss'
})
export class ControlBarComponent implements OnInit {
  @Input() showTabView: boolean = true;
  @Input() showDealerSelect: boolean = true;
  @Input() showSearchBar: boolean = true;
  @Input() showPermissionSelect: boolean = true;
  @Input() showLabels: boolean = true;
  @Input() showPrimaryContactSelect: boolean = false;

  public dealerOptions!: PolarisGroupOption<Account>[];
  public controlBarForm!: FormGroup;

  public permissionOptions: WritableSignal<PolarisGroupOption<PermissionPage>[] | null> = signal<PolarisGroupOption<PermissionPage>[] | null>(null);
  public availablePermissions: WritableSignal<Permissions | null> = signal<Permissions | null>(null);
  public filteredActiveUsers: WritableSignal<PolarisSearchBarCategoryResult<string>[]> = signal<PolarisSearchBarCategoryResult<string>[]>([]);
  public selectedPrimaryContact: WritableSignal<User | null> = signal<User | null>(null);

  public userAdministrationNavigationTabs: Signal<PolarisNavigationTab[]> = computed(() =>
    this._userAdministrationService.userAdministrationNavigationTabs()
  );

  public activeUsers: Signal<User[] | null> = computed(() =>
    this._userAdministrationService.activeUsers()
  );

  constructor(
    private _userAdministrationService: UserAdministrationService,
    private _permissionsService: PermissionsService,
    private _formBuilder: FormBuilder,
    private _notificationService: PolarisNotificationService,
    private _translate: TranslateService,
  ) {
    this._initUserInfoEffect();
    this._selectedPrimaryContactEffect();
    this._createPermissionsEffect();
    this._createTabChangeEffect();
  }

  public ngOnInit(): void {
    this._subscribeToPermissions();
  }

  private _createPermissionsEffect(): void {
    effect((): void => {
      const availablePermissions: Permissions | null = this.availablePermissions();
      const selectedPermission: PermissionPage | null = this._permissionsService.selectedPermission();

      if (availablePermissions) {
        this._createPermissionOptions(availablePermissions, selectedPermission);
      }
    });
  }

  private _subscribeToPermissions(): void {
    if (this.showPermissionSelect) {
      this._permissionsService.fetchAvailablePermissions$().pipe(
        tap((permissions: Permissions | null): void => {
          this.availablePermissions.set(permissions);
          this._createPermissionOptions(permissions, null);
        }),
        untilDestroyed(this),
      ).subscribe();
    }
  }

  private _createTabChangeEffect(): void {
    effect((): void => {
      // Guard: If all user signals are null, skip this run (either all have been cleared or it's the initial load which is handled elsewhere)
      const activeUsers = this._userAdministrationService.activeUsers();
      const inactiveUsers = this._userAdministrationService.inactiveUsers();
      const pendingUsers = this._userAdministrationService.pendingUsers();
      if (activeUsers === null && inactiveUsers === null && pendingUsers === null) {
        return;
      }

      const tabs: PolarisNavigationTab[] = this._userAdministrationService.userAdministrationNavigationTabs();
      const activeTab: PolarisNavigationTab | null = tabs.find((tab: PolarisNavigationTab): boolean => tab.selected) ?? null;

      if (!activeTab) {
        return;
      }

      // Get users for the selected tab if not already loaded
      switch (activeTab.code as EmployeeStatusCode) {
        case EmployeeStatusCode.Active:
          if (activeUsers === null) {
            this._userAdministrationService.getUsers(UserTypes.Active);
          }
          break;
        case EmployeeStatusCode.Inactive:
          if (inactiveUsers === null) {
            this._userAdministrationService.getUsers(UserTypes.Inactive);
          }
          break;
        case EmployeeStatusCode.ActivePendingVerification:
          if (pendingUsers === null) {
            this._userAdministrationService.getUsers(UserTypes.Pending);
          }
          break;
      }
    });
  }

  public changeNavigationTab(updatedTab: PolarisNavigationTab): void {
    this._userAdministrationService.updateActiveUserAdministrationTab(updatedTab);
  }

  public createControlBarForm(selectedDealer: Account, activeSearchTerm: string, selectedPermission: PermissionPage): void {
    this.controlBarForm = this._formBuilder.group({
      searchTerm: [activeSearchTerm],
      dealer: [selectedDealer.accountNumber],
      permission: [String(selectedPermission.contentId ?? '')],
      primaryContact: [''],
    });

    this._subscribeToSearchTermChanges();
    this._subscribeToSelectedDealerChanges();
    this._subscribeToPermissionChanges();
    this._subscribeToPrimaryContactSearch();
  }

  private _subscribeToSearchTermChanges(): void {
    if (this.showSearchBar) {
      this.controlBarForm.get('searchTerm')?.valueChanges.pipe(
        distinctUntilChanged(),
        tap((newSearchTerm: string): void => {
          this._userAdministrationService.updateActiveSearchTerm(newSearchTerm);
        }),
        untilDestroyed(this),
      ).subscribe();
    }
  }

  private _subscribeToSelectedDealerChanges(): void {
    if (this.showDealerSelect) {
      this.controlBarForm.get('dealer')?.valueChanges.pipe(
        distinctUntilChanged(),
        tap((newDealerId: string): void => {
          const dealerOption: PolarisGroupOption<Account> = this.dealerOptions.find((option: PolarisGroupOption<Account>): boolean => option.value === newDealerId) as PolarisGroupOption<Account>;
          this._userAdministrationService.setSelectedDealer(dealerOption.data as Account);
        }),
        untilDestroyed(this),
      ).subscribe();
    }
  }

  private _subscribeToPermissionChanges(): void {
    if (this.showPermissionSelect) {
      this.controlBarForm.get('permission')?.valueChanges.pipe(
        distinctUntilChanged(),
        tap((newPermissionId: string): void => {
          const permissionOptions: PolarisGroupOption<PermissionPage>[] = this.permissionOptions() as PolarisGroupOption<PermissionPage>[];
          const permissionOption: PolarisGroupOption<PermissionPage> | null = this._findPermissionRecursively(permissionOptions, newPermissionId);

          if (permissionOption) {
            this._permissionsService.setSelectedPermission(permissionOption.data as PermissionPage);
          }
        }),
        untilDestroyed(this),
      ).subscribe();
    }
  }

  private _subscribeToPrimaryContactSearch(): void {
    if (this.showPrimaryContactSelect) {
      this.controlBarForm.get('primaryContact')?.valueChanges.pipe(
        distinctUntilChanged(),
        tap((primaryContactSearchText: string): void => {
          const activeUsers: User[] | null = this.activeUsers();
          if (!activeUsers) {
            this.filteredActiveUsers.set([]);

            return;
          }

          const lowered: string = (primaryContactSearchText ?? '').toLowerCase();

          let filteredPrimaryContacts: PolarisSearchBarResult<string>[];

          if (!lowered) {
            this.selectedPrimaryContact.set(null);
            // Return all active users if there is no search text
            filteredPrimaryContacts = activeUsers.map((user: User): PolarisSearchBarResult<string> =>
              new PolarisSearchBarResult<string>({
                id: `user-${user.portalAuthenticationId}`,
                label: `${user.firstName} ${user.lastName}`,
                value: user.portalAuthenticationId,
              })
            );
          } else {
            // Filter based on name/email
            filteredPrimaryContacts = activeUsers
              .filter((user: User): boolean => {
                return (
                  `${user.firstName} ${user.lastName}`.toLowerCase().includes(lowered) ||
                  user.emailAddress.toLowerCase().includes(lowered)
                );
              })
              .map((user: User): PolarisSearchBarResult<string> =>
                new PolarisSearchBarResult<string>({
                  id: `user-${user.portalAuthenticationId}`,
                  label: `${user.firstName} ${user.lastName}`,
                  value: user.portalAuthenticationId,
                })
              );
          }

          // Wrap in a single category
          const filteredCategoryResults: PolarisSearchBarCategoryResult<string> =
            new PolarisSearchBarCategoryResult<string>({
              category: '',
              options: filteredPrimaryContacts,
            });

          this.filteredActiveUsers.set([filteredCategoryResults]);
        }),
        untilDestroyed(this),
      ).subscribe();
    }
  }


  /**
   * Recursively searches for a permission option within nested structures.
   */
  private _findPermissionRecursively(
    options: PolarisGroupOption<PermissionPage>[],
    targetValue: string
  ): PolarisGroupOption<PermissionPage> | null {
    for (const option of options) {
      if (option.value === targetValue) {
        return option;
      }
      if (option.children && option.children.length > 0) {
        const foundInChildren: PolarisGroupOption<PermissionPage> | null = this._findPermissionRecursively(option.children, targetValue);
        if (foundInChildren) {
          return foundInChildren;
        }
      }
    }

    return null;
  }

  private _initUserInfoEffect(): void {
    effect((): void => {
      const selectedDealer: Account | null = this._userAdministrationService.selectedDealer();
      const updatedUserInfo: UserAccount | null = this._userAdministrationService.userInfo();
      const activeSearchTerm: string = this._userAdministrationService.activeSearchTerm() ?? '';
      const selectedPermission: PermissionPage | null = this._permissionsService.selectedPermission();

      if (!selectedDealer || !updatedUserInfo) {
        return;
      }

      // (Re)build dealer options whenever user info or selected dealer changes
      this._createDealerOptions(selectedDealer, updatedUserInfo);

      // If form hasn’t been created yet, build it once.
      if (!this.controlBarForm) {
        this.createControlBarForm(
          selectedDealer,
          activeSearchTerm,
          selectedPermission ?? new PermissionPage()
        );

        return;
      }

      // Otherwise, keep the form in sync without triggering subscribers.
      const currentDealer: string = this.controlBarForm.get('dealer')?.value;
      const currentSearch: string = this.controlBarForm.get('searchTerm')?.value ?? '';
      const currentPermission: string = this.controlBarForm.get('permission')?.value ?? '';

      const nextDealer: string = selectedDealer.accountNumber;
      const nextPermission: string = String(selectedPermission?.contentId ?? '');

      // Only patch fields that actually changed; avoid emitting change events
      const patch: Partial<Record<'dealer' | 'searchTerm' | 'permission', string>> = {};
      if (currentDealer !== nextDealer) patch.dealer = nextDealer;
      if (currentSearch !== activeSearchTerm) patch.searchTerm = activeSearchTerm;
      if (currentPermission !== nextPermission) patch.permission = nextPermission;

      if (Object.keys(patch).length) {
        this.controlBarForm.patchValue(patch, { emitEvent: false });
      }
    });
  }

  private _selectedPrimaryContactEffect(): void {
    effect((): void => {
      const selectedPrimaryContact: User | null = this._userAdministrationService.userDetails();

      if (selectedPrimaryContact) {
        const updatedContact: User = { ...selectedPrimaryContact, isPrimaryCommunicationContact: true };
        this.selectedPrimaryContact.set(updatedContact);
      }
    });

  }

  private _createDealerOptions(selectedDealer: Account, updatedUserInfo: UserAccount): void {
    this.dealerOptions = updatedUserInfo.accounts.map((account: Account): PolarisGroupOption<Account> => {

      return new PolarisGroupOption<Account>({
        value: account.systemId,
        label: `${account.accountName} (${account.systemId})`,
        selected: account.systemId === selectedDealer.systemId,
        data: account,
      });
    });
  }

  private _createPermissionOptions(permissions: Permissions | null, selectedPermission: PermissionPage | null): void {
    if (this.showPermissionSelect && permissions) {
      const permissionsToUse: Permissions | null = permissions ?? this.availablePermissions();

      if (!permissionsToUse) {
        return;
      }

      const permissionOptions: PolarisGroupOption<PermissionPage>[] = this._mapPermissionPagesToOptions(permissionsToUse.pages, selectedPermission);
      this.permissionOptions.set(permissionOptions);
    }
  }

  private _mapPermissionPagesToOptions(pages: PermissionPage[], selectedPermission: PermissionPage | null): PolarisGroupOption<PermissionPage>[] {
    const selectedId: string = String(selectedPermission?.contentId ?? '');

    return pages.map((page: PermissionPage): PolarisGroupOption<PermissionPage> => {
      const id: string = String(page.contentId);

      return new PolarisGroupOption<PermissionPage>({
        value: id,
        label: page.menuName,
        selected: id === selectedId,
        data: page,
        children: page.children?.length ? this._mapPermissionPagesToOptions(page.children, selectedPermission) : []
      });
    });
  }

  public getFormControl(formControlName: string): FormControl {
    return this.controlBarForm.get(formControlName) as FormControl;
  }

  public onSelectResult(portalAuthenticationId: string): void {
    this._userAdministrationService.getUserDetails(portalAuthenticationId);
  }

  public updatePrimaryContact(): void {
    const selectedPrimaryContact: User | null = this.selectedPrimaryContact();

    if (selectedPrimaryContact) {
      this._userAdministrationService.clearAllUsers();

      this._userAdministrationService.updateUser$(selectedPrimaryContact).pipe(
        catchError(() => {
          this._notificationService.danger(
            this._translate.instant('notifications.primary-contact-error')
          );

          return EMPTY;
        }),
        finalize((): void => {
          this.controlBarForm.get('primaryContact')?.setValue('');
          this.selectedPrimaryContact.set(null);

          // Always refresh the full user list for other service based logic
          this._userAdministrationService.getUsers();

          // Refresh the displayed user list based on currently selected tab, the other tabs will be lazy loaded when selected
          this._userAdministrationService.getUsersForSelectedTab();
        }),
        untilDestroyed(this),
      ).subscribe();
    }
  }

  public removeSelectedPrimaryContact(): void {
    this.selectedPrimaryContact.set(null);
  }
}
