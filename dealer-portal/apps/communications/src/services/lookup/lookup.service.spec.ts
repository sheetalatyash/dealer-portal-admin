import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LookupService } from './lookup.service';
import {
  CommunicationsApiService,
  LoggerService,
  StandardResponse,
  CommunicationGroup,
  CommunicationStatus,
} from '@dealer-portal/polaris-core';
import { HttpErrorResponse } from '@angular/common/http';

describe('LookupService', () => {
  let service: LookupService;
  let communicationsApiServiceMock: jest.Mocked<CommunicationsApiService>;
  let loggerServiceMock: jest.Mocked<LoggerService>;

  beforeEach(() => {
    const communicationsApiMock = {
      getAllStatuses$: jest.fn(),
      getAllGroups$: jest.fn(),
      getAllSubGroups$: jest.fn(),
    };

    const loggerMock = {
      logError: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        LookupService,
        { provide: CommunicationsApiService, useValue: communicationsApiMock },
        { provide: LoggerService, useValue: loggerMock },
      ],
    });

    service = TestBed.inject(LookupService);
    communicationsApiServiceMock = TestBed.inject(CommunicationsApiService) as jest.Mocked<CommunicationsApiService>;
    loggerServiceMock = TestBed.inject(LoggerService) as jest.Mocked<LoggerService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllStatuses$', () => {
    it('should retrieve statuses successfully', (done) => {
      // Arrange
      const expected: CommunicationStatus[] = [new CommunicationStatus({ statusId: 1, name: 'Active' })];

      const mockResponse: StandardResponse<CommunicationStatus[]> = {
        success: true,
        data: expected,
      };
      communicationsApiServiceMock.getAllStatuses$.mockReturnValue(of(mockResponse));

      // Act
      service.getStatuses$().subscribe((statuses) => {
        // Assert
        expect(statuses).toEqual(mockResponse.data);
        done();
      });
    });

    it('should log error when retrieving statuses fails', (done) => {
      // Arrange
      const expected: CommunicationStatus[] = [];
      const expectedLogError = 'Failed to Get Communication Statuses';

      const mockResponse: StandardResponse<CommunicationStatus[]> = {
        success: false,
        error: new HttpErrorResponse({ error: 'Error' }),
      };
      communicationsApiServiceMock.getAllStatuses$.mockReturnValue(of(mockResponse));

      // Act
      service.getStatuses$().subscribe((statuses) => {
        // Assert
        expect(statuses).toEqual(expected);
        expect(loggerServiceMock.logError).toHaveBeenCalledWith(expectedLogError, {
          error: mockResponse.error,
        });
        done();
      });
    });
  });

  describe('getAllGroups$', () => {
    it('should retrieve groups successfully', (done) => {
      // Arrange
      const expected: CommunicationGroup[] = [new CommunicationGroup({ groupId: 1, name: 'Group 1' })];

      const mockResponse: StandardResponse<CommunicationGroup[]> = {
        success: true,
        data: expected,
      };
      communicationsApiServiceMock.getAllGroups$.mockReturnValue(of(mockResponse));

      // Act
      service.getGroups$().subscribe((groups) => {
        // Assert
        expect(groups).toEqual(mockResponse.data);
        done();
      });
    });

    it('should log error when retrieving groups fails', (done) => {
      // Arrange
      const expected: CommunicationGroup[] = [];
      const expectedLogError = 'Failed to Get Communication Groups';

      const mockResponse: StandardResponse<CommunicationGroup[]> = {
        success: false,
        error: new HttpErrorResponse({ error: 'Error' }),
      };
      communicationsApiServiceMock.getAllGroups$.mockReturnValue(of(mockResponse));

      // Act
      service.getGroups$().subscribe((groups) => {
        // Assert
        expect(groups).toEqual(expected);
        expect(loggerServiceMock.logError).toHaveBeenCalledWith(expectedLogError, { error: mockResponse.error });
        done();
      });
    });
  });

  describe('getAllSubGroups$', () => {
    it('should retrieve subgroups successfully', (done) => {
      // Arrange
      const expected: CommunicationGroup[] = [new CommunicationGroup({ groupId: 1, subGroupId: 1, name: 'SubGroup 1' })];

      const mockResponse: StandardResponse<CommunicationGroup[]> = {
        success: true,
        data: expected,
      };
      communicationsApiServiceMock.getAllSubGroups$.mockReturnValue(of(mockResponse));

      // Act
      service.getSubGroups$(1).subscribe((subGroups) => {
        // Assert
        expect(subGroups).toEqual(mockResponse.data);
        done();
      });
    });

    it('should log error when retrieving subgroups fails', (done) => {
      // Arrange
      const expected: CommunicationGroup[] = [];
      const groupId = 1;
      const expectedLogError = `Failed to Get Communication Sub Groups for Group ID ${groupId}`;

      const mockResponse: StandardResponse<CommunicationGroup[]> = {
        success: false,
        error: new HttpErrorResponse({ error: 'Error' }),
      };
      communicationsApiServiceMock.getAllSubGroups$.mockReturnValue(of(mockResponse));

      // Act
      service.getSubGroups$(groupId).subscribe((subGroups) => {
        // Assert
        expect(subGroups).toEqual(expected);
        expect(loggerServiceMock.logError).toHaveBeenCalledWith(expectedLogError, {
          error: mockResponse.error,
        });
        done();
      });
    });
  });
});
