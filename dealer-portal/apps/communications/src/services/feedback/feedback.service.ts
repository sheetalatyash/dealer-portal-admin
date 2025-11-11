import { Injectable, Inject } from '@angular/core';
import { ENVIRONMENT_CONFIG, Environment, UserAccountService, ResourceService } from '@dealer-portal/polaris-core';

/**
 * Service responsible for injecting the Polaris feedback web component into the application.
 * Handles loading required scripts and setting up the feedback component with user and campaign data.
 */
@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  /** CDN base URL for loading feedback resources. */
  private _cdnUrl: string = '';
  /** Campaign code used for feedback tracking. */
  private _campaignCode: string = 'A1A1';
  /** Source URL for the web components loader script. */
  private _webComponentSrc: string = 'https://unpkg.com/@@webcomponents/webcomponentsjs@@2.4.2/webcomponents-loader.js';

  /**
   * Constructs the FeedbackService.
   * @param environment Environment configuration injected from Angular DI.
   * @param _userAccountService Service providing user account information.
   * @param _resourceService Service providing resource and localization information.
   */
  constructor(
    @Inject(ENVIRONMENT_CONFIG) environment: Environment,
    private _userAccountService: UserAccountService,
    private _resourceService: ResourceService
  ) {
    this._cdnUrl = environment.endpoints['cdnUrl']?.baseUrl;
  }

  /**
   * Injects the Polaris feedback web component into the DOM.
   * Loads required scripts and sets up the component with user and campaign attributes.
   * Only injects for non-impersonated, external users.
   */
  public injectFeedbackComponent(): void {
    if (this._cdnUrl && typeof this._cdnUrl === 'string' && this._cdnUrl.trim() !== '') {
      const webComponentScript = document.createElement('script');
      webComponentScript.src = this._webComponentSrc;
      document.body.appendChild(webComponentScript);

      const script = document.createElement('script');
      script.src = `${this._cdnUrl}/javascript/polaris-app-feedback.js`;
      document.body.appendChild(script);

      if (!this._userAccountService.userAccount.isImpersonating && this._userAccountService.userAccount.isInternalUser === 'false') {
        const feedback = document.createElement('polaris-feedback');
        feedback.setAttribute('dealerid', this._userAccountService.userAccount.accountNumber);
        feedback.setAttribute('employeeid', this._userAccountService.userAccount.empid);
        feedback.setAttribute('campaigncode', this._campaignCode);
        feedback.setAttribute('languageCode', this._resourceService.getCultureCode());
        document.body.appendChild(feedback);
      }
    }
  }
}
