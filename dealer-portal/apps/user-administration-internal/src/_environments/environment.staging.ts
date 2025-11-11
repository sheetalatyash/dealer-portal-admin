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
    applicationName: 'user-administration-internal',
    environmentName: EnvironmentName.Staging,
    portalUrl,
    isLocal: false,
    isDevelopment: false,
    isStaging: true,
    isProduction: false,
    appInsights: {
      connectionString:
        'InstrumentationKey=6ff9839b-aeb3-42ae-845c-118b8b6ab718;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=33eee237-c3c9-4289-852d-2ca68afff331',
      logLevel: LogLevel.Error,
      enableConsoleLogging: true,
    },
    translations: {
      appName: 'channels-dpp.user-administration-internal',
      apiEndpoint: portalUrl,
    },
    endpoints: {
      userApiUrl: { baseUrl: 'https://api-useradmin-stg.polarisportal.com/api/v1/' },
      portalApiUrl: { baseUrl: `${portalUrl}/` },
      userInfoApiUrl: { baseUrl: 'https://api-userinfo-stg.polarisportal.com/' },
    },
  };
})();
