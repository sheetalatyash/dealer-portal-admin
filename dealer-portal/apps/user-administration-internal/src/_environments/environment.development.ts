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
    applicationName: 'user-administration-internal',
    environmentName: EnvironmentName.Development,
    portalUrl,
    isLocal: false,
    isDevelopment: true,
    isStaging: false,
    isProduction: false,
    appInsights: {
      connectionString:
        'InstrumentationKey=40385d75-e9fb-4a06-8ba8-0ceabd8ff280;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=0ffee0af-9a0c-4957-b794-96fc28a7c3fe',
      logLevel: LogLevel.Error,
      enableConsoleLogging: true,
    },
    translations: {
      appName: 'channels-dpp.user-administration-internal',
      apiEndpoint: portalUrl,
    },
    endpoints: {
      userApiUrl: { baseUrl: 'https://api-useradmin-dev.polarisportal.com/api/v1/' },
      portalApiUrl: { baseUrl: `${portalUrl}/` },
      userInfoApiUrl: { baseUrl: 'https://api-userinfo-dev.polarisportal.com/' },
    },
  };
})();
