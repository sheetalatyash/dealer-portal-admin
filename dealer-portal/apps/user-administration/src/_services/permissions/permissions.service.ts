import { computed, effect, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { BaseEntity, User } from '@classes';
import {
  AccessControlLevel,
  Account,
  AdditionalClaim,
  PageAccessoryCategory,
  PermissionPage,
  Permissions,
  StandardResponse,
  UserInfoManagementApiService,
} from '@dealer-portal/polaris-core';
import { PolarisNotificationService } from '@dealer-portal/polaris-ui';
import { PermissionMode } from '@enums';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { PermissionPayload } from '@types';
import * as _ from 'lodash';
import { Observable, of, switchMap, tap } from 'rxjs';
import { UserAdministrationApiService } from '../user-administration-api/user-administration.api.service';
import { UserAdministrationService } from '../user-administration/user-administration.service';

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  public readonly selectedDealer: Signal<Account | null> = computed(
    (): Account | null => this._userAdministrationService.selectedDealer()
  );

  public readonly userDetails: Signal<User | null> = computed(
    (): User | null => this._userAdministrationService.userDetails()
  );

  public selectedPermission: WritableSignal<PermissionPage | null> = signal<PermissionPage | null>(null);
  public copiedPermissions: WritableSignal<Permissions | null> = signal<Permissions | null>(null);
  public defaultPermissions: WritableSignal<Permissions | null> = signal<Permissions | null>(null);
  public originalPermissions: WritableSignal<Permissions | null> = signal<Permissions | null>(null);
  public workingPermissions: WritableSignal<Permissions | null> = signal<Permissions | null>(null);

  public savingDefaultPermissions: WritableSignal<boolean> = signal<boolean>(false);
  public permissionsChanged: WritableSignal<boolean> = signal<boolean>(false);

  public readonly isDefaultPermissions: Signal<boolean> = computed(() => {
    return this.arePermissionsEqual(this.defaultPermissions(), this.workingPermissions());
  });

  private readonly _permissionsChangedSignal: Signal<boolean> = computed(() => {
    return !this.arePermissionsEqual(this.originalPermissions(), this.workingPermissions());
  });

  // Signal that tracks which mode is active
  public activePermissionMode: WritableSignal<PermissionMode | null> = signal<PermissionMode | null>(null);

  constructor(
    private _polarisNotificationService: PolarisNotificationService,
    private _translateService: TranslateService,
    private _userAdministrationApiService: UserAdministrationApiService,
    private _userAdministrationService: UserAdministrationService,
    private _userInfoManagementApiService: UserInfoManagementApiService,
  ) {
    effect(() => {
      this.permissionsChanged.set(this._permissionsChangedSignal());
    });
  }

  public clearAllPermissions(): void {
    this.workingPermissions.set(null);
    this.originalPermissions.set(null);
    this.defaultPermissions.set(null);
    this.copiedPermissions.set(null);
    this.activePermissionMode.set(null);
  }

  public getUserPermissionsByApplication$(applicationName: string): Observable<StandardResponse<Partial<User>[]>> {
    const dealer: Account = this.selectedDealer() as Account;

    return this._userInfoManagementApiService.getUserPermissions$(dealer.accountNumber, applicationName);
  }

  public fetchPermissions$(
    userName: string,
    updatePermissions: boolean = true,
    setDefaultPermissions: boolean = true,
  ): Observable<Permissions | null> {
    const dealer: Account | null = this._userAdministrationService.selectedDealer();

    if (!dealer) return of(null);

    return this._userAdministrationApiService.getPermissions$(dealer.accountNumber, userName).pipe(
      switchMap((permissions: Permissions): Observable<Permissions | null> => {
        if (setDefaultPermissions) {
          this._setDefaultPermissions(structuredClone(permissions));
        }

        if (updatePermissions) {
          this.workingPermissions.set(structuredClone(permissions));
          this.originalPermissions.set(structuredClone(permissions));
        }

        return of(permissions);
      }),
    );
  }

  /**
   * Explicit method to apply default permissions for a new user
   * Called only once in AddPermissionsView after initial fetch.
   */
  public applyDefaultPermissionsForNewUser(userName: string): Observable<Permissions | null> {
    const isDefault: boolean = this.isDefaultPermissions();
    if (isDefault) {
      return of(this.workingPermissions());
    }

    this.savingDefaultPermissions.set(true);
    const clonedDefaults: Permissions | null = structuredClone(this.defaultPermissions());
    this.workingPermissions.set(clonedDefaults);

    return this.updatePermissions$(userName).pipe(
      tap(() => {
        this.savingDefaultPermissions.set(false);
      }),
      switchMap(() => of(clonedDefaults)),
    );
  }

  /**
   * Sets default permissions based on the user's departments.
   * Chooses the highest allowed access level for matching departments
   * according to availablePageAccessTypes.
   */
  private _setDefaultPermissions(permissions: Permissions): void {
    const userDetails: User = this.userDetails() as User;
    const departments: BaseEntity[] = structuredClone(userDetails.departments);

    /**
     * Determine the highest available access level for a given page.
     * Priority: ReadWrite > Read > None
     */
    const getHighestAvailableLevel = (item: PermissionPage): AccessControlLevel => {
      if (!item.availablePageAccessTypes || item.availablePageAccessTypes.length === 0) {
        return AccessControlLevel.None;
      }

      const orderedLevels: AccessControlLevel[] = [
        AccessControlLevel.ReadWrite,
        AccessControlLevel.Read,
        AccessControlLevel.None,
      ];

      // Extract available levels
      const availableLevels: AccessControlLevel[] = item.availablePageAccessTypes.map(
        (cat: PageAccessoryCategory): AccessControlLevel => cat.value
      );

      // Return the highest match based on defined priority
      for (const level of orderedLevels) {
        if (availableLevels.includes(level)) {
          return level;
        }
      }

      return AccessControlLevel.None;
    };

    /**
     * Recursively apply access control based on user's departments
     */
    const updateAccess = (item: PermissionPage): void => {
      if (!item.departments || item.departments.length === 0) {
        item.access = AccessControlLevel.None;
      } else {
        const hasMatchingDepartment: boolean = item.departments.some(
          (departmentName: string): boolean =>
            departments.some(
              (department: BaseEntity): boolean => department.name === departmentName
            )
        );

        if (hasMatchingDepartment) {
          item.access = getHighestAvailableLevel(item);
        } else {
          item.access = AccessControlLevel.None;
        }
      }

      // Recurse into children
      if (item.children && item.children.length > 0) {
        item.children.forEach(updateAccess);
      }
    };

    // Start from the top-level pages
    if (permissions.pages && permissions.pages.length > 0) {
      permissions.pages.forEach(updateAccess);
    }

    // Notify observers with updated permissions
    this.defaultPermissions.set(permissions);
  }


  public applySelectedUserPermissions(
    user: User,
    displayCopyNotification: boolean = false,
  ): void {
    this.fetchPermissions$(user.emailAddress, false, false).pipe(
      tap((permissions: Permissions | null): void => {

        if (permissions && this.activePermissionMode() === PermissionMode.Copy) {
          this.copiedPermissions.set(permissions);
        }

        if (displayCopyNotification) {
          this._polarisNotificationService.info(this._translateService.instant('notifications.permission-copy-success'));
        }

      }),
      untilDestroyed(this),
    ).subscribe();
  }

  public fetchAvailablePermissions$(): Observable<Permissions | null> {
    return this.fetchPermissions$('-', false, false);
  }

  public updatePermissions$(
    userName: string,
  ): Observable<Permissions> {
    const dealer: Account | null = this.selectedDealer() as Account;
    const permissions: Permissions = this.workingPermissions() as Permissions;

    return this._userAdministrationApiService.updatePermissions$(
      dealer.accountNumber,
      userName,
      permissions.pages,
    ).pipe(
      // After update, fetch the updated permissions
      switchMap((): Observable<Permissions> =>
        this.fetchPermissions$(
          userName
        ) as Observable<Permissions>
      ),
      tap((updatedPermissions: Permissions): void => {
        this.originalPermissions.set(updatedPermissions);
      })
    );
  }

  public setSelectedPermission(permission: PermissionPage | null): void {
    this.selectedPermission.set(permission);
  }

  public updateUserPermissions$(permission: PermissionPayload): Observable<unknown> {
    return this._userAdministrationApiService.updateUserPermissions$(permission);
  }

  /**
   * Helper function to compare two Permissions objects and log differences with menu names.
   * Skips any nodes that are 'undefined' (meaning the page was not rendered intentionally).
   *
   * @param {Permissions | null} a
   * @param {Permissions | null} b
   * @return {boolean}
   */
  public arePermissionsEqual(a: Permissions | null, b: Permissions | null): boolean {
    if (!a || !b) {
      return a === b;
    }

    interface LeafNodeData {
      key: string;
      name: string;
      access: string;
    }

    const buildLeafMap = (pages: PermissionPage[]): Map<string, LeafNodeData> => {
      const map = new Map<string, LeafNodeData>();

      const walk = (nodes: PermissionPage[]): void => {
        for (const node of nodes) {
          if (node.children && node.children.length > 0) {
            walk(node.children);
          } else {
            const key: string = String(node.contentId);
            map.set(key, {
              key,
              name: node.menuName ?? '(unnamed)', // change to pageName/displayName if needed
              access: node.access,
            });

            // If claims exist, add them under "<id>c"
            if (node.additionalClaims?.length) {
              const selectedClaims: string[] = node.additionalClaims
                .filter((claim: AdditionalClaim): boolean => claim.isSelected)
                .map((claim: AdditionalClaim): string => claim.name)
                .sort();

              if (selectedClaims.length > 0) {
                const claimKey: string = `${node.contentId}c`;
                map.set(claimKey, {
                  key: claimKey,
                  name: `${node.menuName ?? '(unnamed)'} (claims)`,
                  access: selectedClaims.join('|'),
                });
              }
            }
          }
        }
      };

      walk(pages);

      return map;
    };

    const mapA: Map<string, LeafNodeData> = buildLeafMap(a.pages);
    const mapB: Map<string, LeafNodeData> = buildLeafMap(b.pages);

    const isEqual: boolean = _.isEqual(
      new Map([...mapA.entries()].map(([k, v]) => [k, v.access])),
      new Map([...mapB.entries()].map(([k, v]) => [k, v.access])),
    );

    if (!isEqual) {
      const differences: Array<{ key: string; name: string; accessA?: string; accessB?: string }> = [];

      // Compare from A to B
      for (const [key, nodeA] of mapA.entries()) {
        const nodeB: LeafNodeData | undefined = mapB.get(key);

        // Skip if undefined (means not rendered or intentionally omitted)
        if (!nodeB || nodeA.access === undefined || nodeB.access === undefined) continue;

        if (nodeA.access !== nodeB.access) {
          differences.push({ key, name: nodeA.name, accessA: nodeA.access, accessB: nodeB.access });
        }
      }

      // Compare from B to A for new entries
      for (const [key, nodeB] of mapB.entries()) {
        const nodeA: LeafNodeData | undefined = mapA.get(key);

        // Skip if undefined (means not rendered or intentionally omitted)
        if (!nodeA || nodeA.access === undefined || nodeB.access === undefined) continue;

        if (!mapA.has(key)) {
          differences.push({ key, name: nodeB.name, accessA: undefined, accessB: nodeB.access });
        }
      }

      if (differences.length === 0) {
        return true;
      }
    }

    return isEqual;
  }

}
