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
  const portalUrl: string = 'https://dev.polarisportal.com';

  return {
    applicationName: 'CommunicationAdmin',
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
      appName: 'channels-dpp.communications-administration',
      apiEndpoint: portalUrl,
    },
    endpoints: {
      accountApiUrl: { baseUrl: 'https://api-account-dev.polarisportal.com/' },
      communicationApiUrl: {
        baseUrl: 'https://api-dev.polarisportal.com/api/channels/dpp/communication',
        apimSubscriptionKey: '789d0c31c8114a899940e2db430bd74d',
      },
      coreApiUrl: { baseUrl: 'https://api-core-dev.polarisportal.com/' },
      dealerPortalApiUrl: { baseUrl: `${portalUrl}/` },
      salesHierarchyApiUrl: { baseUrl: 'https://api-saleshierarchy-dev.polarisportal.com/' },
      translationApiUrl: { baseUrl: 'https://api-translation-dev.polarisportal.com/api/v1/' },
      userAdminApiUrl: { baseUrl: 'https://api-useradmin-dev.polarisportal.com/api/v1/' },
    },
  };
})();
