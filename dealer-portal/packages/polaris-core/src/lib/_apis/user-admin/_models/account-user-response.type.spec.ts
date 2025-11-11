import { AccountUserResponse } from './account-user-response.type';

describe('AccountUserResponse', () => {
  let accountUserResponse: AccountUserResponse;

  beforeEach(() => {
    accountUserResponse = {
      active: true,
      admin: true,
      dealers: [{
        dealerId: "dealerIdString",
        dealerName: "dealerNameString",
        systemId: "systemIdString"
      }],
      departmentString: 'Sales',
      emailAddress: 'test@example.com',
      employeeStatusCode: 1,
      employmentTypeString: 'Full-Time',
      firstName: 'John',
      isPrimaryCommunicationContact: true,
      lastName: 'Doe',
      pointsEligible: true,
      portalAuthenticationId: 'auth123',
      roleString: 'Manager',
      spiffEligible: true,
    };
  });

  it('should create an instance of AccountUserResponse', () => {
    expect(accountUserResponse).toBeTruthy();
  });

  it('should have correct admin value', () => {
    expect(accountUserResponse.admin).toBe(true);
  });

  it('should have correct departmentString value', () => {
    expect(accountUserResponse.departmentString).toBe('Sales');
  });

  it('should have correct emailAddress value', () => {
    expect(accountUserResponse.emailAddress).toBe('test@example.com');
  });

  it('should have correct employeeStatusCode value', () => {
    expect(accountUserResponse.employeeStatusCode).toBe(1);
  });

  it('should have correct employmentTypeString value', () => {
    expect(accountUserResponse.employmentTypeString).toBe('Full-Time');
  });

  it('should have correct firstName value', () => {
    expect(accountUserResponse.firstName).toBe('John');
  });

  it('should have correct isPrimaryCommunicationContact value', () => {
    expect(accountUserResponse.isPrimaryCommunicationContact).toBe(true);
  });

  it('should have correct lastName value', () => {
    expect(accountUserResponse.lastName).toBe('Doe');
  });

  it('should have correct pointsEligible value', () => {
    expect(accountUserResponse.pointsEligible).toBe(true);
  });

  it('should have correct portalAuthenticationId value', () => {
    expect(accountUserResponse.portalAuthenticationId).toBe('auth123');
  });

  it('should have correct roleString value', () => {
    expect(accountUserResponse.roleString).toBe('Manager');
  });

  it('should have correct spiffEligible value', () => {
    expect(accountUserResponse.spiffEligible).toBe(true);
  });
});
