import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  OnDestroy,
  Signal,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Event as RouterEvent, NavigationEnd, Router } from '@angular/router';
import { BaseEntity, DealerOptions, User } from '@classes';
import {
  UnsavedChangesDialogComponent
} from '@components/_user-templates/unsaved-changes-dialog/unsaved-changes-dialog.component';
import { ErrorListComponent } from '@components/error-list/error-list.component';
import {
  AccessControlDirective,
  AccessControlLevel,
  Account,
  CanComponentDeactivate,
  UserAccountService,
} from '@dealer-portal/polaris-core';
import {
  ButtonAction,
  ButtonConfig,
  PolarisAccordion,
  PolarisButton,
  PolarisDialogService,
  PolarisExpansionPanel,
  PolarisHeading,
  PolarisLoader,
  PolarisNavigationTab,
  PolarisNotificationService,
  PolarisTabBar,
  PolarisThemeLevel,
} from '@dealer-portal/polaris-ui';
import { EmploymentTypeCode, EmploymentTypeName, Route } from '@enums';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ErrorPayload, PermissionsService, UserAdministrationService } from '@services';
import {
  ActivityTemplateComponent,
  CommunicationsTemplateComponent,
  ContactInfoTemplateComponent,
  DepartmentsTemplateComponent,
  PermissionsTemplateComponent,
  ProductLinesTemplateComponent,
  RolesTemplateComponent,
  StaffRolesTemplateComponent,
} from 'apps/user-administration/src/_components/_user-templates';
import * as _ from 'lodash';
import { catchError, filter, forkJoin, Observable, of, switchMap, tap, throwError, timeout, TimeoutError } from 'rxjs';

export interface PreviousState {
  dealerOptions: DealerOptions | null,
  selectedDealer: Account | null,
  navigationTabs: PolarisNavigationTab[] | null,
  userDetails: User | null,
  portalAuthenticationId: string | null,
  users: User[] | null,
}

