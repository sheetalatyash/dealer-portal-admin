import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import {
  ImpersonateAdminInternalRequest,
  ImpersonateAndRedirectRequest,
  ImpersonateInternalUserRequest,
  ImpersonateRequest,
  ImpersonateResponse,
  Widget,
} from './_models';
import { EndpointConfig, Environment, ENVIRONMENT_CONFIG } from '../../_types';
import { BaseApiService, DEALER_PORTAL_API, StandardResponse } from '..';
import { PortalPageEntity } from './_models/portal-page-entity';
import { LoggerService } from '../../_services';
import { Favorite } from './_models/favorite';
import { DealerSupportCase } from './_models/dealer-support-case.class';

/**
 * Service to interact with the Opti API.
 * Extends the BaseApiService to provide HTTP methods.
 */
@Injectable({
  providedIn: 'root',
})
export class DealerPortalApiService extends BaseApiService {
  private readonly _favoritesApiUrl: string = '';
  private readonly _impersonateApiUrl: string = '';
  private readonly _impersonateAdminInternalUrl: string = '';
  private readonly _navigationApiUrl: string = '';
  private readonly _widgetApiUrl: string = '';
  private readonly _impersonateInternalUserUrl: string = '';
  private readonly _impersonateAndRedirectUrl: string = '';
  private readonly _salesRepAccountLoginUrl: string = '';

  static override readonly API_NAME: string = DEALER_PORTAL_API;

  /**
   * Constructs the OptiApiService.
   * @param environment - The environment configuration injected.
   * @param _http - The HttpClient injected.
   */
  constructor(@Inject(ENVIRONMENT_CONFIG) environment: Environment, _http: HttpClient, loggerService: LoggerService) {
    const endpointConfig: EndpointConfig = environment.endpoints[DealerPortalApiService.API_NAME];
    super(endpointConfig, _http, loggerService);
    const baseUrl: string = endpointConfig.baseUrl;
    this._favoritesApiUrl = `${baseUrl}sitemappage/favorites`;
    this._impersonateApiUrl = `${baseUrl}impersonate`;
    this._impersonateAdminInternalUrl = `${baseUrl}impersonate-admin-internal`;
    this._impersonateInternalUserUrl = `${baseUrl}impersonate-internal-user`;
    this._impersonateAndRedirectUrl = `${baseUrl}impersonate-and-redirect`;
    this._salesRepAccountLoginUrl = `${baseUrl}sales-rep-account-login`;
    this._navigationApiUrl = `${baseUrl}api/portalnavigation/`;
    this._widgetApiUrl = `${baseUrl}api/widgets/`;
  }

  /**
   * Sends a request to impersonate an account.
   * @param impersonateAccountRequest - The request payload to impersonate an account.
   * @returns An Observable of StandardResponse containing ImpersonateResponse.
   */
  public impersonate$(
    impersonateAccountRequest: ImpersonateRequest,
  ): Observable<StandardResponse<ImpersonateResponse>> {
    return this.post<ImpersonateResponse>(`${this._impersonateApiUrl}`, impersonateAccountRequest);
  }

  /**
   * Sends a request to impersonate an admin internally.
   * @param impersonateAdminInternalRequest - The request payload to impersonate an admin internally.
   * @returns An Observable of StandardResponse containing ImpersonateResponse.
   */
  public impersonateAdminInternal$(
    impersonateAdminInternalRequest: ImpersonateAdminInternalRequest,
  ): Observable<StandardResponse<ImpersonateResponse>> {
    return this.post<ImpersonateResponse>(`${this._impersonateAdminInternalUrl}`, impersonateAdminInternalRequest);
  }

  /**
   * Sends a request to impersonate an internal user.
   * @param impersonateAdminInternalRequest - The request payload to impersonate an internal user.
   * @returns An Observable of StandardResponse containing ImpersonateResponse.
   */
  public impersonateInternalUser$(
    impersonateInternalUserRequest: ImpersonateInternalUserRequest,
  ): Observable<StandardResponse<ImpersonateResponse>> {
    return this.post<ImpersonateResponse>(`${this._impersonateInternalUserUrl}`, impersonateInternalUserRequest);
  }

  /**
   * Sends a request to login an sales rep user.
   * @param accountNumber - The account number to login; the user name will be derived from the token.
   * @returns An Observable of StandardResponse containing ImpersonateResponse.
   */
  public salesRepAccountLogin$(accountNumber: string): Observable<StandardResponse<ImpersonateResponse>> {
    return this.post<ImpersonateResponse>(`${this._salesRepAccountLoginUrl}`, null, { params: { accountNumber } });
  }

  /**
   * Sends a request to impersonate an internal user and redirects to the provided Optimizely page id afterward.
   * @param impersonateAndRedirectRequest - The request payload to impersonate a user and redirect.
   * @returns An Observable.
   */
  public impersonateAndRedirect$(
    impersonateAndRedirectRequest: ImpersonateAndRedirectRequest,
  ): Observable<StandardResponse<void>> {
    return this.get<void>(`${this._impersonateAndRedirectUrl}`, { params: { ...impersonateAndRedirectRequest } });
  }

  public fetchAvailableMenus$(): Observable<PortalPageEntity[]> {
    return this.get<PortalPageEntity[]>(`${this._navigationApiUrl}portalpages`).pipe(
      switchMap((portalPagesResponse: StandardResponse<PortalPageEntity[]>) => {
        return of(this._flattenPages(portalPagesResponse.data ?? []));
      }),
    );
  }

  private _flattenPages(pages: PortalPageEntity[]): PortalPageEntity[] {
    const result: PortalPageEntity[] = [];
    const traverse = (page: PortalPageEntity, parentPageName: string | null) => {
      if (page.children?.length === 0) {
        page.category = parentPageName;
        result.push(page);
      } else {
        page.children.forEach((child: PortalPageEntity): void => traverse(child, page.name));
      }
    };

    pages.forEach((page: PortalPageEntity): void => traverse(page, null));

    return result;
  }

  public getWidgetData$(): Observable<StandardResponse<Widget[]>> {
    return this.get<Widget[]>(this._widgetApiUrl);
  }

  public updateWidgetData$(widgets: Widget[]): Observable<StandardResponse<unknown>> {
    return this.post(this._widgetApiUrl, widgets);
  }

  // Temporary method to create a dealer support case while we have the Dealer Website Update Questions widget live.
  public createDealerSupportCase(caseDetails: DealerSupportCase): Observable<StandardResponse<unknown>> {
    return this.post<unknown>(`${this._widgetApiUrl}dealer-support-case`, caseDetails);
  }

  public getFavorites$(): Observable<StandardResponse<Favorite[]>> {
    return this.get<Favorite[]>(this._favoritesApiUrl);
  }
}
