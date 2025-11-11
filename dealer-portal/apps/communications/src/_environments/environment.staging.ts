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
  const portalUrl: string = 'https://stg.polarisportal.com';

  return {
    applicationName: 'communications',
    environmentName: EnvironmentName.Staging,
    portalUrl,
    isLocal: false,
    isDevelopment: false,
    isStaging: true,
    isProduction: false,
    appInsights: {
      connectionString:
        'InstrumentationKey=331f2019-ad8e-4408-bf33-74b69b5c07cc;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=b82c41a9-e54f-428c-9964-0388284b9344',
      logLevel: LogLevel.Warning,
      enableConsoleLogging: true,
    },
    translations: {
      appName: 'channels-dpp.communications',
      apiEndpoint: portalUrl,
    },
    endpoints: {
      accountConnectorApiUrl: { baseUrl: 'https://api-accountconnector-stg.polarisportal.com/api/v1/' },
      communicationApiUrl: {
        baseUrl: 'https://api-stg.polarisportal.com/api/channels/dpp/communication',
        apimSubscriptionKey: 'f268298e3b224578807419e9dfad5d49',
      },
      coreApiUrl: { baseUrl: 'https://api-core-stg.polarisportal.com/' },
      cdnUrl: { baseUrl: 'https://cdn-stg.polarisportal.com' },
      dealerPortalApiUrl: { baseUrl: `${portalUrl}/` },
      newsUrl: { baseUrl: 'https://home-stage.polarisportal.com/Home/News' },
      userInfoApiUrl: { baseUrl: 'https://api-userinfo-stg.polarisportal.com/' },
      legacyPortalUrl: { baseUrl: 'https://apps-stg.polarisportal.com/' },
      polarisConnectUrl: { baseUrl: 'https://home-stage.polarisportal.com/polarisconnect' },
    },
    trainingContent: {
      homepageAndNavigation: {
        videoUrl: 'https://player.vimeo.com/video/1128246484',
        // This is not the real article, just a placeholder that works for lower environments
        articleUrl:
          'https://apps-stg.polarisportal.com/misc/AskPolarisRedirect.asp?redirect=/Home/ViewArticle?articleNumber=KA-03000',
        // This is not the real article, just a placeholder that works for lower environments
        articleUrlFrench:
          'https://apps-stg.polarisportal.com/misc/AskPolarisRedirect.asp?redirect=/Home/ViewArticle?articleNumber=KA-05394',
      },
      securityAdmin: {
        videoUrl: 'https://player.vimeo.com/video/1132296036',
        // This is not the real article, just a placeholder that works for lower environments
        articleUrl:
          'https://apps-stg.polarisportal.com/misc/AskPolarisRedirect.asp?redirect=/Home/ViewArticle?articleNumber=KA-05385',
        // This is not the real article, just a placeholder that works for lower environments
        articleUrlFrench:
          'https://apps-stg.polarisportal.com/misc/AskPolarisRedirect.asp?redirect=/Home/ViewArticle?articleNumber=KA-04243',
      },
    },
  };
})();