@UntilDestroy()
@Component({
  selector: 'ua-user',
  imports: [
    CommonModule,
    PolarisHeading,
    PolarisButton,
    PolarisLoader,
    ActivityTemplateComponent,
    ContactInfoTemplateComponent,
    DepartmentsTemplateComponent,
    RolesTemplateComponent,
    StaffRolesTemplateComponent,
    ProductLinesTemplateComponent,
    ReactiveFormsModule,
    PermissionsTemplateComponent,
    CommunicationsTemplateComponent,
    TranslatePipe,
    PolarisAccordion,
    PolarisExpansionPanel,
    AccessControlDirective,
    PolarisTabBar,
    ErrorListComponent,
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserComponent implements OnDestroy, CanComponentDeactivate {
  @ViewChild(ActivityTemplateComponent) activityComponent!: ActivityTemplateComponent;
  @ViewChild(ContactInfoTemplateComponent) contactInfoComponent!: ContactInfoTemplateComponent;
  @ViewChild(DepartmentsTemplateComponent) departmentsComponent!: DepartmentsTemplateComponent;
  @ViewChild(CommunicationsTemplateComponent) communicationsComponent!: CommunicationsTemplateComponent;
  @ViewChild(PermissionsTemplateComponent) permissionsComponent!: PermissionsTemplateComponent;
  @ViewChild(PolarisAccordion) userPageAccordion!: PolarisAccordion;
  @ViewChild(ProductLinesTemplateComponent) productLinesComponent!: ProductLinesTemplateComponent;
  @ViewChild(RolesTemplateComponent) rolesComponent!: RolesTemplateComponent;
  @ViewChild(StaffRolesTemplateComponent) serviceStaffRolesComponent!: StaffRolesTemplateComponent;

  readonly Route: typeof Route = Route;

  public readonly accessControlLevel: typeof AccessControlLevel = AccessControlLevel;

  public availableUserPageActions: ButtonAction[] = [
    ButtonAction.Edit,
    ButtonAction.SaveChanges,
    ButtonAction.SaveAndContinue,
    ButtonAction.Reset,
    ButtonAction.Exit,
  ];

  public isDetailsView: boolean = false;
  public isEditView: boolean = false;
  public isAddView: boolean = false;
  public isAddPermissionsView: boolean = false;
  public isAddCommunicationsView: boolean = false;
  public portalAuthenticationId: string | null = null;
  public tabId: string = 'profile';
  public pageHeader: string = this.tabId;

  public userPageActionButtons: WritableSignal<ButtonConfig[]> = signal([]);


  // Flags for various options/panels
  public showServiceStaffRolePanel: Signal<boolean> = computed(() => this._userAdministrationService.showServiceStaffRolePanel());
  public showProductLinesPanel: Signal<boolean> = computed(() => this._userAdministrationService.isProductLineEligible());
  public showPoints: Signal<boolean> = computed(() => this._userAdministrationService.isPointsEligible());
  public showSpiffs: Signal<boolean> = computed(() => this._userAdministrationService.isSpiffEligible());
  public showWebInfinity: Signal<boolean> = computed(() => this._userAdministrationService.isWebInfinityEligible());

  // State Management
  private _previousState: PreviousState = {
    dealerOptions: null,
    selectedDealer: null,
    navigationTabs: null,
    userDetails: null,
    portalAuthenticationId: null,
    users: null,
  }

  // Load/Http Management
  public loadingUserDetails: WritableSignal<boolean> = signal(false);
  public savingNewUser: WritableSignal<boolean> = signal(false);
  public savingExistingUser: WritableSignal<boolean> = signal(false);

  // Resource Management
  public readonly userDetails: WritableSignal<User | null> = this._userAdministrationService.userDetails;
  public readonly dealerOptions: WritableSignal<DealerOptions | null> = this._userAdministrationService.dealerOptions;
  public readonly userPageNavigationTabs: WritableSignal<PolarisNavigationTab[]> = this._userAdministrationService.userPageNavigationTabs;

  public readonly errorPayloads: Signal<ErrorPayload[]> = computed(() => this._userAdministrationService.errorPayloads());

  public readonly showLoader: Signal<boolean> = computed(() =>
    this.loadingUserDetails() ||
    this.savingNewUser() ||
    this.savingExistingUser()
  );

  public readonly userFullName: WritableSignal<string> = signal<string>('');

  constructor(
    private _dialogService: PolarisDialogService,
    private _userAdministrationService: UserAdministrationService,
    private _polarisNotificationService: PolarisNotificationService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _translateService: TranslateService,
    private _userAccountService: UserAccountService,
    private _permissionsService: PermissionsService,
  ) {
    this._setAddViewStatus();
    this._userAdministrationService.setUserInfo(this._userAccountService.userAccount);
    this._fetchDealerData();
    this._initSelectedDealerEffect();
    this._initNavigationTabsEffect();
    this._initUserDetailsEffect();
    this._initPortalAuthenticationIdEffect();

    this._subscribeToRouterEvents();

    this._initLoadIndicatorEffect();
  }

  public ngOnDestroy(): void {
    this.resetEverything();
  }

  public resetEverything(): void {

    // reset form status
    this._userAdministrationService.setUserFormChanged(false);
    this._permissionsService.permissionsChanged.set(false);
    this.communicationsComponent?.emailCommunicationsFormChanged.set(false);
    this.communicationsComponent?.notificationCommunicationsFormChanged.set(false);
    this._userAdministrationService.resetFormInvalidSignals(false);
    this._userAdministrationService.clearErrors();

    // clear form data
    this.permissionsComponent?.permissionsWithClaims().reset({});
    this._userAdministrationService.communicationCategories.set([]);

    // clear user data
    this._permissionsService.clearAllPermissions();
    this._userAdministrationService.userDetails.set(null);

    // reset navigation tabs
    const navigationTabs: PolarisNavigationTab[] = this.userPageNavigationTabs();
    this._userAdministrationService.updateActiveUserPageTab(navigationTabs[0]);

  }

  private _initSelectedDealerEffect(): void {
    effect((): void => {
      const selectedDealer: Account | null = this._userAdministrationService.selectedDealer();
      if (!selectedDealer || _.isEqual(this._previousState.selectedDealer, selectedDealer)) return;

      this._previousState.selectedDealer = selectedDealer;
      this._userAdministrationService.setSelectedDealer(selectedDealer);
    });
  }

  private _initLoadIndicatorEffect(): void {
    effect((): void => {
      const selectedDealer: Account | null = this._userAdministrationService.selectedDealer();
      const dealerOptions: DealerOptions | null = this._userAdministrationService.dealerOptions();
      const users: User[] | null = this._userAdministrationService.users();
      const userDetails: User | null = this.userDetails();

      if (!selectedDealer || !dealerOptions || !users || !userDetails) {
        this.loadingUserDetails.set(true);
      } else {
        this.loadingUserDetails.set(false);
      }
    });
  }

  private _initNavigationTabsEffect(): void {
    effect((): void => {
      const navigationTabs: PolarisNavigationTab[] = this.userPageNavigationTabs();
      if (!navigationTabs || _.isEqual(this._previousState.navigationTabs, navigationTabs)) return;

      this._previousState.navigationTabs = navigationTabs;
      this._configurePageData(window.location.href, navigationTabs);
    });
  }

  private _initUserDetailsEffect(): void {
    effect((): void => {
      const userDetails: User | null = this.userDetails();

      if (!userDetails || this.isAddView || _.isEqual(this._previousState.userDetails, userDetails)) return;

      this._previousState.userDetails = userDetails;
      this._setUserDetails(userDetails);
    });
  }

  private _initPortalAuthenticationIdEffect(): void {
    effect((): void => {
      const portalAuthenticationId: string | null = this._userAdministrationService.activePortalAuthenticationId();
      if (!portalAuthenticationId || _.isEqual(this._previousState.portalAuthenticationId, portalAuthenticationId)) return;

      this._previousState.portalAuthenticationId = portalAuthenticationId;
      this._userAdministrationService.getUserDetails(portalAuthenticationId);
    });
  }

  private _setAddViewStatus(): void {
    this.isAddView = this._router.url.includes('/user/add');

    if (this.isAddView) {
      this._resetAsNewUser();
    }
  }

  private _resetAsNewUser(): void {
    const newUser: User = new User({
      active: true,
      productLines: this.dealerOptions()?.productLines ?? [],
    });

    this._userAdministrationService.setUserDetails(newUser);
  }

  private _setUserDetails(userDetails: User): void {
    if (!this.isAddView && this.portalAuthenticationId !== userDetails.portalAuthenticationId) {
      return;
    }

    if (userDetails.employmentType) {
      const { id, name } = userDetails.employmentType;

      if (
        (id as EmploymentTypeCode) === EmploymentTypeCode.None ||
        (name as EmploymentTypeName) === EmploymentTypeName.None
      ) {
        userDetails.employmentType = new BaseEntity();
      }
    }

    this.loadingUserDetails.set(true);
    this._userAdministrationService.setUserDetails(userDetails);

    if (userDetails.firstName && userDetails.lastName) {
      this.userFullName.set(`${userDetails.firstName} ${userDetails.lastName}`);
    }

    if (userDetails.userName && userDetails.portalAuthenticationId) {
      this._fetchPermissions(userDetails.userName);
      this._userAdministrationService.fetchCommunicationCategories$(userDetails.portalAuthenticationId, userDetails.userName);
    }

    this.loadingUserDetails.set(false);
  }

  private _fetchDealerData(): void {
    this._userAdministrationService.fetchDealerOptions();
    this._userAdministrationService.fetchCoreData();
  }

  private _subscribeToRouterEvents(): void {
    this._router.events.pipe(
      filter((navigationEvent: RouterEvent): navigationEvent is NavigationEnd => navigationEvent instanceof NavigationEnd),
      tap((navigationEvent: NavigationEnd): void => {
        this._configurePageData(navigationEvent.url);
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  private _fetchPermissions(userName: string): void {
    this._permissionsService.fetchPermissions$(userName).pipe(
      switchMap(() => {
        if (this.isAddPermissionsView) {
          // Only apply defaults once during AddPermissionsView
          return this._permissionsService.applyDefaultPermissionsForNewUser(userName);
        }

        return of(null);
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  private _configurePageData(url: string, updatedNavigationTabs?: PolarisNavigationTab[] | null): void {
    const urlId: string = this._activatedRoute.snapshot.paramMap.get('id') as string;
    const urlTabId: string = this._activatedRoute.snapshot.paramMap.get('tabId') as string;
    this.isAddPermissionsView = history.state?.['isAddPermissionsView'] || false;
    this.isAddCommunicationsView = history.state?.['isAddCommunicationsView'] || false;
    const navigationTabs: PolarisNavigationTab[] | null = updatedNavigationTabs ?? this.userPageNavigationTabs();

    if (this.portalAuthenticationId !== urlId) {
      this.portalAuthenticationId = urlId;
      this._userAdministrationService.updateActivePortalAuthenticationId(this.portalAuthenticationId);
      this._updateUserActionButtons(url);
    }

    if (navigationTabs) {
      this.tabId = navigationTabs.find((tab: PolarisNavigationTab): boolean => tab.selected)?.id as string;
      this.pageHeader = this.isAddView ? this._translateService.instant('add-user') : this.tabId;

      navigationTabs.map((tab: PolarisNavigationTab): void => {
        tab.disabled = this.isAddView && tab.id !== 'profile' || this.isAddPermissionsView && tab.id === 'communications';
      });

      this._userAdministrationService.setUserPageNavigationTabs(navigationTabs);

      if (this.tabId !== urlTabId) {
        this.tabId = this.isAddView ? this.tabId : urlTabId;
        const selectedNavigationTab: PolarisNavigationTab = navigationTabs.find((tab: PolarisNavigationTab): boolean => tab.id === this.tabId) as PolarisNavigationTab;
        this.changeNavigationTab(selectedNavigationTab);
      }
    }

    this._updateUserActionButtons(url);
  }

  private _updateUserActionButtons(url: string): void {
    this.userPageActionButtons.set([]);
    this.isDetailsView = url.includes('user/details/');
    this.isEditView = url.includes('user/edit/');

    const userPageActionButtons: ButtonConfig[] = this.availableUserPageActions.map((action: ButtonAction): ButtonConfig =>
      new ButtonConfig({
        label: action,
        theme: this._getButtonThemeLevel(action),
        visible: this._getButtonVisibility(action),
      })
    );

    this.userPageActionButtons.set(userPageActionButtons);
  }

  /**
   * Determines the theme level for a button based on the specified action.
   *
   * @param action - The action type for which the button theme level is being determined.
   *                 It is of type `ButtonAction`, which includes actions like Edit, Save, Continue, etc.
   * @returns The theme level of the button as `PolarisThemeLevel`.
   *          Returns `PolarisThemeLevel.Primary` for Edit, Save, and Continue actions,
   *          otherwise returns `PolarisThemeLevel.Tertiary`.
   */
  private _getButtonThemeLevel(action: ButtonAction): PolarisThemeLevel {
    if (
      action === ButtonAction.Edit ||
      (action === ButtonAction.SaveAndContinue && (this.isAddView || this.isAddPermissionsView)) ||
      action === ButtonAction.SaveChanges
    ) {
      return PolarisThemeLevel.Primary;
    } else {
      return PolarisThemeLevel.Tertiary;
    }
  }

  /**
   * Determines the visibility of a button based on the current view state and action type.
   *
   * @param action - The action type for which the button visibility is being determined.
   *                 It is of type `ButtonAction` which includes actions like Edit, Save, Continue, etc.
   * @returns A boolean indicating whether the button should be visible (`true`) or not (`false`).
   */
  private _getButtonVisibility(action: ButtonAction): boolean {
    const isCommunications: boolean = this._router.url.includes('communications');

    const actionVisibilityMap: Record<ButtonAction, boolean> = {
      [ButtonAction.Edit]: this.isDetailsView,
      [ButtonAction.Save]: false,
      [ButtonAction.SaveChanges]: !this.isDetailsView && (isCommunications || !this.isAddView && !this.isAddPermissionsView),
      [ButtonAction.SaveAndContinue]: !this.isDetailsView && !isCommunications,
      [ButtonAction.Reset]: false,
      [ButtonAction.Cancel]: false,
      [ButtonAction.Exit]: true,
      [ButtonAction.Default]: false,
      [ButtonAction.Add]: false,
      [ButtonAction.Continue]: false,
    };

    return actionVisibilityMap[action] ?? false;
  }

  public changeNavigationTab(updatedNavigationTab: PolarisNavigationTab): void {
    // Update the active tab in the service
    this._userAdministrationService.updateActiveUserPageTab(updatedNavigationTab);
    // Prepare the new route
    this.tabId = updatedNavigationTab.id;
    const view: string = this.isEditView? 'edit' : 'details';
    const route: string[] = this.isAddView
      ? ['user/add', this.tabId]
      : [`user/${view}`, this.tabId, this.portalAuthenticationId as string];

    // Navigate without triggering the CanDeactivate guard
    this._router.navigate(route, {
      replaceUrl: true, // Avoid adding a new entry in history
      state: {
        bypassCanDeactivate: true,
        isAddPermissionsView: this.isAddPermissionsView,
        isAddCommunicationsView: this.isAddCommunicationsView,
      },
    });
  }

  public startUserPageAction(buttonConfig: ButtonConfig): void {
    switch(buttonConfig.label) {
      case ButtonAction.Edit:
        this._routeToEditView();
        break;
      case ButtonAction.Exit:
        this._routeToHome();
        break;
      case ButtonAction.SaveAndContinue:
        this._saveUserDetails();
        break;
      case ButtonAction.SaveChanges:
        this._saveUserDetails(true);
        break;
      default:
        return;
    }
  }

  private _routeToEditView(): void {
    this._router.navigate(['/user/edit', this.tabId, this.portalAuthenticationId]);
  }

  private _routeToHome(): void {
    this._userAdministrationService.activePortalAuthenticationId.set(null);
    this._router.navigate([Route.Home]);
  }

  public markAllFormsTouched(): void {
    this._userAdministrationService.markFormsAsTouched([
      this.activityComponent?.activityFormData()?.formGroup,
      this.activityComponent?.employmentFormData()?.formControl,
      this.contactInfoComponent?.contactInfoFormData()?.formGroup,
      this.departmentsComponent?.departmentsFormData()?.formGroup,
      this.productLinesComponent?.parentProductLinesForm,
      this.rolesComponent?.roleFormData()?.formControl,
      this.serviceStaffRolesComponent?.serviceStaffRoleFormData()?.formGroup,
    ]);

    if (!this.isAddView && this.permissionsComponent?.permissionsWithClaims()) {
      this._userAdministrationService.markFormsAsTouched([
        this.permissionsComponent.permissionsWithClaims()
      ]);
    }
  }

  private _saveUserDetails(bypassUserFlow: boolean = false): void {
    const requestTimeoutMS: number = 30000;
    // trigger any outstanding form validation
    this.markAllFormsTouched();

    // stop here if the user details form is invalid
    if (this._userAdministrationService.userDetailsFormsInvalid()) {
      return;
    }

    // stop here if the user is not in the 'add' view and permission claims are invalid
    if (!this.isAddView && this.permissionsComponent.permissionsWithClaims().invalid) {
      return;
    }

    const mappedUserDetails: User = this._userAdministrationService.getMappedUserDetails(
      this.activityComponent.activityFormData()?.formGroup as FormGroup,
      this.activityComponent.selectedEmploymentType() as BaseEntity,
      this.contactInfoComponent.contactInfoFormData()?.formGroup as FormGroup,
      this.departmentsComponent?.selectedDepartments(),
      this.productLinesComponent?.selectedProductLines(),
      this.rolesComponent?.selectedRole() as BaseEntity,
      this.serviceStaffRolesComponent?.selectedRoles() ?? [],
    );

    if (this.isAddView) {
      // Add new user
      this.savingNewUser.set(true);
      this._userAdministrationService.addNewUser(mappedUserDetails).pipe(
        timeout(requestTimeoutMS),
        tap((newUserId: string): void => {
          this._polarisNotificationService.success(this._translateService.instant('notifications.add-user-success'));

          this.savingNewUser.set(false);
          this._router.navigate(['/user/edit', 'permissions', newUserId],
            {
              state: {
                bypassCanDeactivate: true,
                isAddPermissionsView: true,
              },
            },
          );
        }),
        catchError((error: TimeoutError | HttpErrorResponse): Observable<unknown> => {
          this.savingNewUser.set(false);
          this.loadingUserDetails.set(false);
          this.savingExistingUser.set(false);

          if (error instanceof TimeoutError) {
            this._polarisNotificationService.danger(
              this._translateService.instant('errors.request-timeout')
            );
          } else {
            const httpError: HttpErrorResponse = error;
            if (httpError.status === 400 && httpError.error === 'User already exists at account.') {
              this.contactInfoComponent?.removeUserNames();
              this._polarisNotificationService.danger((error).error);
            }
          }

          return throwError((error as HttpErrorResponse).error);
        }),
        untilDestroyed(this),
      ).subscribe();
    } else {
      this._runUpdateUserFlow(mappedUserDetails, bypassUserFlow);
    }
  }

  private _runUpdateUserFlow(mappedUserDetails: User, bypassUserFlow: boolean): void {
    this.savingExistingUser.set(true);
    const updateTasks: Observable<unknown>[] = [];

    if (this._userAdministrationService.userFormChanged()) {
      updateTasks.push(this._userAdministrationService.updateUser$(mappedUserDetails));
    }

    if (this._permissionsService.permissionsChanged()) {
      updateTasks.push(this._permissionsService.updatePermissions$(mappedUserDetails.userName));
    }

    if (this.communicationsComponent?.communicationCategoriesChanged()) {
      updateTasks.push(
        this._userAdministrationService.updateCommunicationCategories$(mappedUserDetails.portalAuthenticationId),
      );
    }

    forkJoin(updateTasks.length ? updateTasks : [of(null)]).pipe(
      tap((): void => {
        // Tailor notifications
        let messageKey: string = 'notifications.update-user-success';
        if (this.isAddPermissionsView) {
          messageKey = 'notifications.permissions-saved';
        } else if (this.isAddCommunicationsView) {
          messageKey = 'notifications.communications-saved';
        }

        this._polarisNotificationService.success(this._translateService.instant(messageKey));

        // Handle tab flow logic
        let nextTabId: string = this.tabId;
        let nextTabMode: string = 'details';
        let nextState: Record<string, unknown> = { bypassCanDeactivate: true };

        if (bypassUserFlow) {
          nextTabId = this.tabId === 'communications' && this.isAddCommunicationsView ? 'profile' : this.tabId;
          nextState = {
            ...nextState,
            isAddPermissionsView: false,
            isAddCommunicationsView: false,
          };
        } else if (this.tabId === 'profile') {
          // Flow: Permissions Add → Communications Edit
          nextTabId = 'permissions';
          nextTabMode = 'edit';
          nextState = {
            ...nextState,
            isAddPermissionsView: this.isAddView,
            isAddCommunicationsView: false,
          };
        } else if (this.tabId === 'permissions') {
          // Flow: Permissions Add → Communications Edit
          nextTabId = 'communications';
          nextTabMode = 'edit';
          nextState = {
            ...nextState,
            isAddPermissionsView: false,
            isAddCommunicationsView: this.isAddPermissionsView,
          };
        } else if (this.tabId === 'communications') {
          // Flow: Communications Add → Profile Details
          nextTabId = 'profile';
          nextState = {
            ...nextState,
            isAddPermissionsView: false,
            isAddCommunicationsView: false,
          };
        } else {
          // Default flow
          nextState = {
            ...nextState,
            isAddPermissionsView: false,
            isAddCommunicationsView: false,
          };
        }

        this.savingExistingUser.set(false);

        this._router.navigate(
          [`/user/${nextTabMode}`, nextTabId, mappedUserDetails.portalAuthenticationId],
          { state: nextState },
        ).then(() => {
          // Once navigation completes, reload details with the *new* state applied
          const activePortalAuthenticationId: string | null = this._userAdministrationService.activePortalAuthenticationId();
          if (activePortalAuthenticationId) {
            this._userAdministrationService.getUserDetails(activePortalAuthenticationId);
          }
        });
      }),
      catchError((error: TimeoutError | HttpErrorResponse): Observable<unknown> => {
        this.savingNewUser.set(false);
        this.loadingUserDetails.set(false);
        this.savingExistingUser.set(false);

        if (error instanceof TimeoutError) {
          this._polarisNotificationService.danger(
            this._translateService.instant('errors.request-timeout')
          );
        } else {
          this._polarisNotificationService.danger((error).error);
        }

        return throwError((error as HttpErrorResponse).error);
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  /**
   * Determines whether the user can navigate away from the current page.
   *
   * This function checks if the user details form has unsaved changes and prompts
   * the user for confirmation if there are any. If the form is not dirty, it allows
   * navigation without any prompt.
   *
   * @returns - Returns `true` if the user can navigate away, otherwise
   * prompts the user and returns the result of the confirmation dialog.
   */
  public canDeactivate(): Observable<boolean> {
    // Check if any of the data has changed
    const changesExist: boolean =
      this._userAdministrationService.userFormChanged() ||
      this._permissionsService.permissionsChanged() ||
      this.communicationsComponent?.communicationCategoriesChanged();

    if (changesExist) {
      const htmlMessage: string =
        this.isAddView
          ? this._translateService.instant('unsaved-changes-warning')
          : this._translateService.instant('unsaved-changes-confirmation');

      return this._dialogService.open(UnsavedChangesDialogComponent, {
        width: '600px',
        disableClose: true,
        data: {
          htmlMessage,
          primaryButtonLabel: this._translateService.instant('buttons.continue-editing'),
          secondaryButtonLabel: this._translateService.instant('buttons.exit'),
          title: this._translateService.instant('title.unsaved-changes-dialog-title'),
        },
      });
    }

    return of(true);
  }
}
