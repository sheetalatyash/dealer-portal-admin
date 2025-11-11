import { AccountUserResponse } from "@dealer-portal/polaris-core";

export class AccountUser {

  public admin: boolean = false;
  public departments:string = '';
  public employment: string = '';
  public firstName: string = '';
  public lastName: string = '';
  public points: boolean = false;
  public portalAuthenticationId: string = '';
  public primaryContact: boolean = false;
  public serviceEmployee: boolean = false;
  public spiff: boolean = false;
  public role: string = '';
  public userName: string = '';

  constructor(accountUserResponse: Partial<AccountUserResponse>) {
    this.admin = accountUserResponse?.admin ?? false;
    this.departments = accountUserResponse?.departmentString ?? '';
    this.employment = accountUserResponse?.employmentTypeString ?? '';
    this.firstName = accountUserResponse?.firstName ?? '';
    this.lastName = accountUserResponse?.lastName ?? '';
    this.points = accountUserResponse?.pointsEligible ?? false;
    this.portalAuthenticationId = accountUserResponse?.portalAuthenticationId ?? '';
    this.primaryContact = accountUserResponse?.isPrimaryCommunicationContact ?? false;
    this.serviceEmployee = accountUserResponse?.employeeStatusCode === 1;
    this.spiff = accountUserResponse?.spiffEligible ?? false;
    this.role = accountUserResponse?.roleString ?? '';
    this.userName = accountUserResponse?.emailAddress ?? '';
  }
}
