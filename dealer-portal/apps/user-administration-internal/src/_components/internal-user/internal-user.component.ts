import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Data, Event as RouterEvent, NavigationEnd, Router } from '@angular/router';
import {
  AccessControlDirective,
  AccessControlLevel,
  BaseUserInfo,
  PermissionPage,
  Permissions,
  PortalUserInternalClaim,
  UserInfoManagementApiService,
} from '@dealer-portal/polaris-core';
import {
  ButtonAction,
  ButtonConfig,
  PolarisButton,
  PolarisHeading,
  PolarisLoader,
  PolarisNotificationService,
  PolarisThemeLevel,
} from '@dealer-portal/polaris-ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { Route } from '@enums';
import { BehaviorSubject, catchError, filter, finalize, forkJoin, map, Observable, of, take, tap } from 'rxjs';
import { UserAdministrationService } from '@services';
import { PermissionsTemplateComponent } from '../permissions-template';
import { FormGroup } from '@angular/forms';

@UntilDestroy()
@Component({
    selector: 'uai-internal-user',
    imports: [
        CommonModule,
        PolarisLoader,
        PolarisHeading,
        PolarisButton,
        AccessControlDirective,
        PermissionsTemplateComponent,
    ],
    templateUrl: './internal-user.component.html',
    styleUrl: './internal-user.component.scss',
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
    ]
})
export class InternalUserComponent {
  @ViewChild(PermissionsTemplateComponent) permissionsComponent!: PermissionsTemplateComponent;

  // Location
  readonly Route = Route;

  // Page Configuration
  public isDetailsView: boolean = true;
  public isEditView: boolean = false;
  public showLoader: boolean = false;
  public pageHeader: string = '';
  public readonly accessControlLevel: typeof AccessControlLevel = AccessControlLevel;
  public permissionsFormValid: boolean = false;

  // Buttons
  public availableUserPageActions: ButtonAction[] = [
    ButtonAction.Edit,
    ButtonAction.SaveChanges,
    ButtonAction.Exit
  ];
  public buttonAction: typeof ButtonAction = ButtonAction;
  public userPageActionButtons: ButtonConfig[] = [];

  public internalUserInfoId: string | null = null;

  // Internal User Information
  private _internalUserInfo: BehaviorSubject<BaseUserInfo<PortalUserInternalClaim> | null> = new BehaviorSubject<BaseUserInfo<PortalUserInternalClaim> | null>(null);
  public internalUserInfo$: Observable<BaseUserInfo<PortalUserInternalClaim> | null> = this._internalUserInfo.asObservable();

  private _permissions: BehaviorSubject<Permissions | null> = new BehaviorSubject<Permissions | null>(null);
  public permissions$: Observable<Permissions | null> = this._permissions.asObservable();

  private _userFullName: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public userFullName$: Observable<string | null> = this._userFullName.asObservable();

  constructor(
    private _userAdministrationService: UserAdministrationService,
    private _activatedRoute: ActivatedRoute,
    private _polarisNotificationService: PolarisNotificationService,
    private _router: Router,
    private _translate: TranslateService,
    private _userInfoManagementApiService: UserInfoManagementApiService
  ) {
    this._setUserInfoFromResolver();
    this._subscribeToRouterEvents();
  }

