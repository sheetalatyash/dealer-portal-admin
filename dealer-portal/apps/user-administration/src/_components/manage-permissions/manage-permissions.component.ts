import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, signal, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ExtendedUser, User } from '@classes';
import { ControlBarComponent } from '@components/control-bar';
import {
  AccessControlLevel,
  Account,
  PageAccessoryCategory,
  PermissionPage,
  StandardResponse,
} from '@dealer-portal/polaris-core';
import {
  POLARIS_DESKTOP_BREAKPOINTS,
  POLARIS_TABLET_BREAKPOINTS,
  PolarisGroupOption,
  PolarisHeading,
  PolarisHref,
  PolarisIcon,
  PolarisLoader,
  PolarisNotificationService,
  PolarisRadioGroup,
  PolarisTable,
  PolarisTableColumnConfig,
  PolarisTableConfig,
  PolarisTableCustomCellDirective,
} from '@dealer-portal/polaris-ui';
import { Route } from '@enums';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PermissionsService, UserAdministrationService } from '@services';
import { PermissionPayload } from '@types';
import { distinctUntilChanged, tap } from 'rxjs';

@UntilDestroy()
@Component({
    selector: 'ua-manage-permissions',
  imports: [
    CommonModule,
    PolarisHref,
    PolarisIcon,
    PolarisHeading,
    PolarisLoader,
    PolarisTable,
    PolarisTableCustomCellDirective,
    RouterLink,
    TranslatePipe,
    ControlBarComponent,
    PolarisRadioGroup,
  ],
    templateUrl: './manage-permissions.component.html',
    styleUrl: './manage-permissions.component.scss',
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ]
})
export class ManagePermissionsComponent {
  readonly Route: typeof Route = Route;
  public isEditView: boolean = false;
  public tableConfig!: PolarisTableConfig<ExtendedUser>;
  private _navigatedHomeOnce: boolean = false;

  public users: WritableSignal<ExtendedUser[] | null> = signal<ExtendedUser[] | null>(null);
  public accessLevelOptions: WritableSignal<Record<string, PolarisGroupOption<void>>> = signal<Record<string, PolarisGroupOption<void>>>({});
  public accessControls: WritableSignal<Record<string, FormControl<AccessControlLevel>>> = signal<Record<string, FormControl<AccessControlLevel>>>({});

  constructor(
    private _userAdministrationService: UserAdministrationService,
    private _permissionsService: PermissionsService,
    private _polarisNotificationService: PolarisNotificationService,
    private _router: Router,
    private _translate: TranslateService
  ) {
    this._setTableConfig();
    this._initRequiredInfoEffect();
  }

  private _initRequiredInfoEffect(): void {
    effect((): void => {
      const selectedDealer: Account | null = this._userAdministrationService.selectedDealer();
      const selectedPermission: PermissionPage | null = this._permissionsService.selectedPermission();

      this.isEditView = !!selectedDealer && !!selectedPermission;

      if (!selectedDealer) {
        if (!this._navigatedHomeOnce) {
          this._navigatedHomeOnce = true;
          queueMicrotask((): void => {
            this._router.navigate(['/']);
          });
        }

        return;
      }

      if (selectedPermission?.applicationName) {
        this._getUserPermissionsByApplication$();
        this._setAccessLevelOptions();
      }
    });
  }

