import { Injectable } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { AutoTranslateApiService, StandardResponse, TextTranslationRequest, TranslationContentType } from "../../_apis";
import { Observable, map } from "rxjs";
import { TextTranslation } from "../../_apis/auto-translate/_types";

/**
 * Service for handling auto-translation operations.
 * Provides methods to translate content using the AutoTranslateApiService.
 */
@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class AutoTranslateService {
  /**
   * Constructs the AutoTranslateService.
   * @param _autoTranslateApiService The API service used to perform translation requests.
   */
  constructor(private _autoTranslateApiService: AutoTranslateApiService) {
  }

  /**
   * Translates the provided content from one culture code to another using the specified content type.
   * @param content The text content to translate.
   * @param contentType The type of translation content (e.g., text or file).
   * @param fromCultureCode The source language/culture code.
   * @param toCultureCode The target language/culture code.
   * @returns An observable emitting the translated text.
   */
  public getTranslation$(content: string, contentType: TranslationContentType, fromCultureCode: string, toCultureCode: string): Observable<TextTranslation> {
    const request = new TextTranslationRequest(content, contentType, fromCultureCode, toCultureCode);
    return this._autoTranslateApiService.getTranslation$(request).pipe(
      map((response: StandardResponse<TextTranslation>): TextTranslation => response.data as TextTranslation)
    );
  }
}
