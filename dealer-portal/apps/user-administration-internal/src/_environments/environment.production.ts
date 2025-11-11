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
    applicationName: 'user-administration-internal',
    environmentName: EnvironmentName.Production,
    portalUrl,
    isLocal: false,
    isDevelopment: false,
    isStaging: false,
    isProduction: true,
    appInsights: {
      connectionString:
        'InstrumentationKey=7e9cd128-0c0a-4d9f-80fa-38f78717e9ff;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=b6d15916-32bd-4e43-b317-38306c172c98',
      logLevel: LogLevel.Error,
      enableConsoleLogging: false,
    },
    translations: {
      appName: 'channels-dpp.user-administration-internal',
      apiEndpoint: portalUrl,
    },
    endpoints: {
      userApiUrl: { baseUrl: 'https://api-useradmin.polarisportal.com/api/v1/' },
      portalApiUrl: { baseUrl: `${portalUrl}/` },
      userInfoApiUrl: { baseUrl: 'https://api-userinfo.polarisportal.com/' },
    },
  };
})();
