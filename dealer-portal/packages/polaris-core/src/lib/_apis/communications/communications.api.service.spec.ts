import { HttpParams, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  CommunicationApplication,
  Communication,
  CommunicationCode,
  CommunicationGroup,
  CommunicationListingOptions,
  CommunicationMessage,
  CommunicationStatus,
  CommunicationType,
  PaginationResponse,
  PaginationResponseEntity,
  StandardResponse,
  UserCommunicationUpdate,
  CommunicationProductLine,
} from '..';
import { ENVIRONMENT_CONFIG } from '../../_types';
import { CommunicationsApiService } from './communications.api.service';

describe('CommunicationsApiService', () => {
  let service: CommunicationsApiService;
  let httpMock: HttpTestingController;
  const environment = {
    endpoints: {
      communicationApiUrl: 'https://api-communication-unit-test.polarisportal.com/',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommunicationsApiService,
        { provide: ENVIRONMENT_CONFIG, useValue: environment },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CommunicationsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAdminCommunications$', () => {
    it('should retrieve a paginated list of communications with a GET to the communications endpoint', async () => {
      // Arrange
      const options: CommunicationListingOptions = new CommunicationListingOptions({
        groupIds: [1, 2],
        productLineCodes: ['ATV', 'ORV'],
        myCommunication: true,
        statusId: 1,
        searchString: 'Test Search',
        sortBy: '',
        sortDirection: 'asc',
      });
      const pageNumber = 1;
      const pageSize = 10;
      const httpParams = new HttpParams({ fromObject: { ...options, pageNumber, pageSize } });
      const mockResponse: PaginationResponseEntity<Communication> = {
        data: [],
        pageNumber,
        pageSize,
        totalRecords: 0,
      };
      const expected: PaginationResponse<Communication> = new PaginationResponse({
        ...mockResponse,
        success: true,
      });

      // Act
      const communicationsPromise = firstValueFrom(service.getAdminCommunications$(options, pageNumber, pageSize));
      const req = httpMock.expectOne(
        `${environment.endpoints.communicationApiUrl}api/v1/admin/communications?${httpParams.toString()}`
      );
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('GET');
      expect(await communicationsPromise).toEqual(expected);
    });
  });

  describe('getAdminCommunication$', () => {
    it('should retrieve a specific communication with a GET to the communications endpoint', async () => {
      // Arrange
      const communicationGuid = '123';
      const mockResponse: Communication = new Communication({ communicationGuid });
      const expected: StandardResponse<Communication> = new StandardResponse<Communication>({
        data: mockResponse,
        success: true,
      });

      // Act
      const communicationsPromise = firstValueFrom(service.getAdminCommunication$(communicationGuid));
      const req = httpMock.expectOne(
        `${environment.endpoints.communicationApiUrl}api/v1/admin/communications/${communicationGuid}`
      );
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('GET');
      expect(await communicationsPromise).toEqual(expected);
    });
  });

  describe('createCommunication$', () => {
    it('should create a communication with a POST to the communications endpoint', async () => {
      // Arrange
      const communicationDetails: Communication = new Communication({
        endDate: '2021-12-31',
        startDate: '2021-01-01',
        groupId: 1,
        subGroupId: 1,
        statusId: 1,
        defaultMessage: new CommunicationMessage({
          title: 'Test Title',
          messageBody: 'Test Message Body',
          keywords: 'Test Keywords',
          cultureCode: 'en-US',
          statusId: 1,
          attachments: [],
        }),
      });
      const mockResponse: Communication = new Communication({ communicationGuid: '123' });
      const expected: StandardResponse<Communication> = new StandardResponse<Communication>({
        data: mockResponse,
        success: true,
      });

      // Act
      const communicationsPromise = firstValueFrom(service.createCommunication$(communicationDetails));
      const req = httpMock.expectOne(`${environment.endpoints.communicationApiUrl}api/v1/admin/communications`);
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(communicationDetails);
      expect(await communicationsPromise).toEqual(expected);
    });
  });

  describe('updateCommunication$', () => {
    it('should update the communication with a PUT to the communications endpoint', async () => {
      // Arrange
      const communicationDetails: Communication = new Communication({
        communicationGuid: '123',
        endDate: '2021-12-31',
        startDate: '2021-01-01',
        groupId: 1,
        subGroupId: 1,
        statusId: 1,
        defaultMessage: new CommunicationMessage({
          title: 'Test Title',
          messageBody: 'Test Message Body',
          keywords: 'Test Keywords',
          cultureCode: 'en-US',
          statusId: 1,
          attachments: [],
        }),
      });
      const mockResponse: Communication = new Communication({ communicationGuid: communicationDetails.communicationGuid });
      const expected: StandardResponse<Communication> = new StandardResponse<Communication>({
        data: mockResponse,
        success: true,
      });

      // Act
      const communicationsPromise = firstValueFrom(service.updateCommunication$(communicationDetails));
      const req = httpMock.expectOne(
        `${environment.endpoints.communicationApiUrl}api/v1/admin/communications/${communicationDetails.communicationGuid}`
      );
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(communicationDetails);
      expect(await communicationsPromise).toEqual(expected);
    });
  });

  describe('updateAccountTargets$', () => {
    it('should update the account targets with a PUT to the account targets endpoint', async () => {
      // Arrange
      const accountTargets: Communication = new Communication({
        communicationGuid: '123',
        countries: [new CommunicationCode({ code: 'US' })],
        partnerTypes: [new CommunicationCode({ code: 'Dealer' })],
        custClasses: [new CommunicationCode({ code: 'DLR' })],
        productLines: [new CommunicationProductLine({ productLineId: 0, code: 'ATV' })],
        stateOrProvinces: [new CommunicationCode({ code: 'IL' })],
      });
      const mockResponse: Communication = new Communication({ communicationGuid: accountTargets.communicationGuid });
      const expected: StandardResponse<Communication> = new StandardResponse<Communication>({
        data: mockResponse,
        success: true,
      });

      // Act
      const accountTargetsPromise = firstValueFrom(service.updateAccountTargets$(accountTargets));
      const req = httpMock.expectOne(
        `${environment.endpoints.communicationApiUrl}api/v1/admin/communications/${accountTargets.communicationGuid}/account-target`
      );
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(accountTargets);
      expect(await accountTargetsPromise).toEqual(expected);
    });
  });

  describe('updateUserTargets$', () => {
    it('should update the user targets with a PUT to the user targets endpoint', async () => {
      // Arrange
      const userTargets: Communication = new Communication({
        communicationGuid: '123',
        applications: [new CommunicationApplication({ pageId: 1, applicationCategory: 'Admin', applicationName: 'Comm Admin', applicationId: 1 })],
        departments: [new CommunicationCode({ code: 'General' })],
        roles: [new CommunicationCode({ code: 'Manager' })],
        serviceStaffRoles: [new CommunicationCode({ code: 'Service' })],
      });
      const mockResponse: Communication = new Communication({ communicationGuid: userTargets.communicationGuid });
      const expected: StandardResponse<Communication> = new StandardResponse<Communication>({
        data: mockResponse,
        success: true,
      });

      // Act
      const userTargetsPromise = firstValueFrom(service.updateUserTargets$(userTargets));
      const req = httpMock.expectOne(
        `${environment.endpoints.communicationApiUrl}api/v1/admin/communications/${userTargets.communicationGuid}/user-target`
      );
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(userTargets);
      expect(await userTargetsPromise).toEqual(expected);
    });
  });

  describe('updateTranslations$', () => {
    it('should update the translations with a PUT to the translations endpoint', async () => {
      // Arrange
      const translations: Communication = new Communication({
        communicationGuid: '123',
        messages: [],
      });
      const mockResponse: Communication = new Communication({ communicationGuid: translations.communicationGuid });
      const expected: StandardResponse<Communication> = new StandardResponse<Communication>({
        data: mockResponse,
        success: true,
      });

      // Act
      const translationsPromise = firstValueFrom(service.updateTranslations$(translations));
      const req = httpMock.expectOne(
        `${environment.endpoints.communicationApiUrl}api/v1/admin/communications/${translations.communicationGuid}/translation`
      );
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(translations);
      expect(await translationsPromise).toEqual(expected);
    });
  });

  describe('updateStatus$', () => {
    it('should update the status with a PUT to the status endpoint', async () => {
      // Arrange
      const communicationGuid = '123';
      const mockResponse: Communication = new Communication({ communicationGuid });
      const expected: StandardResponse<Communication> = new StandardResponse<Communication>({
        data: mockResponse,
        success: true,
      });

      // Act
      const statusPromise = firstValueFrom(service.updateStatus$(communicationGuid, 3));
      const req = httpMock.expectOne(
        `${environment.endpoints.communicationApiUrl}api/v1/admin/communications/${communicationGuid}/status/3`
      );
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('PUT');
      expect(await statusPromise).toEqual(expected);
    });
  });

  describe('getAllStatuses$', () => {
    it('should retrieve all statuses with a GET to the statuses endpoint', async () => {
      // Arrange
      const mockResponse: CommunicationStatus[] = [];
      const expected: StandardResponse<CommunicationStatus[]> = new StandardResponse<CommunicationStatus[]>(
        {
          data: mockResponse,
          success: true,
        }
      );

      // Act
      const statusPromise = firstValueFrom(service.getAllStatuses$());
      const req = httpMock.expectOne(`${environment.endpoints.communicationApiUrl}api/v1/lookup/statuses`);
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('GET');
      expect(await statusPromise).toEqual(expected);
    });
  });

  describe('getAllGroups$', () => {
    it('should retrieve all groups with a GET to the groups endpoint', async () => {
      // Arrange
      const mockResponse: CommunicationGroup[] = [];
      const expected: StandardResponse<CommunicationGroup[]> = new StandardResponse<CommunicationGroup[]>({
        data: mockResponse,
        success: true,
      });

      // Act
      const groupPromise = firstValueFrom(service.getAllGroups$());
      const req = httpMock.expectOne(`${environment.endpoints.communicationApiUrl}api/v1/lookup/groups`);
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('GET');
      expect(await groupPromise).toEqual(expected);
    });
  });

  describe('getAllSubGroups$', () => {
    it('should retrieve all sub-groups for a given group ID with a GET to the subgroups endpoint', async () => {
      // Arrange
      const groupId = 1;
      const mockResponse: CommunicationGroup[] = [];
      const expected: StandardResponse<CommunicationGroup[]> = new StandardResponse<CommunicationGroup[]>({
        data: mockResponse,
        success: true,
      });

      // Act
      const subGroupPromise = firstValueFrom(service.getAllSubGroups$(groupId));
      const req = httpMock.expectOne(
        `${environment.endpoints.communicationApiUrl}api/v1/lookup/groups/${groupId}/subgroups`
      );
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('GET');
      expect(await subGroupPromise).toEqual(expected);
    });
  });

  describe('getUserCommunication$', () => {
    it('should retrieve a specific user communication with a GET to the user communications endpoint', async () => {
      // Arrange
      const communicationGuid = '123';
      const cultureCode = 'en-US';
      const mockResponse: Communication = new Communication({
        communicationGuid,
        title: 'Test Title',
        message: 'Test Message',
        startDate: '2021-01-01',
        isArchive: false,
        isFavorite: false,
        isRead: false,
        groupName: CommunicationType.Alert,
        attachments: [],
      });
      const expected: StandardResponse<Communication> = new StandardResponse<Communication>({
        data: mockResponse,
        success: true,
      });

      // Act
      const userCommunicationPromise = firstValueFrom(service.getUserCommunication$(communicationGuid, cultureCode));
      const req = httpMock.expectOne(
        `${environment.endpoints.communicationApiUrl}api/v1/user/communications/${communicationGuid}?cultureCode=${cultureCode}`
      );
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('GET');
      expect(await userCommunicationPromise).toEqual(expected);
    });
  });

  describe('updateArchive$', () => {
    it('should update the archive status with a PUT to the archive endpoint', async () => {
      // Arrange
      const update: UserCommunicationUpdate = new UserCommunicationUpdate({ communicationGuid: ['123'], value: true });
      const expected: StandardResponse<null> = new StandardResponse<null>({ success: true, data: null });

      // Act
      const archivePromise = firstValueFrom(service.updateArchive$(update));
      const req = httpMock.expectOne(`${environment.endpoints.communicationApiUrl}api/v1/user/communications/archive`);
      req.flush(null);

      // Assert
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(update);
      expect(await archivePromise).toEqual(expected);
    });
  });

  describe('updateFavorite$', () => {
    it('should update the favorite status with a PUT to the favorite endpoint', async () => {
      // Arrange
      const update: UserCommunicationUpdate = new UserCommunicationUpdate({ communicationGuid: ['123'], value: true });
      const expected: StandardResponse<null> = new StandardResponse<null>({ success: true, data: null });

      // Act
      const favoritePromise = firstValueFrom(service.updateFavorite$(update));
      const req = httpMock.expectOne(`${environment.endpoints.communicationApiUrl}api/v1/user/communications/favorite`);
      req.flush(null);

      // Assert
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(update);
      expect(await favoritePromise).toEqual(expected);
    });
  });

  describe('updateRead$', () => {
    it('should update the read status with a PUT to the read endpoint', async () => {
      // Arrange
      const update: UserCommunicationUpdate = new UserCommunicationUpdate({ communicationGuid: ['123'], value: true });
      const expected: StandardResponse<null> = new StandardResponse<null>({ success: true, data: null });

      // Act
      const readPromise = firstValueFrom(service.updateRead$(update));
      const req = httpMock.expectOne(`${environment.endpoints.communicationApiUrl}api/v1/user/communications/read`);
      req.flush(null);

      // Assert
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(update);
      expect(await readPromise).toEqual(expected);
    });
  });

  describe('getUserCommunications$', () => {
    it('should retrieve a paginated list of communications with a GET to the User communications endpoint', async () => {
      // Arrange
      const options: CommunicationListingOptions = new CommunicationListingOptions({
        groupIds: [1, 2],
        searchString: 'Test Search',
        cultureCode: 'en-US',
        isFavorite: true,
        isArchive: true,
        sortByStartDateDescending: true,
      });

      const pageNumber = 1;
      const pageSize = 10;
      const httpParams = new HttpParams({ fromObject: { ...options, pageNumber, pageSize } });
      const mockResponse: PaginationResponseEntity<Communication> = {
        data: [],
        pageNumber,
        pageSize,
        totalRecords: 0,
      };
      const expected: PaginationResponse<Communication> = new PaginationResponse({
        ...mockResponse,
        success: true,
      });

      // Act
      const communicationsPromise = firstValueFrom(service.getUserCommunications$(options, pageNumber, pageSize));
      const req = httpMock.expectOne(
        `${environment.endpoints.communicationApiUrl}api/v1/user/communications?${httpParams.toString()}`
      );
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('GET');
      expect(await communicationsPromise).toEqual(expected);
    });
  });
  describe('getUserCommunicationsSearch$', () => {
    it('should retrieve a paginated list of communications with a GET to the User communications search endpoint', async () => {
      // Arrange
      const options: CommunicationListingOptions = new CommunicationListingOptions({
        groupIds: [1, 2],
        searchString: 'Search Term',
        cultureCode: 'en-US',
        isFavorite: false,
        isArchive: false,
        sortByStartDateDescending: false,
      });

      const pageNumber = 2;
      const pageSize = 5;
      const httpParams = new HttpParams({ fromObject: { ...options, pageNumber, pageSize } });
      const mockResponse: PaginationResponseEntity<Communication> = {
        data: [],
        pageNumber,
        pageSize,
        totalRecords: 0,
      };
      const expected: PaginationResponse<Communication> = new PaginationResponse({
        ...mockResponse,
        success: true,
      });

      // Act
      const communicationsPromise = firstValueFrom(service.getUserCommunicationsSearch$(options, pageNumber, pageSize));
      const req = httpMock.expectOne(
        `${environment.endpoints.communicationApiUrl}api/v1/user/communications/search?${httpParams.toString()}`
      );
      req.flush(mockResponse);

      // Assert
      expect(req.request.method).toBe('GET');
      expect(await communicationsPromise).toEqual(expected);
    });
  });
});
