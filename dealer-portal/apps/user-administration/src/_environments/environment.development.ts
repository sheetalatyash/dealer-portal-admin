import { EnvironmentName, LogLevel } from '@dealer-portal/polaris-core';
import { SecurityAdminEnvironment } from './security-admin-environment';

/**
 * @constant
 * @name environment
 * @description
 * Configuration object defining all runtime environment settings for the Security Administration application.
 *
 * This object conforms to the {@link SecurityAdminEnvironment} interface and provides URLs, telemetry,
 * translation configuration, and environment flags for the current deployment stage.
 *
 * @type {SecurityAdminEnvironment}
 *
 * @property {string} applicationName - The internal name of the application (e.g., `'userAdministration'`).
 * @property {EnvironmentName} environmentName - The active environment name (e.g., `Local`, `Development`, `Staging`, `Production`).
 * @property {string} portalUrl - The base URL of the Polaris Portal.
 *
 * @property {boolean} isLocal - Indicates whether the environment is a local development environment.
 * @property {boolean} isDevelopment - Indicates whether the environment is a development environment.
 * @property {boolean} isStaging - Indicates whether the environment is a staging environment.
 * @property {boolean} isProduction - Indicates whether the environment is a production environment.
 *
 * @property {object} appInsights - Azure Application Insights configuration.
 * @property {string | undefined} appInsights.connectionString - Connection string for Application Insights telemetry ingestion.
 * @property {LogLevel} appInsights.logLevel - Minimum logging level for telemetry events.
 * @property {boolean} appInsights.enableConsoleLogging - Whether to enable console logging for telemetry events.
 *
 * @property {object} translations - Configuration for translation namespaces and endpoints.
 * @property {string} translations.appName - The translation namespace for this application.
 * @property {string} translations.apiEndpoint - The base endpoint for translation resources.
 *
 * @property {object} endpoints - REST API and external resource endpoints used by the application.
 * @property {{ baseUrl: string }} endpoints.coreApiUrl - Base URL for the Polaris Core API.
 * @property {{ baseUrl: string }} endpoints.userApiUrl - Base URL for the User Administration API.
 * @property {{ baseUrl: string }} endpoints.portalApiUrl - Base URL for the Polaris Portal API.
 * @property {{ baseUrl: string }} endpoints.userInfoApiUrl - Base URL for the User Info API.
 *
 * @property {object} trainingContent - Training resource configuration for the Security Admin application.
 * @property {object} trainingContent.securityAdmin - Security Admin–specific training content.
 * @property {string} trainingContent.securityAdmin.videoUrl - URL to the Security Admin training video.
 * @property {string} trainingContent.securityAdmin.articleUrl - URL to the English version of the Security Admin article.
 * @property {string} trainingContent.securityAdmin.articleUrlFrench - URL to the French version of the Security Admin article.
 */

export const environment: SecurityAdminEnvironment = ((): SecurityAdminEnvironment => {
  const portalUrl: string = 'https://dev.polarisportal.com';

  return {
    applicationName: 'userAdministration',
    environmentName: EnvironmentName.Development,
    portalUrl,
    isLocal: false,
    isDevelopment: true,
    isStaging: false,
    isProduction: false,
    appInsights: {
      connectionString:
        'InstrumentationKey=83b79d02-f794-4d74-a781-c2cbf17d770f;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=ba73b519-813f-4009-b4f8-23c3c1cee37d',
      logLevel: LogLevel.Information,
      enableConsoleLogging: true,
    },
    translations: {
      appName: 'channels-dpp.user-administration',
      apiEndpoint: portalUrl,
    },
    endpoints: {
      coreApiUrl: { baseUrl: 'https://api-core-dev.polarisportal.com/' },
      userApiUrl: { baseUrl: 'https://api-useradmin-dev.polarisportal.com/api/v1/' },
      portalApiUrl: { baseUrl: `${portalUrl}/` },
      userInfoApiUrl: { baseUrl: 'https://api-userinfo-dev.polarisportal.com/' },
    },
    trainingContent: {
      securityAdmin: {
        videoUrl: 'https://player.vimeo.com/video/1132296036',
        articleUrl:
          'https://apps-dev.polarisportal.com/misc/AskPolarisRedirect.asp?redirect=/Home/ViewArticle?articleNumber=KA-03000',
        articleUrlFrench:
          'https://apps-dev.polarisportal.com/misc/AskPolarisRedirect.asp?redirect=/Home/ViewArticle?articleNumber=KA-05394',
      },
    },
  };
})();