  private _setUserInfoFromResolver(): void {
    this._activatedRoute.data.pipe(
      map((data: Data): void => {
        if (data['internalUserInfo']) {
          this._internalUserInfo.next(data['internalUserInfo']);
          const { givenName, familyName } = data['internalUserInfo'].claims;
          if (givenName && familyName) {
            this._userFullName.next(`${givenName} ${familyName}`);
          }

          this._getPermissions();
        }
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  private _getPermissions(): void {
    const internalUserInfo: BaseUserInfo<PortalUserInternalClaim> = this._internalUserInfo.getValue() as BaseUserInfo<PortalUserInternalClaim>;

    if (!internalUserInfo || !internalUserInfo.claims?.userName || !internalUserInfo.claims?.accountNumber) {
      // User info or claims are missing. Skipping permission fetch.
      this._polarisNotificationService.danger('User info or claims are missing. Skipping permission fetch.');

      return;
    }

    this._userAdministrationService
      .getPermissions$(internalUserInfo.claims.accountNumber, internalUserInfo.claims.userName)
      .pipe(
        take(1),
        tap((permissions: Permissions | null): void => {
          this._permissions.next(permissions);
        }),
        catchError(() => {
          return of(null); // Ensure observable completes gracefully
        }),
      ).subscribe();
  }

  private _subscribeToRouterEvents(): void {
    this._configurePageData(window.location.href);

    this._router.events.pipe(
      filter((navigationEvent: RouterEvent): navigationEvent is NavigationEnd => navigationEvent instanceof NavigationEnd),
      map((navigationEvent: NavigationEnd): void => {
        this._configurePageData(navigationEvent.url);
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  private _configurePageData(url: string): void {
    this.isDetailsView = url.includes('user/details/');
    this.isEditView = url.includes('user/edit/');
    const urlId: string = this._activatedRoute.snapshot.paramMap.get('id') as string;
    this.pageHeader = this.isDetailsView ? this._translate.instant('title.permissions-details') : this._translate.instant('title.permissions-edit');

    if (this.internalUserInfoId !== urlId) {
      this.internalUserInfoId = urlId;
      this._updateUserActionButtons();
    }
  }

  private _updateUserActionButtons(): void {
    this.userPageActionButtons = [];

    this.availableUserPageActions.map((action: ButtonAction): void => {
      this.userPageActionButtons.push(
        new ButtonConfig({
          label: action,
          theme: action === ButtonAction.Edit || action === ButtonAction.SaveChanges ? PolarisThemeLevel.Primary : PolarisThemeLevel.Tertiary,
          visible: action === ButtonAction.Exit
            || (this.isDetailsView && action === ButtonAction.Edit)
            || (!this.isDetailsView && action === ButtonAction.SaveChanges),
        })
      )
    });
  }

  public startUserPageAction(buttonConfig: ButtonConfig): void {
    switch(buttonConfig.label) {
      case ButtonAction.Edit:
        this._routeToEditView();
        break;
      case ButtonAction.Exit:
        this._routeToUserAdminInternal();
        break;
      case ButtonAction.SaveChanges:
        this._saveAllChanges();
        break;
      default:
        return;
    }
  }

  public onFormInitialized(form: FormGroup): void {
    form.statusChanges.pipe(untilDestroyed(this)).subscribe((status: string) => {
      this.permissionsFormValid = status === 'VALID';
    });
  }

  private _routeToEditView(): void {
    this._router.navigate(['/user/edit', 'permissions', this.internalUserInfoId]);
  }

  private _routeToUserAdminInternal(): void {
    this._router.navigate(['/user-admin-internal']);
  }

  private _saveAllChanges(): void {
    if (!this.permissionsComponent?.permissionsFormChanged()) {
      this._polarisNotificationService.info(this._translate.instant('notifications.no-changes-detected'));

      return;
    }

    // Show loader while saving
    this.showLoader = true;

    const savePermissions$ = this._userAdministrationService.updatePermissions$(
      this._internalUserInfo.getValue()?.claims?.userName as string,
      this._internalUserInfo.getValue()?.claims?.accountNumber as string,
      this._permissions.getValue()?.pages as PermissionPage[]
    );

    const updatedUserInfo = this._internalUserInfo.getValue() as BaseUserInfo<PortalUserInternalClaim>;
    const {
      helpDeskNumber,
      accountImpersonationPermission,
      internalImpersonationPermission,
      isActive,
      isOptimizelyPortalAdmin,
      isOptimizelyLanguageAdmin,
      isOptimizelyContentAdmin,
      email,
      givenName,
      familyName,
      salesRepId,
      salesRole
    } = this.permissionsComponent.permissionsForm.value;
    updatedUserInfo.claims = {
      ...updatedUserInfo.claims,
      helpDeskNumber,
      accountImpersonationPermission,
      internalImpersonationPermission,
      isActive: String(isActive?.toLowerCase() === 'true'),
      isOptimizelyPortalAdmin: String(isOptimizelyPortalAdmin?.toLowerCase() === 'true'),
      isOptimizelyLanguageAdmin: String(isOptimizelyLanguageAdmin?.toLowerCase() === 'true'),
      isOptimizelyContentAdmin: String(isOptimizelyContentAdmin?.toLowerCase() === 'true'),
      email,
      givenName,
      familyName,
      salesRepId,
      salesRole
    } as PortalUserInternalClaim;

    const saveAdditionalClaims$ = this._userInfoManagementApiService.updateUserInfo$(updatedUserInfo);
    forkJoin([savePermissions$, saveAdditionalClaims$])
      .pipe(
        tap(() => {
          this._polarisNotificationService.success(this._translate.instant('notifications.permissions-saved'));
          this._router.navigate(['/user/details', 'permissions', this.internalUserInfoId],
            {
              state: {
                bypassCanDeactivate: true,
                isAddPermissionsView: false,
              }
            });
        }),
        finalize((): void => {
          this.showLoader = false;
        }),
        untilDestroyed(this),
      ).subscribe();
  }

  public storePermissionsChanges(permissions: Permissions): void {
    this._permissions.next(permissions);
  }

  /**
   * Determines whether the user can navigate away from the current page.
   *
   * This function checks if Permissions has unsaved changes and prompts
   * the user for confirmation if there are any. If the form is not dirty, it allows
   * navigation without any prompt.
   *
   * @returns - Returns `true` if the user can navigate away, otherwise
   * prompts the user and returns the result of the confirmation dialog.
   */
  public canDeactivate(): boolean {
    if (this.permissionsComponent?.permissionsFormChanged()) {
      // TODO: This should be replaced with a proper confirmation dialog
      return confirm(this._translate.instant('unsaved-changes-confirmation'));
    }

    return true;
  }
}
