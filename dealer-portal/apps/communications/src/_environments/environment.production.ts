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
 * @property {boolean} isLocal - Indicates if the environment is for local.
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
  const portalUrl: string = 'https://www.polarisportal.com';

  return {
    applicationName: 'communications',
    environmentName: EnvironmentName.Production,
    portalUrl,
    isLocal: false,
    isDevelopment: false,
    isStaging: false,
    isProduction: true,
    appInsights: {
      connectionString:
        'InstrumentationKey=f6b44017-0fe6-4ade-9111-f72879cff6f4;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=ad9400bc-805c-47d0-b8a2-ef2352929b83',
      logLevel: LogLevel.Error,
      enableConsoleLogging: false,
    },
    translations: {
      appName: 'channels-dpp.communications',
      apiEndpoint: portalUrl,
    },
    endpoints: {
      accountConnectorApiUrl: { baseUrl: 'https://api-accountconnector.polarisportal.com/api/v1/' },
      communicationApiUrl: {
        baseUrl: 'https://api.polarisportal.com/api/channels/dpp/communication',
        apimSubscriptionKey: '55c48c2a504a4a7d8493b892eef03ed8',
      },
      coreApiUrl: { baseUrl: 'https://api-core.polarisportal.com/' },
      cdnUrl: { baseUrl: 'https://cdn.polarisportal.com' },
      dealerPortalApiUrl: { baseUrl: `${portalUrl}/` },
      newsUrl: { baseUrl: 'https://home.polarisportal.com/Home/News' },
      userInfoApiUrl: { baseUrl: 'https://api-userinfo.polarisportal.com/' },
      legacyPortalUrl: { baseUrl: 'https://apps.polarisportal.com/' },
      trainingUrl: { baseUrl: 'https://ask-stage.polarisdealers.com/Home/ViewArticle?articleNumber=KA-03001/' },
      polarisConnectUrl: { baseUrl: 'https://home.polarisportal.com/polarisconnect' },
    },
    trainingContent: {
      homepageAndNavigation: {
        videoUrl: 'https://player.vimeo.com/video/1128246484',
        articleUrl:
          'https://apps.polarisportal.com/misc/AskPolarisRedirect.asp?redirect=/Home/ViewArticle?articleNumber=KA-06853',
        articleUrlFrench:
          'https://apps.polarisportal.com/misc/AskPolarisRedirect.asp?redirect=/Home/ViewArticle?articleNumber=KA-07043',
      },
      securityAdmin: {
        videoUrl: 'https://player.vimeo.com/video/1132296036',
        articleUrl:
          'https://apps.polarisportal.com/misc/AskPolarisRedirect.asp?redirect=/Home/ViewArticle?articleNumber=KA-06870',
        articleUrlFrench:
          'https://apps.polarisportal.com/misc/AskPolarisRedirect.asp?redirect=/Home/ViewArticle?articleNumber=KA-07044',
      },
    },
  };
})();
