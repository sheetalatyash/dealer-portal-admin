import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Environment, ENVIRONMENT_CONFIG } from '../../_types';
import { deepMerge } from '../../_utils';

/**
 * Interface representing the structure of translations.
 */
export interface Translations {
  [key: string]: any;
}

/**
 * Custom translation loader that fetches translations from a remote API and merges them with local translations.
 */
export class CustomTranslateLoader implements TranslateLoader {
  private _http = inject(HttpClient); 
  private _environment: Environment = inject(ENVIRONMENT_CONFIG);
  private _translations: Translations;

  /**
   * Creates an instance of CustomTranslateLoader.
   * @param translations - The local translations to be merged with the remote translations.
   */
  constructor(translations: Translations) {
    this._translations = translations;
  }

  /**
   * Fetches translations for the specified language.
   * @param lang - The language code for which translations are to be fetched.
   * @returns An observable containing the merged translations.
   */
  getTranslation(lang: string): Observable<any> {
    const apiEndpoint = this._environment.translations.apiEndpoint;
    if (!apiEndpoint) {
      return of(this._translations);
    }

    const appName = this._environment.translations.appName;
    const apiUrl = `${apiEndpoint}/jsl10n/web.${appName}.?json=true&lang=${lang}`;
    return this._http.get(apiUrl).pipe(
      map((response: any) => {
        if (Object.keys(response).length === 0) {
          return this._translations;
        } else {
          const [prefix, app] = appName.split('.');
          const apiTranslations = response.web?.[prefix]?.[app];
          if (!apiTranslations) {
            return this._translations;
          }
          const mergedTranslations = deepMerge({ ...this._translations }, apiTranslations);
          for (const key in this._translations) {
            if (!apiTranslations.hasOwnProperty(key)) {
              //TODO: missing translations we will call api to create key in opti
            }
          }
          return mergedTranslations;
        }
      }),
      catchError(() => of(this._translations))
    );
  }
}
