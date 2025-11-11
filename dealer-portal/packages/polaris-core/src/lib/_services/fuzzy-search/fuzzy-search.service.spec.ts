// fuzzy-search.service.spec.ts
import { FuzzySearchService, FuzzyKey, FuzzySearchConfiguration, FuzzySearchRequest, FuzzySearchResponse } from './fuzzy-search.service';
import * as Fuzzy from 'fuse.js';

interface UserRecord {
  firstName: string;
  lastName: string;
  emailAddress: string;
  employeeStatusCode: 'ACTIVE' | 'INACTIVE';
  title?: string;
}

describe('FuzzySearchService', () => {
  let service: FuzzySearchService;

  const data: ReadonlyArray<UserRecord> = Object.freeze([
    { firstName: 'John',    lastName: 'Smith',  emailAddress: 'john.smith@example.com',   employeeStatusCode: 'ACTIVE',   title: 'Engineer' },
    { firstName: 'Joan',    lastName: 'Smythe', emailAddress: 'joan@example.com',         employeeStatusCode: 'INACTIVE', title: 'Designer' },
    { firstName: 'Johnny',  lastName: 'Appleseed', emailAddress: 'johnny@apple.com',     employeeStatusCode: 'ACTIVE',   title: 'Support' },
    { firstName: 'Alice',   lastName: 'Johnson', emailAddress: 'aj@example.com',         employeeStatusCode: 'ACTIVE',   title: 'Manager' },
    { firstName: 'Jon',     lastName: 'Smitt',  emailAddress: 'jsmitt@example.com',       employeeStatusCode: 'ACTIVE',   title: 'Engineer' },
  ]);

  const keys: ReadonlyArray<FuzzyKey<UserRecord>> = Object.freeze([
    { name: 'firstName',     weight: 0.4 },
    { name: 'lastName',      weight: 0.4 },
    { name: 'emailAddress',  weight: 0.2 },
  ]);

  beforeEach(() => {
    service = new FuzzySearchService();
  });

  it('buildIndexForItems: returns a Fuse index usable by performSearch', () => {
    const index: Fuzzy.FuseIndex<UserRecord> = service.buildIndexForItems<UserRecord>(data, keys);
    // Smoke test: using the index yields the same results as building fresh
    const baseConfig: FuzzySearchConfiguration<UserRecord> = {
      keys,
      threshold: 0.3,
      minMatchCharacterLength: 2,
      ignoreLocation: true,
      useExtendedSearch: false,
    };

    const withIndex = service.performSearch<UserRecord>({
      items: data,
      query: 'john',
      configuration: baseConfig,
      index,
    });

    const withoutIndex = service.performSearch<UserRecord>({
      items: data,
      query: 'john',
      configuration: baseConfig,
    });

    expect(withIndex.results.map(r => r.emailAddress))
      .toEqual(withoutIndex.results.map(r => r.emailAddress));
    expect(withIndex.scored?.length).toBe(withoutIndex.scored?.length);
  });

  it('returns prefiltered items unchanged when query is shorter than minMatchCharacterLength and extended search is disabled', () => {
    const config: FuzzySearchConfiguration<UserRecord> = {
      keys,
      threshold: 0.3,
      minMatchCharacterLength: 3,
      ignoreLocation: true,
      useExtendedSearch: false,
      preFilterPredicate: (u) => u.employeeStatusCode === 'ACTIVE',
    };

    const request: FuzzySearchRequest<UserRecord> = {
      items: data,
      query: 'jo', // length 2 < min 3
      configuration: config,
    };

    const resp: FuzzySearchResponse<UserRecord> = service.performSearch<UserRecord>(request);

    const expected = data.filter(u => u.employeeStatusCode === 'ACTIVE');
    expect(resp.results).toEqual(expected);
    expect(resp.scored).toBeUndefined(); // an early return path should not include scores
  });

  it('returns prefiltered items unchanged when extended search is enabled and query is empty', () => {
    const config: FuzzySearchConfiguration<UserRecord> = {
      keys,
      useExtendedSearch: true,
      minMatchCharacterLength: 2,
      threshold: 0.3,
      ignoreLocation: true,
      preFilterPredicate: (u) => u.employeeStatusCode === 'ACTIVE',
    };

    const resp = service.performSearch<UserRecord>({
      items: data,
      query: '',
      configuration: config,
    });

    const expected = data.filter(u => u.employeeStatusCode === 'ACTIVE');
    expect(resp.results).toEqual(expected);
    expect(resp.scored).toBeUndefined();
  });

  it('performs a fuzzy search and orders by best match first (weighted keys)', () => {
    const config: FuzzySearchConfiguration<UserRecord> = {
      keys,
      threshold: 0.34,
      minMatchCharacterLength: 2,
      ignoreLocation: true,
      useExtendedSearch: false,
    };

    const resp = service.performSearch<UserRecord>({
      items: data,
      query: 'john',
      configuration: config,
    });

    // Expect strong matches (first/last/email) to surface first
    expect(resp.results.length).toBeGreaterThan(0);
    // The top few should be those with first/last near "john"
    const topEmails = resp.results.slice(0, 3).map(u => u.emailAddress);
    expect(topEmails).toContain('john.smith@example.com');
    expect(topEmails.some(e => e.includes('johnny')) || topEmails.includes('aj@example.com')).toBe(true);
    // Scores should be present and non-decreasing
    expect(resp.scored).toBeDefined();
    const scores = (resp.scored ?? []).map(s => s.score);
    const isNonDecreasing = scores.every((s, i, arr) => i === 0 || s >= arr[i - 1]);
    expect(isNonDecreasing).toBe(true);
  });

  it('applies preFilterPredicate before fuzzy matching', () => {
    const config: FuzzySearchConfiguration<UserRecord> = {
      keys,
      threshold: 0.34,
      minMatchCharacterLength: 2,
      ignoreLocation: true,
      useExtendedSearch: false,
      preFilterPredicate: (u) => u.employeeStatusCode === 'ACTIVE',
    };

    const resp = service.performSearch<UserRecord>({
      items: data,
      query: 'smy',
      configuration: config,
    });

    // "Joan Smythe" is INACTIVE; should be excluded by prefilter even though it matches "smy"
    const emails = resp.results.map(u => u.emailAddress);
    expect(emails).not.toContain('joan@example.com');
  });

  it('respects ignoreLocation flag (smoke test)', () => {
    const base: Omit<FuzzySearchConfiguration<UserRecord>, 'ignoreLocation'> = {
      keys,
      threshold: 0.34,
      minMatchCharacterLength: 2,
      useExtendedSearch: false,
    };

    const withIgnore: FuzzySearchResponse<UserRecord> = service.performSearch<UserRecord>({
      items: data,
      query: 'mith', // substring in "Smith"
      configuration: { ...base, ignoreLocation: true },
    });

    const withoutIgnore: FuzzySearchResponse<UserRecord> = service.performSearch<UserRecord>({
      items: data,
      query: 'mith',
      configuration: { ...base, ignoreLocation: false },
    });

    // Both should return at least "John Smith"; ordering may differ
    const withEmails = withIgnore.results.map(u => u.emailAddress);
    const withoutEmails = withoutIgnore.results.map(u => u.emailAddress);
    expect(withEmails).toContain('john.smith@example.com');
    expect(withoutEmails).toContain('john.smith@example.com');
  });

  it('supports extended search (prefix) when enabled', () => {
    const config: FuzzySearchConfiguration<UserRecord> = {
      keys,
      threshold: 0.34,
      minMatchCharacterLength: 1,
      ignoreLocation: true,
      useExtendedSearch: true,
    };

    // Fuse extended search: ^prefix
    const resp = service.performSearch<UserRecord>({
      items: data,
      query: '^john', // should favor first/last/email with the "john" prefix
      configuration: config,
    });

    expect(resp.results.length).toBeGreaterThan(0);
    const emails = resp.results.slice(0, 3).map(u => u.emailAddress);
    expect(emails).toContain('john.smith@example.com');
    // Johnny may also match due to the "john" prefix within tokenization
    expect(emails.some(e => e.includes('johnny')) || emails.includes('aj@example.com')).toBe(true);
  });
});
