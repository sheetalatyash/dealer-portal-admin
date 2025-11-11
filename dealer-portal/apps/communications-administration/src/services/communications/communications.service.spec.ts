import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CommunicationsService } from './communications.service';
import {
  Communication,
  CommunicationGroup,
  CommunicationListingOptions,
  CommunicationsApiService,
  LoggerService,
  PaginationResponse,
  StandardResponse,
} from '@dealer-portal/polaris-core';
import { HttpErrorResponse } from '@angular/common/http';

describe('CommunicationsService', () => {
  let service: CommunicationsService;
  let communicationsApiServiceMock: jest.Mocked<CommunicationsApiService>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(() => {
    const communicationsApiMock = {
      getAdminCommunications$: jest.fn(),
      getAdminCommunication$: jest.fn(),
      createCommunication$: jest.fn(),
      updateCommunication$: jest.fn(),
      updateAccountTargets$: jest.fn(),
      updateUserTargets$: jest.fn(),
      updateStatus$: jest.fn(),
      updateTranslations$: jest.fn(),
    };

    const loggerMock = {
      logError: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CommunicationsService,
        {
          provide: CommunicationsApiService,
          useValue: communicationsApiMock,
        },
        { provide: LoggerService, useValue: loggerMock },
      ],
    });

    communicationsApiServiceMock = TestBed.inject(CommunicationsApiService) as jest.Mocked<CommunicationsApiService>;
    loggerService = TestBed.inject(LoggerService) as jest.Mocked<LoggerService>;
    service = TestBed.inject(CommunicationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCommunications$', () => {
    it('should return a list of Communication if getCommunications$ succeeds', (done) => {
      // Arrange
      const communicationEntities: Communication[] = [
        new Communication({
          messageId: 1,
          communicationGuid: '123f8786-c063-412a-8356-ba9e5bd672f5',
          title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
          status: 'active',
          startDate: '2023-12-15T10:30:00',
          endDate: '2024-12-05T10:30:00',
          group: new CommunicationGroup({ groupId: 1, name: 'Group 1' }),
          subGroup: new CommunicationGroup({ subGroupId: 1, groupId: 0, name: 'SubGroup 1' }),
          createdDate: '2023-12-05T10:30:00',
          createdBy: 'test@test.com',
          createdByFirstName: 'Test',
          createdByLastName: 'User',
          cultureCodes: ['en-US'],
        }),
       new Communication( {
         messageId: 2,
         communicationGuid: 'c606e1cb-5d02-4f53-aa75-7b3c46b5e225',
         title: 'Another Title',
         status: 'inactive',
         startDate: '2022-12-15T10:30:00',
         endDate: '2023-12-05T10:30:00',
         group: new CommunicationGroup({ groupId: 2, name: 'Group 2' }),
         subGroup: new CommunicationGroup({ subGroupId: 2, groupId: 0, name: 'SubGroup 2' }),
         createdDate: '2021-12-05T10:30:00',
         createdBy: 'test2@test.com',
         createdByFirstName: 'Test2',
         createdByLastName: 'User2',
         cultureCodes: ['en-GB'],
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
      communicationsApiServiceMock.getAdminCommunications$.mockReturnValue(of(paginationResponse));

      // Act
      service.getCommunications$(new CommunicationListingOptions({ groupIds: [], productLineCodes: [] }), 1, 10).subscribe((response) => {
        // Assert
        expect(response).toEqual(expected);
        done();
      });
    });
  });

  describe('getCommunication$', () => {
    it('should return a Communication if getCommunication$ succeeds', (done) => {
      // Arrange
      const communicationGuid = '123';
      const communication: Communication = new Communication({
        communicationGuid: communicationGuid,
      });
      const expected = new Communication(communication);
      communicationsApiServiceMock.getAdminCommunication$.mockReturnValue(
        of(new StandardResponse<Communication>({ data: communication, success: true }))
      );

      // Act
      service.getCommunication$(communicationGuid).subscribe((communication) => {
        // Assert
        expect(communication).toEqual(expected);
        done();
      });
    });
  });

  describe('createCommunication$', () => {
    it("should return the created communication's id if createCommunication$ succeeds", (done) => {
      // Arrange
      const expected = '123';
      const communicationEntity: Communication = new Communication({
        communicationGuid: expected,
      });
      communicationsApiServiceMock.createCommunication$.mockReturnValue(
        of(new StandardResponse<Communication>({ data: communicationEntity, success: true }))
      );

      // Act
      service.createCommunication$(new Communication()).subscribe((id) => {
        // Assert
        expect(id).toBe(expected);
        done();
      });
    });

    it('should return an empty id and log an error if createCommunication$ fails', (done) => {
      // Arrange
      const expected = '';
      const expectedLoggedId = 'loggedId';
      const expectedError = new HttpErrorResponse({ error: 'Test error' });
      const communication = new Communication({
        communicationGuid: expectedLoggedId,
      });
      communicationsApiServiceMock.createCommunication$.mockReturnValue(
        of(new StandardResponse<Communication>({ error: expectedError, success: false }))
      );

      // Act
      service.createCommunication$(communication).subscribe((communicationGuid) => {
        // Assert
        expect(communicationGuid).toBe(expected);
        expect(loggerService.logError).toHaveBeenCalledWith('Failed to Create Communication', {
          communicationGuid: expectedLoggedId,
          error: expectedError,
        });
        done();
      });
    });
  });

  describe('updateCommunication$', () => {
    it('should return true if updateCommunication$ succeeds', (done) => {
      // Arrange
      const expected = true;
      const communication = new Communication({
        communicationGuid: '123',
      });
      communicationsApiServiceMock.updateCommunication$.mockReturnValue(
        of(new StandardResponse<Communication>({ success: true }))
      );

      // Act
      service.updateCommunication$(communication).subscribe((success) => {
        // Assert
        expect(success).toBe(expected);
        done();
      });
    });

    it('should return false and log an error if updateCommunication$ fails', (done) => {
      // Arrange
      const expected = false;
      const expectedLoggedId = 'loggedId';
      const expectedError = new HttpErrorResponse({ error: 'Test error' });
      const communication = new Communication({
        communicationGuid: expectedLoggedId,
      });
      communicationsApiServiceMock.updateCommunication$.mockReturnValue(
        of(new StandardResponse<Communication>({ error: expectedError, success: false }))
      );

      // Act
      service.updateCommunication$(communication).subscribe((success) => {
        // Assert
        expect(success).toBe(expected);
        expect(loggerService.logError).toHaveBeenCalledWith('Failed to Update Communication Details', {
          communicationGuid: expectedLoggedId,
          error: expectedError,
        });
        done();
      });
    });
  });

  describe('updateAccountTargets$', () => {
    it('should return true if updateAccountTargets$ succeeds', (done) => {
      // Arrange
      const expected = true;
      const communication = new Communication({
        communicationGuid: '123',
      });
      communicationsApiServiceMock.updateAccountTargets$.mockReturnValue(
        of(new StandardResponse<Communication>({ success: true }))
      );

      // Act
      service.updateAccountTargets$(communication).subscribe((success) => {
        // Assert
        expect(success).toBe(expected);
        done();
      });
    });

    it('should return false and log an error if updateAccountTargets$ fails', (done) => {
      // Arrange
      const expected = false;
      const expectedLoggedId = 'loggedId';
      const expectedError = new HttpErrorResponse({ error: 'Test error' });
      const communication = new Communication({
        communicationGuid: expectedLoggedId,
      });
      communicationsApiServiceMock.updateAccountTargets$.mockReturnValue(
        of(new StandardResponse<Communication>({ error: expectedError, success: false }))
      );

      // Act
      service.updateAccountTargets$(communication).subscribe((success) => {
        // Assert
        expect(success).toBe(expected);
        expect(loggerService.logError).toHaveBeenCalledWith('Failed to Update Communication Account Targets', {
          communicationGuid: expectedLoggedId,
          error: expectedError,
        });
        done();
      });
    });
  });

  describe('updateUserTargets$', () => {
    it('should return true if updateUserTargets$ succeeds', (done) => {
      // Arrange
      const expected = true;
      const communication = new Communication({
        communicationGuid: '123',
      });
      communicationsApiServiceMock.updateUserTargets$.mockReturnValue(
        of(new StandardResponse<Communication>({ success: true }))
      );

      // Act
      service.updateUserTargets$(communication).subscribe((success) => {
        // Assert
        expect(success).toBe(expected);
        done();
      });
    });

    it('should return false and log an error if updateUserTargets$ fails', (done) => {
      // Arrange
      const expected = false;
      const expectedLoggedId = 'loggedId';
      const expectedError = new HttpErrorResponse({ error: 'Test error' });
      const communication = new Communication({
        communicationGuid: expectedLoggedId,
      });
      communicationsApiServiceMock.updateUserTargets$.mockReturnValue(
        of(new StandardResponse<Communication>({ error: expectedError, success: false }))
      );

      // Act
      service.updateUserTargets$(communication).subscribe((success) => {
        // Assert
        expect(success).toBe(expected);
        expect(loggerService.logError).toHaveBeenCalledWith('Failed to Update Communication User Targets', {
          communicationGuid: expectedLoggedId,
          error: expectedError,
        });
        done();
      });
    });
  });

  describe('updateStatus$', () => {
    it('should return true if updateStatus$ succeeds', (done) => {
      // Arrange
      const expected = true;
      const communication = new Communication({
        communicationGuid: '123',
      });
      const statusId: number = 3;
      communicationsApiServiceMock.updateStatus$.mockReturnValue(
        of(new StandardResponse<Communication>({ success: true }))
      );

      // Act
      service.updateStatus$(communication, statusId).subscribe((success) => {
        // Assert
        expect(success).toBe(expected);
        done();
      });
    });

    it('should return false and log an error if updateStatus$ fails', (done) => {
      // Arrange
      const expected = false;
      const expectedLoggedId = 'loggedId';
      const expectedError = new HttpErrorResponse({ error: 'Test error' });
      const communication = new Communication({
        communicationGuid: expectedLoggedId,
      });
      const statusId: number = 3;
      communicationsApiServiceMock.updateStatus$.mockReturnValue(
        of(new StandardResponse<Communication>({ error: expectedError, success: false }))
      );

      // Act
      service.updateStatus$(communication, statusId).subscribe((success) => {
        // Assert
        expect(success).toBe(expected);
        expect(loggerService.logError).toHaveBeenCalledWith('Failed to Update Communication Status', {
          communicationGuid: expectedLoggedId,
          error: expectedError,
        });
        done();
      });
    });

    it('should return false and log an error if communicationGuid is not provided', (done) => {
      // Arrange
      const expected = false;
      const communication = new Communication({
        communicationGuid: '',
      });
      const statusId: number = 3;

      // Act
      service.updateStatus$(communication, statusId).subscribe((success) => {
        // Assert
        expect(success).toBe(expected);
        expect(loggerService.logError).toHaveBeenCalledWith('Failed to Update Communication Status', {
          communicationGuid: '',
          error: new Error('No Communication ID Provided'),
        });
        done();
      });
    });
  });

  describe('updateTranslations$', () => {
    it('should return a Communication if updateTranslations$ succeeds', (done) => {
      // Arrange
      const communicationGuid = '123';
      const communicationEntity: Communication = new Communication({
        communicationGuid: communicationGuid,
      });
      const expected = new Communication(communicationEntity);
      const communication = new Communication({
        communicationGuid: communicationGuid,
      });
      communicationsApiServiceMock.updateTranslations$.mockReturnValue(
        of(new StandardResponse<Communication>({ data: communicationEntity, success: true }))
      );

      // Act
      service.updateTranslations$(communication).subscribe((updatedCommunication) => {
        // Assert
        expect(updatedCommunication).toEqual(expected);
        done();
      });
    });

    it('should log an error if updateTranslations$ fails', (done) => {
      // Arrange
      const expectedLoggedId = 'loggedId';
      const expectedError = new HttpErrorResponse({ error: 'Test error' });
      const communication = new Communication({
        communicationGuid: expectedLoggedId,
      });
      communicationsApiServiceMock.updateTranslations$.mockReturnValue(
        of(new StandardResponse<Communication>({ error: expectedError, success: false }))
      );

      // Act
      service.updateTranslations$(communication).subscribe(() => {
        // Assert
        expect(loggerService.logError).toHaveBeenCalledWith('Failed to Update Communication Translations', {
          communicationGuid: expectedLoggedId,
          error: expectedError,
        });
        done();
      });
    });
  });
});
