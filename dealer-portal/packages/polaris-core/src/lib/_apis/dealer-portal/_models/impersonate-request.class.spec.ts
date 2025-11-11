import { ImpersonateRequest } from './impersonate-request.class';

describe('ImpersonateRequest', () => {
  it('should create an instance with all properties', () => {
    const accountNumber = '12345';
    const accountName = 'Test Account';
    const cityState = 'Test City, Test State';
    const userName = 'testUser';

    const impersonateRequest = new ImpersonateRequest(accountNumber, accountName, cityState, userName);

    expect(impersonateRequest.accountNumber).toBe(accountNumber);
    expect(impersonateRequest.accountName).toBe(accountName);
    expect(impersonateRequest.cityState).toBe(cityState);
    expect(impersonateRequest.userName).toBe(userName);
  });

  it('should create an instance with no properties', () => {
    const impersonateRequest = new ImpersonateRequest();

    expect(impersonateRequest.accountNumber).toBeUndefined();
    expect(impersonateRequest.accountName).toBeUndefined();
    expect(impersonateRequest.cityState).toBeUndefined();
    expect(impersonateRequest.userName).toBeUndefined();
  });

  it('should create an instance with partial properties', () => {
    const accountNumber = '12345';
    const accountName = 'Test Account';

    const impersonateRequest = new ImpersonateRequest(accountNumber, accountName);

    expect(impersonateRequest.accountNumber).toBe(accountNumber);
    expect(impersonateRequest.accountName).toBe(accountName);
    expect(impersonateRequest.cityState).toBeUndefined();
    expect(impersonateRequest.userName).toBeUndefined();
  });
});