import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  CommunicationsApiService,
  LoggerService,
  PaginationResponse,
  StandardResponse,
  CommunicationListingOptions,
  UserCommunicationUpdate,
  CommunicationGroup,
  Communication,
  CommunicationType,
} from '@dealer-portal/polaris-core';
import { CommunicationsService } from '@services';
import { of, throwError } from 'rxjs';

describe('CommunicationsService', () => {
  let service: CommunicationsService;
  let apiService: jest.Mocked<CommunicationsApiService>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(() => {
    const communicationsApiMock = {
      getUserCommunications$: jest.fn(),
      getUserCommunication$: jest.fn(),
      updateArchive$: jest.fn(),
      updateFavorite$: jest.fn(),
      updateRead$: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        CommunicationsService,
        {
          provide: CommunicationsApiService,
          useValue: communicationsApiMock,
        },
        { provide: LoggerService, useValue: { logError: jest.fn() } },
      ],
    });

    apiService = TestBed.inject(CommunicationsApiService) as jest.Mocked<CommunicationsApiService>;
    loggerService = TestBed.inject(LoggerService) as jest.Mocked<LoggerService>;
    service = TestBed.inject(CommunicationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCommunications$', () => {
    it('should return an array of Communication objects', (done) => {
      // Arrange
      const options: CommunicationListingOptions = new CommunicationListingOptions({
        searchString: '',
        groupIds: [],
        cultureCode: 'en-US',
        isFavorite: true,
        isArchive: true,
        sortByStartDateDescending: true,
      });

      const communicationEntities: Communication[] = [
        new Communication({
          messageId: 1,
          communicationGuid: '123f8786-c063-412a-8356-ba9e5bd672f5',
          title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
          endDate: '2024-12-05T10:30:00',
          group: new CommunicationGroup({ groupId: 1, name: CommunicationType.Communication }),
          createdDate: '2023-12-05T10:30:00',
          isFavorite: true,
        }),
        new Communication({
          messageId: 2,
          communicationGuid: '123f8786-c063-412a-8356-ba9e5bd672f5',
          title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
          endDate: '2024-12-05T10:30:00',
          group: new CommunicationGroup({ groupId: 1, name: CommunicationType.Communication }),
          createdDate: '2023-12-05T10:30:00',
          isFavorite: true,
        }),
      ];

      const paginationResponse = new PaginationResponse<Communication>({
        data: communicationEntities,
        pageNumber: 1,
        totalRecords: 1,
        pageSize: 10,
      });

      const expected = paginationResponse.mapData(
        (communicationEntity) => new Communication(communicationEntity)
      );

      apiService.getUserCommunications$.mockReturnValue(of(paginationResponse));

      // Act
      service.getCommunications$(options, 1, 10).subscribe((communications) => {
        // Assert
        expect(communications.data?.length).toBe(2);
        expect(communications).toEqual(expected);
        done();
      });
    });
  });

  describe('getCommunication$', () => {
    it('should return a Communication object', (done) => {
      // Arrange
      const communicationGuid = 'comm123';
      const cultureCode = 'en-US';
      const commDto = new Communication({
        messageId: 6,
        communicationGuid: 'd5e6f7g8-h9i0-j1k2-l3m4-n5o6p7q8r9s0',
        title: 'Event Invitation',
        startDate: '2024-12-05T18:00:00',
        groupName: CommunicationType.Communication,
        message: 'Communication Details',
        isFavorite: true,
        isRead: false,
        isArchive: false,
        attachments: [],
      });
      const expected = new Communication(commDto);
      apiService.getUserCommunication$.mockReturnValue(of(new StandardResponse<Communication>({ data: commDto, success: true })));

      // Act
      service.getCommunication$(communicationGuid, cultureCode).subscribe((communication) => {
        // Assert
        expect(communication).toEqual(expected);
        expect(apiService.getUserCommunication$).toHaveBeenCalledWith(communicationGuid, cultureCode);

        done();
      });
    });

    it('should return null and log when an error occurs', (done) => {
      // Arrange
      const expected = null;
      apiService.getUserCommunication$.mockReturnValue(throwError(() => new Error()));

      // Act
      service.getCommunication$('comm123', 'en-US').subscribe((result) => {
        // Assert
        expect(result).toBe(expected);
        expect(loggerService.logError).toHaveBeenCalled();

        done();
      });
    });
  });

  describe('setCommunicationsArchived$', () => {
    it('should return true when successfully archiving a communication', (done) => {
      // Arrange
      const expected = true;
      const communicationGuid = 'comm123';
      const isArchived = true;
      const expectedPayload: UserCommunicationUpdate = new UserCommunicationUpdate({ communicationGuid: [communicationGuid], value: isArchived });
      apiService.updateArchive$.mockReturnValue(of(new StandardResponse<null>({ data: null, success: true })));

      // Act
      service.setCommunicationsArchived$([communicationGuid], isArchived).subscribe((result) => {
        // Assert
        expect(result).toBe(expected);
        expect(apiService.updateArchive$).toHaveBeenCalledWith(expectedPayload);

        done();
      });
    });

    it('should return false and log when an error occurs', (done) => {
      // Arrange
      const expected = false;
      const expectedError = new HttpErrorResponse({ error: 'Test error' });
      apiService.updateArchive$.mockReturnValue(of(new StandardResponse<null>({ error: expectedError, success: false })));

      // Act
      service.setCommunicationsArchived$(['comm123'], true).subscribe((result) => {
        // Assert
        expect(result).toBe(expected);
        expect(loggerService.logError).toHaveBeenCalled();

        done();
      });
    });
  });

  describe('setCommunicationArchived$', () => {
    it('should call setCommunicationsArchived$', (done) => {
      // Arrange
      const communicationGuid = 'comm123';
      const isArchived = true;
      // Spy on setCommunicationsArchived$ to ensure setCommunicationArchived$ is a passthrough that calls it with the correct parameters
      const spy = jest.spyOn(service, 'setCommunicationsArchived$').mockReturnValue(of(true));

      // Act
      service.setCommunicationArchived$(communicationGuid, isArchived).subscribe(() => {
        // Assert
        expect(spy).toHaveBeenCalledWith([communicationGuid], isArchived);

        done();
      });
    });
  });

  describe('setCommunicationsFavorited$', () => {
    it('should return true when successfully favoriting a communication', (done) => {
      // Arrange
      const expected = true;
      const communicationGuid = 'comm123';
      const isFavorited = true;
      const expectedPayload: UserCommunicationUpdate = new UserCommunicationUpdate({ communicationGuid: [communicationGuid], value: isFavorited });
      apiService.updateFavorite$.mockReturnValue(of(new StandardResponse<null>({ data: null, success: true })));

      // Act
      service.setCommunicationsFavorited$([communicationGuid], isFavorited).subscribe((result) => {
        // Assert
        expect(result).toBe(expected);
        expect(apiService.updateFavorite$).toHaveBeenCalledWith(expectedPayload);

        done();
      });
    });

    it('should return false and log when an error occurs', (done) => {
      // Arrange
      const expected = false;
      const expectedError = new HttpErrorResponse({ error: 'Test error' });
      apiService.updateFavorite$.mockReturnValue(of(new StandardResponse<null>({ error: expectedError, success: false })));

      // Act
      service.setCommunicationsFavorited$(['comm123'], true).subscribe((result) => {
        // Assert
        expect(result).toBe(expected);
        expect(loggerService.logError).toHaveBeenCalled();

        done();
      });
    });
  });

  describe('setCommunicationFavorited$', () => {
    it('should call setCommunicationsFavorited$', (done) => {
      // Arrange
      const communicationGuid = 'comm123';
      const isFavorited = true;
      // Spy on setCommunicationsFavorited$ to ensure setCommunicationFavorited$ is a passthrough that calls it with the correct parameters
      const spy = jest.spyOn(service, 'setCommunicationsFavorited$').mockReturnValue(of(true));

      // Act
      service.setCommunicationFavorited$(communicationGuid, isFavorited).subscribe(() => {
        // Assert
        expect(spy).toHaveBeenCalledWith([communicationGuid], isFavorited);

        done();
      });
    });
  });

  describe('setCommunicationsRead$', () => {
    it('should return true when successfully archiving a communication', (done) => {
      // Arrange
      const expected = true;
      const communicationGuid = 'comm123';
      const isRead = true;
      const expectedPayload: UserCommunicationUpdate = new UserCommunicationUpdate({ communicationGuid: [communicationGuid], value: isRead });
      apiService.updateRead$.mockReturnValue(of(new StandardResponse<null>({ data: null, success: true })));

      // Act
      service.setCommunicationsRead$([communicationGuid], isRead).subscribe((result) => {
        // Assert
        expect(result).toBe(expected);
        expect(apiService.updateRead$).toHaveBeenCalledWith(expectedPayload);

        done();
      });
    });

    it('should return false and log when an error occurs', (done) => {
      // Arrange
      const expected = false;
      const expectedError = new HttpErrorResponse({ error: 'Test error' });
      apiService.updateRead$.mockReturnValue(of(new StandardResponse<null>({ error: expectedError, success: false })));

      // Act
      service.setCommunicationsRead$(['comm123'], true).subscribe((result) => {
        // Assert
        expect(result).toBe(expected);
        expect(loggerService.logError).toHaveBeenCalled();

        done();
      });
    });
  });

  describe('setCommunicationRead$', () => {
    it('should call setCommunicationsRead$', (done) => {
      // Arrange
      const communicationGuid = 'comm123';
      const isRead = true;
      // Spy on setCommunicationsArchived$ to ensure setCommunicationRead$ is a passthrough that calls it with the correct parameters
      const spy = jest.spyOn(service, 'setCommunicationsRead$').mockReturnValue(of(true));

      // Act
      service.setCommunicationRead$(communicationGuid, isRead).subscribe(() => {
        // Assert
        expect(spy).toHaveBeenCalledWith([communicationGuid], isRead);

        done();
      });
    });
  });
});