  private _getUserPermissionsByApplication$(): void {
    const selectedPermission: PermissionPage = this._permissionsService.selectedPermission() as PermissionPage;
    const applicationName: string = selectedPermission.applicationName ?? '';
    const users: User[] = this._userAdministrationService.activeUsers() ?? [];
    const activeUsers: ExtendedUser[] = users.map((user: User): ExtendedUser => new ExtendedUser(user));
    this.users.set(null);
    this.accessControls.set({});

    this._permissionsService.getUserPermissionsByApplication$(applicationName).pipe(
      tap((permissionUsers: StandardResponse<Partial<User>[]>): void => {
        if (permissionUsers?.error) {
          this._polarisNotificationService.danger(this._translate.instant('error-fetching-user-permissions'));

          return;
        }

        if (!permissionUsers?.success) {
          return;
        }

        const incomingUsers: ExtendedUser[] =
          (permissionUsers.data as Partial<User>[] ?? [])
            .map((partial: Partial<User>): ExtendedUser => {
              // Ensure emailAddress exists; bail if neither field exists
              const emailAddress: string | undefined = (partial.emailAddress ?? partial.email ?? undefined);

              if (emailAddress) {
                partial.emailAddress = emailAddress;
              }

              return new ExtendedUser(partial);
          }).filter((user: ExtendedUser): boolean => !!user.emailAddress);

        // Ensure every active user has a default page permission
        const pagePermission: PermissionPage = new PermissionPage({
          access: AccessControlLevel.None,
          applicationName,
          pageId: selectedPermission.contentId,
        });

        activeUsers.forEach((user: ExtendedUser): void => {
          user.permissions.push(pagePermission);
        });

        // Build map from the current active users first
        const mergedUserMap: Map<string, ExtendedUser> = new Map<string, ExtendedUser>(
          activeUsers.map((user: ExtendedUser): [string, ExtendedUser] => [user.emailAddress, user]),
        );

        for (const user of incomingUsers) {
          if (mergedUserMap.has(user.emailAddress)) {
            mergedUserMap.set(user.emailAddress, user);
          }
        }

        const mergedUsers: ExtendedUser[] = Array.from(mergedUserMap.values());
        this.users.set(mergedUsers);
        this._setAccessControls(mergedUsers);
        this.tableConfig.pagination.totalItems = mergedUsers.length;
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  private _setAccessControls(users: ExtendedUser[]): void {
    const accessControls: Record<string, FormControl<AccessControlLevel>> = this.accessControls();
    const selectedPermission: PermissionPage = this._permissionsService.selectedPermission() as PermissionPage;

    users.forEach((user: ExtendedUser) => {
      if (!accessControls[user.emailAddress]) {
        const initialAccessLevel: AccessControlLevel = user.permissions.find(
          (permission: Partial<PermissionPage>): boolean => {
            return permission.applicationName === selectedPermission.applicationName;
          })?.access ?? AccessControlLevel.None;

        accessControls[user.emailAddress] = new FormControl<AccessControlLevel>(initialAccessLevel, { nonNullable: true });

        accessControls[user.emailAddress].valueChanges.pipe(
          distinctUntilChanged(),
          tap(() => this._updateAccessLevel(user)),
          untilDestroyed(this)
        ).subscribe();
      }
    });
  }

  private _setTableConfig(): void {
    const columns: PolarisTableColumnConfig<ExtendedUser>[] = [
      new PolarisTableColumnConfig<ExtendedUser>({
        key: 'firstName',
        id: 'firstName',
        label: this._translate.instant('first-name'),
        columnVisibility: [
          'sm',
          ...POLARIS_TABLET_BREAKPOINTS,
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
      new PolarisTableColumnConfig<ExtendedUser>({
        key: 'lastName',
        id: 'lastName',
        label: this._translate.instant('last-name'),
        columnVisibility: [
          'sm',
          ...POLARIS_TABLET_BREAKPOINTS,
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
      new PolarisTableColumnConfig<ExtendedUser>({
        key: 'emailAddress',
        id: 'emailAddress',
        label: this._translate.instant('username-email'),
        columnVisibility: [
          'xs',
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
      new PolarisTableColumnConfig<ExtendedUser>({
        key: 'departmentString',
        id: 'departmentString',
        label: this._translate.instant('table.col.departments'),
        columnVisibility: ['xxl'],
      }),
      new PolarisTableColumnConfig<ExtendedUser>({
        key: 'roleString',
        id: 'roleString',
        label: this._translate.instant('role'),
        sortable: false,
        columnVisibility: ['xxl'],
      }),
      new PolarisTableColumnConfig<ExtendedUser>({
        id: AccessControlLevel.None,
        key: AccessControlLevel.None,
        label: this._translate.instant('table.col.no-access'),
        sortable: false,
        alignHeader: 'center',
        alignContent: 'center',
        columnType: 'radio',
      }),
      new PolarisTableColumnConfig<ExtendedUser>({
        id: AccessControlLevel.Read,
        key: AccessControlLevel.Read,
        label: this._translate.instant('table.col.read-only'),
        sortable: false,
        alignHeader: 'center',
        alignContent: 'center',
        columnType: 'radio',
      }),
      new PolarisTableColumnConfig<ExtendedUser>({
        id: AccessControlLevel.ReadWrite,
        key: AccessControlLevel.ReadWrite,
        label: this._translate.instant('table.col.add-edit'),
        sortable: false,
        alignHeader: 'center',
        alignContent: 'center',
        columnType: 'radio',
      }),
    ];

    this.tableConfig = new PolarisTableConfig<ExtendedUser>({
      columns,
    });
  }

  private _setAccessLevelOptions(): void {
    const selectedPermission: PermissionPage = this._permissionsService.selectedPermission() as PermissionPage;
    const accessLevelOptions: Record<string, PolarisGroupOption<void>> = {};
    this.accessLevelOptions.set({});

    selectedPermission.availablePageAccessTypes?.forEach((accessType: PageAccessoryCategory): void => {
      accessLevelOptions[accessType.value] = new PolarisGroupOption({
        value: accessType.value,
      });
    });

    this.accessLevelOptions.set(accessLevelOptions);
  }

  private _updateAccessLevel(user: ExtendedUser): void {
    const users: ExtendedUser[] = this.users() as ExtendedUser[];
    const newAccessLevel: AccessControlLevel = this.accessControls()[user.emailAddress]?.value;
    const selectedPermission: PermissionPage | null = this._permissionsService.selectedPermission();

    const accessLevels: AccessControlLevel[] = [
      AccessControlLevel.None,
      AccessControlLevel.Read,
      AccessControlLevel.ReadWrite,
    ];

    // Since the radio buttons are divided between table cells, but they use the same FormControl instance,
    // this will update all associated radio buttons to reflect the new access level.
    accessLevels.forEach(() => {
      const control: FormControl<AccessControlLevel> = this.accessControls()[user.emailAddress];
      if (control) {
        control.setValue(newAccessLevel, { emitEvent: false });
      }
    });

    // Update the matching user's accessLevel
    users.forEach((extendedUser: ExtendedUser): void => {
      if (extendedUser.emailAddress === user.emailAddress) {

        const permission: PermissionPayload = {
          accountNumber: this._userAdministrationService.selectedDealer()?.accountNumber as string,
          email: extendedUser.emailAddress,
          pageId: selectedPermission?.contentId ?? 0,
          access: newAccessLevel,
        };

        this._permissionsService.updateUserPermissions$(permission).pipe(
          tap((): void => {
            this._polarisNotificationService.info(this._translate.instant('access-level-updated-success'));
          }),
          untilDestroyed(this),
        ).subscribe();
      }
    });

    this.users.set(users);
  }
}
