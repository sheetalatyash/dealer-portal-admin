import { EnvironmentName, LogLevel } from '@dealer-portal/polaris-core';
import { HomepageEnvironment } from './homepage-environment';

/**
 * @constant
 * @name environment
 * @description Configuration object for the application's environment settings.
 * @type {Environment}
 * @property {string} applicationName - The name of the application.
 * @property {EnvironmentName} environmentName - The name of the environment (e.g., Local, Production).
 * @property {string} portalUrl - The URL of the portal.
 * @property {boolean} isLocal - Indicates if the environment is for Local.
 * @property {boolean} isDevelopment - Indicates if the environment is for development.
 * @property {boolean} isStaging - Indicates if the environment is for staging.
 * @property {boolean} isProduction - Indicates if the environment is for production.
 * @property {object} appInsights - Configuration for Application Insights.
 * @property {string | undefined} appInsights.connectionString - Connection string for Application Insights.
 * @property {LogLevel} appInsights.logLevel - Log level for Application Insights.
 * @property {boolean} appInsights.enableConsoleLogging - Enables or disables console logging for Application Insights.
 * @property {object} translations - Translations configuration.
 * @property {Record<string, string>} endpoints - List of endpoints for the application.
 */

export const environment: HomepageEnvironment = ((): HomepageEnvironment => {
  const portalUrl: string = 'https://dev.polarisportal.com';

  return {
    applicationName: 'communications',
    environmentName: EnvironmentName.Local,
    portalUrl,
    isLocal: true,
    isDevelopment: false,
    isStaging: false,
    isProduction: false,
    appInsights: {
      connectionString: undefined,
      logLevel: LogLevel.Trace,
      enableConsoleLogging: true,
    },
    translations: {
      appName: 'channels-dpp.communications',
      apiEndpoint: portalUrl,
    },
    endpoints: {
      accountConnectorApiUrl: { baseUrl: 'https://api-accountconnector-dev.polarisportal.com/api/v1/' },
      communicationApiUrl: {
        baseUrl: 'https://api-dev.polarisportal.com/api/channels/dpp/communication',
        apimSubscriptionKey: '6c50cbfaef4d47b5a48ec64c7584f1ca',
      },
      coreApiUrl: { baseUrl: 'https://api-core-dev.polarisportal.com/' },
      cdnUrl: { baseUrl: 'https://cdn-dev.polarisportal.com' },
      dealerPortalApiUrl: { baseUrl: `${portalUrl}/` },
      newsUrl: { baseUrl: 'https://home-stage.polarisportal.com/Home/News' },
      userInfoApiUrl: { baseUrl: 'https://api-userinfo-dev.polarisportal.com/' },
      legacyPortalUrl: { baseUrl: 'https://apps-dev.polarisportal.com/' },
      polarisConnectUrl: { baseUrl: 'https://home-dev.polarisportal.com/polarisconnect' },
    },
    trainingContent: {
      homepageAndNavigation: {
        videoUrl: 'https://player.vimeo.com/video/1128246484',
        // This is not the real article, just a placeholder that works for lower environments
        articleUrl:
          'https://apps-dev.polarisportal.com/misc/AskPolarisRedirect.asp?redirect=/Home/ViewArticle?articleNumber=KA-04243',
        // This is not the real article, just a placeholder that works for lower environments
        articleUrlFrench:
          'https://apps-dev.polarisportal.com/misc/AskPolarisRedirect.asp?redirect=/Home/ViewArticle?articleNumber=KA-03409',
      },
      securityAdmin: {
        videoUrl: 'https://player.vimeo.com/video/1132296036',
        // This is not the real article, just a placeholder that works for lower environments
        articleUrl:
          'https://apps-dev.polarisportal.com/misc/AskPolarisRedirect.asp?redirect=/Home/ViewArticle?articleNumber=KA-03000',
        // This is not the real article, just a placeholder that works for lower environments
        articleUrlFrench:
          'https://apps-dev.polarisportal.com/misc/AskPolarisRedirect.asp?redirect=/Home/ViewArticle?articleNumber=KA-05394',
      },
    },
  };
})();
