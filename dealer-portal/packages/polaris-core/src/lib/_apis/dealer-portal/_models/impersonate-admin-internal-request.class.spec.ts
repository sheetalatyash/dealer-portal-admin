import { ImpersonateAdminInternalRequest } from './impersonate-admin-internal-request.class';

describe('ImpersonateAdminInternalRequest', () => {
  it('should create an instance with default values', () => {
    const request = new ImpersonateAdminInternalRequest();
    expect(request.accountNumber).toBeUndefined();
    expect(request.accountName).toBeUndefined();
  });

  it('should create an instance with provided values', () => {
    const accountNumber = '12345';
    const accountName = 'Test Account';
    const request = new ImpersonateAdminInternalRequest(accountNumber, accountName);
    expect(request.accountNumber).toBe(accountNumber);
    expect(request.accountName).toBe(accountName);
  });

  it('should allow setting accountNumber and accountName after creation', () => {
    const request = new ImpersonateAdminInternalRequest();
    request.accountNumber = '67890';
    request.accountName = 'Another Test Account';
    expect(request.accountNumber).toBe('67890');
    expect(request.accountName).toBe('Another Test Account');
  });
});