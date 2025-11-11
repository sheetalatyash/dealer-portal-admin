import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  /**
   * Retrieves the CDN path.
   *
   * @returns {string} The CDN path or an empty string if not set.
   */
  public getCDNPath(): string {
    return (window as never)['angularCdnLocation'] ?? '';
  }

  /**
   * Retrieves the document's culture code.
   *
   * @returns {string} The document's culture code or 'en-US' if not set.
   */
  public getCultureCode(): string {
    return document.documentElement.getAttribute('data-culture') ?? 'en-US';
  }
}
