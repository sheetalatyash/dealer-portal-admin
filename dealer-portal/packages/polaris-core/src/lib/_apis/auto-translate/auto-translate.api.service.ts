import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { EndpointConfig, Environment, ENVIRONMENT_CONFIG } from '../../_types';
import { Observable } from 'rxjs';
import { AUTO_TRANSLATE_API, BaseApiService, StandardResponse } from '..';
import { TextTranslationRequest } from './_classes';
import { TranslationContentType } from './_enums';
import { TextTranslation } from './_types';
import { LoggerService } from '../../_services';

/**
 * Service for interacting with the auto-translate API endpoints.
 * Provides methods to translate text and files using different content types.
 */
@Injectable({
  providedIn: 'root',
})
export class AutoTranslateApiService extends BaseApiService {
  /** Base URL for the translation API. */
  private readonly _baseUrl: string;
  /** URL for text translation API endpoint. */
  private readonly textTranslationApiUrl: string;
  /** URL for file translation API endpoint. */
  private readonly fileTranslationApiUrl: string;

  static override readonly API_NAME: string = AUTO_TRANSLATE_API;

  /**
   * Constructs the AutoTranslateApiService.
   * @param environment The environment configuration injected from Angular DI.
   * @param httpClient The Angular HttpClient instance.
   */
  constructor(
    @Inject(ENVIRONMENT_CONFIG) environment: Environment,
    httpClient: HttpClient,
    loggerService: LoggerService,
  ) {
    const endpointConfig: EndpointConfig = environment.endpoints[AutoTranslateApiService.API_NAME];
    super(endpointConfig, httpClient, loggerService);
    this._baseUrl = endpointConfig.baseUrl;
    this.textTranslationApiUrl = `${this._baseUrl}TranslateText/`;
    this.fileTranslationApiUrl = `${this._baseUrl}TranslateFile/`;
  }

  /**
   * Sends a translation request to the appropriate API endpoint based on the content type.
   * @param request The text translation request payload.
   * @param contentType The type of translation content (e.g., text or file).
   * @returns An observable of the standard response containing the translation result.
   */
  public getTranslation$(request: TextTranslationRequest): Observable<StandardResponse<TextTranslation>> {
    var url =
      request.contentType === TranslationContentType.File
        ? this.fileTranslationApiUrl + request.contentType
        : this.textTranslationApiUrl;
    return this.post<TextTranslation>(`${url}`, request);
  }
}
