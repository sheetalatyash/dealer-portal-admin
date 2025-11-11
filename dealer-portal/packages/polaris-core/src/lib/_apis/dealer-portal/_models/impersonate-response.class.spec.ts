import { ImpersonateResponse } from './impersonate-response.class';

describe('ImpersonateResponse', () => {
    it('should create an instance with default values', () => {
        const response = new ImpersonateResponse();
        expect(response).toBeTruthy();
        expect(response.redirectUrl).toBe('');
    });

    it('should allow setting the redirectUrl', () => {
        const response = new ImpersonateResponse();
        const testUrl = 'https://example.com';
        response.redirectUrl = testUrl;
        expect(response.redirectUrl).toBe(testUrl);
    });
});