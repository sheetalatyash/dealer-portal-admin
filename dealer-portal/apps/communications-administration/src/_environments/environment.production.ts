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
  const portalUrl: string = 'https://www.polarisportal.com';

  return {
    applicationName: 'CommunicationAdmin',
    environmentName: EnvironmentName.Production,
    portalUrl,
    isLocal: false,
    isDevelopment: false,
    isStaging: false,
    isProduction: true,
    appInsights: {
      connectionString:
        'InstrumentationKey=c54fbc28-ff17-4542-aba7-62be7807840e;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=d698d271-2229-456d-8397-442b219e52d7',
      logLevel: LogLevel.Error,
      enableConsoleLogging: false,
    },
    translations: {
      appName: 'channels-dpp.communications-administration',
      apiEndpoint: portalUrl,
    },
    endpoints: {
      accountApiUrl: { baseUrl: 'https://api-account.polarisportal.com/' },
      communicationApiUrl: {
        baseUrl: 'https://api.polarisportal.com/api/channels/dpp/communication',
        apimSubscriptionKey: '7b6bffa204c24304b98f041bb3878dfe',
      },
      coreApiUrl: { baseUrl: 'https://api-core.polarisportal.com/' },
      dealerPortalApiUrl: { baseUrl: `${portalUrl}/` },
      salesHierarchyApiUrl: { baseUrl: 'https://api-saleshierarchy.polarisportal.com/' },
      translationApiUrl: { baseUrl: 'https://api-translation.polarisportal.com/api/v1/' },
      userAdminApiUrl: { baseUrl: 'https://api-useradmin.polarisportal.com/api/v1/' },
    },
  };
})();
