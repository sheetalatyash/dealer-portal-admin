import { TestBed } from '@angular/core/testing';
import { MockInstance, ngMocks } from 'ng-mocks';
import { SalesHierarchyApiService } from './sales-hierarchy.api.service';

describe('SalesHierarchyApiService', () => {
  MockInstance.scope('suite');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SalesHierarchyApiService],
    });
  });

  afterEach(() => ngMocks.flushTestBed());

  it('Construct service', () => {
    // Act
    const repository = TestBed.inject(SalesHierarchyApiService);

    // Assert
    expect(repository).toBeTruthy();
  });
});
