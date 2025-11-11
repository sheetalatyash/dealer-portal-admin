import { Environment, EnvironmentName, LogLevel } from '@dealer-portal/polaris-core';

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

export const environment: Environment = ((): Environment => {
  const portalUrl: string = 'https://stg.polarisportal.com';

  return {
    applicationName: 'CommunicationAdmin',
    environmentName: EnvironmentName.Staging,
    portalUrl,
    isLocal: false,
    isDevelopment: false,
    isStaging: true,
    isProduction: false,
    appInsights: {
      connectionString:
        'InstrumentationKey=2717eeb4-a408-4867-9b8c-e9c6e1bc6e4d;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=10e94283-96ec-4a32-9e4c-b67ac2d7b719',
      logLevel: LogLevel.Warning,
      enableConsoleLogging: true,
    },
    translations: {
      appName: 'channels-dpp.communications-administration',
      apiEndpoint: portalUrl,
    },
    endpoints: {
      accountApiUrl: { baseUrl: 'https://api-account-stg.polarisportal.com/' },
      communicationApiUrl: {
        baseUrl: 'https://api-stg.polarisportal.com/api/channels/dpp/communication',
        apimSubscriptionKey: '808db8891b0b4be39d9b365bca78a6d7',
      },
      coreApiUrl: { baseUrl: 'https://api-core-stg.polarisportal.com/' },
      dealerPortalApiUrl: { baseUrl: `${portalUrl}/` },
      salesHierarchyApiUrl: { baseUrl: 'https://api-saleshierarchy-stg.polarisportal.com/' },
      translationApiUrl: { baseUrl: 'https://api-translation-stg.polarisportal.com/api/v1/' },
      userAdminApiUrl: { baseUrl: 'https://api-useradmin-stg.polarisportal.com/api/v1/' },
    },
  };
})();
