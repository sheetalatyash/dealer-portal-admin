import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import {
  BaseEntity,
  CommunicationCategory,
  DealerOptions,
  ProductLine,
  User,
} from '@classes';
import {
  Account,
  CoreData,
  CoreService,
  EmployeeStatusCode,
  GetUsersOptions,
  UserAccount,
} from '@dealer-portal/polaris-core';
import { PolarisNavigationTab } from '@dealer-portal/polaris-ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { UserAdministrationApiService } from '../user-administration-api/user-administration.api.service';
import { Observable, take, tap } from 'rxjs';
import { UserTypes } from './user-types.enum';

export interface ErrorPayload {
  page: string,
  category?: string,
  control?: string,
  messages?: string[],
  customSortOrder?: number,
}

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class UserAdministrationService {

  private readonly _initialUserAdministrationNavigationTabs: PolarisNavigationTab[] = [
    {
      label: this._translate.instant('active-users'),
      code: EmployeeStatusCode.Active,
      id: 'active-tab',
      selected: true,
      disabled: false,
    },
    {
      label: this._translate.instant('pending-users-tab-name'),
      code: EmployeeStatusCode.ActivePendingVerification,
      id: 'pending-tab',
      selected: false,
      disabled: false,
    },
    {
      label: this._translate.instant('inactive-users'),
      code: EmployeeStatusCode.Inactive,
      id: 'inactive-tab',
      selected: false,
      disabled: false,
    },
  ];

  private readonly _initialUserPageNavigationTabs: PolarisNavigationTab[] = [
    {
      label: this._translate.instant('profile'),
      code: 0,
      id: 'profile',
      selected: true,
      disabled: false,
    },
    {
      label: this._translate.instant('permissions'),
      code: 1,
      id: 'permissions',
      selected: false,
      disabled: false,
    },
    {
      label: this._translate.instant('communications'),
      code: 2,
      id: 'communications',
      selected: false,
      disabled: false,
    },
  ];

  public limitedCustomerClassCodes: string[] = ['opr', 'own', 'and'];
  public limitedPartnerTypes: string[] = ['distributor', 'subsidiary'];
  public limitedDealerOfPartnerTypes: string[] = ['dealer of distributor', 'dealer of subsidiary'];

  // Account flags
  public readonly isLimitedDealerOfPartnerType: Signal<boolean> = computed(() => {
    const dealer: Account | null = this.selectedDealer();
    const partnerType: string | null = dealer?.partnerType?.toLowerCase() ?? null;

    return partnerType !== null && this.limitedDealerOfPartnerTypes.includes(partnerType);
  });

  public readonly isLimitedCustomerClass: Signal<boolean> = computed(() => {
    const dealer: Account | null = this.selectedDealer();
    const classCode: string | null = dealer?.classCode?.toLowerCase() ?? null;

    return classCode !== null && this.limitedCustomerClassCodes.includes(classCode);
  });

  public readonly isLimitedPartnerType: Signal<boolean> = computed(() => {
    const dealer: Account | null = this.selectedDealer();
    const partnerType: string | null = dealer?.partnerType?.toLowerCase() ?? null;

    return partnerType !== null && this.limitedPartnerTypes.includes(partnerType);
  });

  public readonly isWebInfinityEligible: Signal<boolean> = computed(() =>
    this.isLimitedDealerOfPartnerType() || this.isLimitedPartnerType()
  );

  public spiffSelected: WritableSignal<boolean> = signal(false);
  public readonly isSpiffEligible: Signal<boolean> = computed(() =>
    !this.isLimitedPartnerType() &&
    !this.isLimitedDealerOfPartnerType() &&
    !this.isLimitedCustomerClass()
  );

  public readonly isPointsEligible: Signal<boolean> = computed(() =>
    !this.isLimitedDealerOfPartnerType() &&
    !this.isLimitedCustomerClass()
  );

  public readonly isProductLineEligible: Signal<boolean> = computed(() =>
    !this.isLimitedCustomerClass()
  );

  public readonly isJobTitleRequired: Signal<boolean> = computed(() =>
    !this.isLimitedDealerOfPartnerType()
  );

  public readonly isPhoneFormatRequired: Signal<boolean> = computed(() =>
    !this.isLimitedDealerOfPartnerType() &&
    !this.isLimitedPartnerType()
  );

  public readonly isServiceStaffRoleEligible: Signal<boolean> = computed(() =>
    !this.isLimitedCustomerClass()
  );
  public isStaffRole: WritableSignal<boolean> = signal(false);
  public isServiceDepartment: WritableSignal<boolean> = signal(false);
  public readonly showServiceStaffRolePanel: Signal<boolean> = computed(() =>
    this.isStaffRole() &&
    this.isServiceDepartment() &&
    this.isServiceStaffRoleEligible()
  );

  // Signals for each form’s validity
  public contactInfoFormInvalid: WritableSignal<boolean> = signal(false);
  public departmentsFormInvalid: WritableSignal<boolean> = signal(false);
  public employmentFormInvalid: WritableSignal<boolean> = signal(false);
  public productLinesFormInvalid: WritableSignal<boolean> = signal(false);
  public rolesFormInvalid: WritableSignal<boolean> = signal(false);
  public serviceStaffRolesFormInvalid: WritableSignal<boolean> = signal(false);
  // aggregate computed signal
  public userDetailsFormsInvalid: Signal<boolean> = computed(() =>
    this.contactInfoFormInvalid() ||
    this.departmentsFormInvalid() ||
    this.employmentFormInvalid() ||
    this.productLinesFormInvalid() ||
    this.rolesFormInvalid() ||
    this.serviceStaffRolesFormInvalid()
  );
  private readonly _errors: WritableSignal<Map<string, ErrorPayload>> = signal<Map<string, ErrorPayload>>(new Map());
  public errorPayloads: Signal<ErrorPayload[]> = computed(() => Array.from(this._errors().values()));

  // one signal per form section
  public activityFormChanged: WritableSignal<boolean> = signal<boolean>(false);
  public employmentFormChanged: WritableSignal<boolean> = signal<boolean>(false);
  public contactInfoFormChanged: WritableSignal<boolean> = signal<boolean>(false);
  public departmentsFormChanged: WritableSignal<boolean> = signal<boolean>(false);
  public productLinesFormChanged: WritableSignal<boolean> = signal<boolean>(false);
  public rolesFormChanged: WritableSignal<boolean> = signal<boolean>(false);
  public serviceStaffRolesFormChanged: WritableSignal<boolean> = signal<boolean>(false);
  // aggregate computed signal
  public readonly userFormChanged: Signal<boolean> = computed(() =>
    this.activityFormChanged() ||
    this.employmentFormChanged() ||
    this.contactInfoFormChanged() ||
    this.departmentsFormChanged() ||
    this.productLinesFormChanged() ||
    this.rolesFormChanged() ||
    this.serviceStaffRolesFormChanged()
  );

  public userAdministrationNavigationTabs: WritableSignal<PolarisNavigationTab[]> = signal<PolarisNavigationTab[]>(this._initialUserAdministrationNavigationTabs);
  public userPageNavigationTabs: WritableSignal<PolarisNavigationTab[]> = signal<PolarisNavigationTab[]>(this._initialUserPageNavigationTabs);
  public activeSearchTerm: WritableSignal<string> = signal<string>('');
  public activePortalAuthenticationId: WritableSignal<string | null> = signal<string | null>(null);
  public userDetails: WritableSignal<User | null> = signal<User | null>(null);
  public dealerOptions: WritableSignal<DealerOptions | null> = signal<DealerOptions | null>(null);
  // Represents all users for the selected dealer
  public users: WritableSignal<User[] | null> = signal<User[] | null>(null);
  // Represents active users for the selected dealer
  public activeUsers: WritableSignal<User[] | null> = signal<User[] | null>(null);
  // Represents inactive users for the selected dealer
  public inactiveUsers: WritableSignal<User[] | null> = signal<User[] | null>(null);
  // Represents pending users for the selected dealer
  public pendingUsers: WritableSignal<User[] | null> = signal<User[] | null>(null);
  public communicationCategories: WritableSignal<CommunicationCategory[]> = signal<CommunicationCategory[]>([]);
  public userInfo: WritableSignal<UserAccount | null> = signal<UserAccount | null>(null);
  public selectedDealer: WritableSignal<Account | null> = signal<Account | null>(null);
  public coreData: WritableSignal<CoreData | null> = signal<CoreData | null>(null);

  constructor(
    private readonly _coreService: CoreService,
    // TODO: Call to this app-level API service should be phased out and migrated to polaris-core version
    private _oldUserAdministrationApiService: UserAdministrationApiService,
    private _translate: TranslateService
  ) {}

  /** Recursive method to find an account by account number
   *  either at the top level or in hierarchy
   **/
  private _findAccountByNumber(accounts: Account[] | undefined, acctNumToFind: string): Account | null {
    if (!accounts) {
      return null;
    }
    for (const acct of accounts) {
      if (acct.accountNumber === acctNumToFind) {
        return acct;
      }
      const hierarchyAcct: Account | null = this._findAccountByNumber(acct.hierarchy as Account[] | undefined, acctNumToFind);
      if (hierarchyAcct) {
        return hierarchyAcct;
      }
    }

    return null;
  }

  public setUserFormChanged(formChanged: boolean): void {
    this.activityFormChanged.set(formChanged);
    this.employmentFormChanged.set(formChanged);
    this.contactInfoFormChanged.set(formChanged);
    this.departmentsFormChanged.set(formChanged);
    this.productLinesFormChanged.set(formChanged);
    this.rolesFormChanged.set(formChanged);
    this.serviceStaffRolesFormChanged.set(formChanged);
  }

  public resetFormInvalidSignals(formInvalid: boolean): void {
    this.contactInfoFormInvalid.set(formInvalid);
    this.departmentsFormInvalid.set(formInvalid);
    this.employmentFormInvalid.set(formInvalid);
    this.productLinesFormInvalid.set(formInvalid);
    this.rolesFormInvalid.set(formInvalid);
    this.serviceStaffRolesFormInvalid.set(formInvalid);
  }

  public markFormsAsTouched(controls: Array<AbstractControl | undefined>): void {
    controls.forEach((control: AbstractControl | undefined): void => {
      if (control) {
        control.markAllAsTouched();
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    })
  }


  public setUserInfo(userAccount: UserAccount, updateUsers: boolean = false): void {
    this.userInfo.set(userAccount);

    // Conditionally set the selected dealer if none is set yet
    if (this.selectedDealer() === null) {

      let userAssignedDealer: Account | null = this._findAccountByNumber(userAccount.accounts, userAccount.accountNumber);

      if (!userAssignedDealer && userAccount.isImpersonating) {
        const newAccount: Account = new Account();
        newAccount.accountNumber = userAccount.accountNumber;
        newAccount.accountName = userAccount.accountName;
        newAccount.systemId = userAccount.systemId as string;
        newAccount.classCode = userAccount.classCode as string;
        newAccount.employeeId = userAccount.empid;
        newAccount.partnerType = userAccount.partnerType as string;

        userAssignedDealer = newAccount;
        userAccount.accounts = [newAccount];
        this.userInfo.set(userAccount);
      }

      // If no dealer is found, log a warning and reset users and selected dealer
      if (!userAssignedDealer) {
        this.users.set([]);
        this.activeUsers.set([]);
        this.inactiveUsers.set([]);
        this.pendingUsers.set([]);
        this.selectedDealer.set(null);

        return;
      }

      this.setSelectedDealer(userAssignedDealer, true);

    } else if (updateUsers && this.selectedDealer() !== null) {
      // Conditionally fetch users if specified and a dealer is already selected
      this.getUsers();
      this.getUsersForSelectedTab();
    }
  }

  public setSelectedDealer(dealer: Account | null, isOnInit: boolean = false): void {
    const newDealerSelected: boolean = this.selectedDealer()?.accountNumber !== dealer?.accountNumber;

    // Set the selected dealer and fetch the users if dealer has changed or on initial page load
    if (isOnInit || newDealerSelected) {
      this.selectedDealer.set(dealer);
      this.getUsers();
      this.getUsersForSelectedTab();
    }
  }

  public getUsers(userType: UserTypes = UserTypes.All): void {
    const dealer: Account | null = this.selectedDealer();

    // Only fetch users if a dealer is selected
    if (!dealer) return;

    // Based on the user type to fetch, determine which signal to update and options to pass
    let userSignalToUpdate: WritableSignal<User[] | null>;
    let options: GetUsersOptions = {};
    switch (userType) {
      case UserTypes.Active:
        userSignalToUpdate = this.activeUsers;
        options = { onlyActive: true };
        break;
      case UserTypes.Inactive:
        userSignalToUpdate = this.inactiveUsers;
        options = { onlyInactive: true };
        break;
      case UserTypes.Pending:
        userSignalToUpdate = this.pendingUsers;
        options = { onlyInactive: true, onlyActive: true };
        break;
      case UserTypes.All:
      default:
        userSignalToUpdate = this.users;
        break;
    }

    userSignalToUpdate.set(null);

    this._oldUserAdministrationApiService.getUsers$(dealer.accountNumber, options).pipe(
      tap((users: User[]): void => {
        const mappedUsers: User[] = users.map((userData: User) => new User(userData));
        userSignalToUpdate.set(mappedUsers);
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  public getUsersForSelectedTab(): void {
    // Find the selected tab and fetch users for that tab
    const selectedTab: PolarisNavigationTab | undefined = this.userAdministrationNavigationTabs().find((tab: PolarisNavigationTab): boolean => tab.selected);
    if (selectedTab) {
      switch(selectedTab.code as EmployeeStatusCode) {
        case EmployeeStatusCode.Active:
          this.getUsers(UserTypes.Active);
          break;
        case EmployeeStatusCode.Inactive:
          this.getUsers(UserTypes.Inactive);
          break;
        case EmployeeStatusCode.ActivePendingVerification:
          this.getUsers(UserTypes.Pending);
          break;
      }
    }
  }

  public getUserDetails(userId: string): void {
    const dealer: Account = this.selectedDealer() as Account;

    this._oldUserAdministrationApiService.getUser$(dealer.accountNumber, userId).pipe(
      tap((userDetails: User): void => {
        this.setUserDetails(userDetails);
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  public updateUser$(updatedUserDetails: User): Observable<User> {
    const dealer: Account = this.selectedDealer() as Account;

    return this._oldUserAdministrationApiService.updateUser$(
      dealer.accountNumber,
      updatedUserDetails.portalAuthenticationId,
      updatedUserDetails,
    );
  }

  public addNewUser(userDetails: User): Observable<string> {
    const dealer: Account = this.selectedDealer() as Account;

    return this._oldUserAdministrationApiService.addNewUser$(dealer.accountNumber, userDetails);
  }

  public setCommunicationCategories(communicationCategories: CommunicationCategory[]): void {
    this.communicationCategories.set(communicationCategories);
  }

  public setUserDetails(userDetails: User | null): void {
    this.userDetails.set(userDetails);
  }

  public setUserPageNavigationTabs(navigationTabs: PolarisNavigationTab[]): void {
    this.userPageNavigationTabs.set(navigationTabs);
  }

  public updateActiveUserAdministrationTab(updatedTab: PolarisNavigationTab): void {
    this.userAdministrationNavigationTabs.update((tabs: PolarisNavigationTab[]) =>
      tabs.map((tab: PolarisNavigationTab): PolarisNavigationTab => ({ ...tab, selected: tab.code === updatedTab.code }))
    );
  }

  public updateActiveUserPageTab(updatedTab: PolarisNavigationTab): void {
    this.userPageNavigationTabs.update((tabs: PolarisNavigationTab[]) =>
      tabs.map((tab: PolarisNavigationTab): PolarisNavigationTab => ({ ...tab, selected: tab.code === updatedTab.code }))
    );
  }

  public updateActiveSearchTerm(updatedSearchTerm: string): void {
    this.activeSearchTerm.set(updatedSearchTerm);
  }

  public updateActivePortalAuthenticationId(updatedPortalAuthenticationId: string | null): void {
    this.activePortalAuthenticationId.set(updatedPortalAuthenticationId);
  }

  public setError(payload: ErrorPayload): void {
    const key: string = `${payload.page}|${payload.category ?? ''}|${payload.control ?? ''}`;

    this._errors.update((current: Map<string, ErrorPayload>) => {
      const next: Map<string, ErrorPayload> = new Map(current);

      if (!payload.messages || payload.messages.length === 0) {
        next.delete(key);
      } else {
        next.set(key, payload);
      }

      return next;
    });
  }

  /** Clear all user lists */
  public clearAllUsers() : void {
    this.users.set(null);
    this.activeUsers.set(null);
    this.inactiveUsers.set(null);
    this.pendingUsers.set(null);
  }

  /** Clear all errors */
  public clearErrors(): void {
    this._errors.set(new Map());
  }

  public fetchDealerOptions(): void {
    const dealer: Account = this.selectedDealer() as Account;

    this._oldUserAdministrationApiService.fetchDealerOptions$(dealer.accountNumber).pipe(
      take(1),
      tap((dealerOptions: DealerOptions): void => this.dealerOptions.set(dealerOptions)),
    ).subscribe();
  }

  public fetchCoreData(): void {
    const coreDataNeeded = {
      departments: true,
      productLineByBusinessUnit: true,
      productLineByFamily: true,
      serviceStaffRoles: true,
      staffRoles: true,
      employmentTypes: true,
    };

    this._coreService.getCoreData$(coreDataNeeded).pipe(
      take(1),
      tap((data: CoreData): void => this.coreData.set(data)),
    ).subscribe();
  }

  public getMappedUserDetails(
    activityForm: FormGroup,
    selectedEmploymentType: BaseEntity,
    contactInfoForm: FormGroup,
    departments: BaseEntity[],
    productLines: ProductLine[],
    role: BaseEntity,
    serviceStaffRoles: BaseEntity[],
  ): User {
    const userDetails: User = structuredClone(this.userDetails()) as User;

    // Set Dealer ID
    const dealer: Account = this.selectedDealer() as Account;
    userDetails.dealerId = dealer.accountNumber;

    // Contact Info
    userDetails.userName = contactInfoForm.get('userName')?.value as string;
    userDetails.emailAddress = contactInfoForm.get('userName')?.value as string;
    userDetails.firstName = contactInfoForm.get('firstName')?.value as string;
    userDetails.lastName = contactInfoForm.get('lastName')?.value as string;
    userDetails.jobTitle = contactInfoForm.get('jobTitle')?.value as string;
    const phone: string = contactInfoForm.get('phone')?.value ?? '';
    userDetails.phone = phone.replace(/\D/g, '');

    // Activity
    userDetails.active = activityForm.get('Active User')?.value as boolean;
    userDetails.admin = activityForm.get('Security Admin Access')?.value as boolean;
    userDetails.pointsEligible = activityForm.get('Eligible for Points')?.value as boolean;
    userDetails.spiffEligible = activityForm.get('Eligible for Spiffs')?.value as boolean;
    userDetails.isPrimaryCommunicationContact = activityForm.get('Primary communication contact')?.value as boolean;
    userDetails.shareToWebInfinity = activityForm.get('Access to INTL dealer portal (Web Infinity)')?.value as boolean;

    // Employment Type
    userDetails.employmentType = selectedEmploymentType;

    // Departments
    userDetails.departments = departments;

    // Role
    userDetails.staffRole = role;

    // Service Staff Roles
    userDetails.serviceStaffRoles = serviceStaffRoles;

    // Product Lines
    userDetails.productLines = productLines;

    return userDetails;
  }

  public fetchCommunicationCategories$(
    portalAuthenticationId: string,
    userName: string,
  ): void {
    const dealer: Account = this.selectedDealer() as Account;

    this._oldUserAdministrationApiService.getCommunicationCategories$(dealer.accountNumber, portalAuthenticationId, userName).pipe(
      take(1),
      tap((communicationCategories: CommunicationCategory[]): void => {
        const mappedCommunicationCategories: CommunicationCategory[] = communicationCategories.map(
          (communicationCategory: CommunicationCategory) => new CommunicationCategory(communicationCategory));
        this.communicationCategories.set(mappedCommunicationCategories);
      }),
    ).subscribe();
  }

  public updateCommunicationCategories$(
    portalAuthenticationId: string,
    communicationCategories?: CommunicationCategory[],
  ): Observable<CommunicationCategory[]> {

    const dealer: Account = this.selectedDealer() as Account;
    const updatedCommunicationCategories: CommunicationCategory[] = communicationCategories || this.communicationCategories();

    return this._oldUserAdministrationApiService.updateCommunicationCategories$(dealer.accountNumber, portalAuthenticationId, updatedCommunicationCategories);
  }

  public resendVerificationEmail$(userName: string): Observable<boolean> {
    const dealer: Account = this.selectedDealer() as Account;

    return this._oldUserAdministrationApiService.resendVerificationEmail$(dealer.accountNumber, userName);
  }

}
