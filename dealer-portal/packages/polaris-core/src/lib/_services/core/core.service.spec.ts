import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CoreService } from './core.service';
import { CoreApiService } from '../../_apis/core/core.api.service';
import { CoreDataEntity, CoreDataOptions } from '../../_apis/core/core.service.api.types';
import { CoreData } from './_classes/core-data.class';
import { StandardResponse } from '../../_apis';

jest.mock('./core.api.service');

describe('CoreService', () => {
  let service: CoreService;
  let apiService: jest.Mocked<CoreApiService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoreService, CoreApiService],
    });

    apiService = TestBed.inject(CoreApiService) as jest.Mocked<CoreApiService>;
    service = TestBed.inject(CoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCoreData$', () => {
    it('should return expected core data', (done) => {
      // Arrange
      const options: CoreDataOptions = { countries: true };
      const expectedResponse: StandardResponse<CoreDataEntity> = new StandardResponse<CoreDataEntity>({
        data: { countries: [{ code: 'US', name: 'United States' }] },
      });
      const expected = new CoreData(expectedResponse.data);
      apiService.getCoreData$.mockReturnValue(of(expectedResponse));

      // Act
      service.getCoreData$(options).subscribe((data) => {
        // Assert
        expect(data).toEqual(expected);
        expect(apiService.getCoreData$).toHaveBeenCalledWith(options);
        done();
      });
    });
  });
});
