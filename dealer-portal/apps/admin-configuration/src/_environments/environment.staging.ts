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
    applicationName: 'admin-configuration', // Replace with your application name registered in the portal
    environmentName: EnvironmentName.Staging,
    portalUrl,
    isLocal: false,
    isDevelopment: false,
    isStaging: true,
    isProduction: false,
    appInsights: {
      connectionString: undefined,
      logLevel: LogLevel.Error,
      enableConsoleLogging: true,
    },
    translations: {
      appName: 'admin-configuration', // Replace with your application name registered in the portal
      apiEndpoint: portalUrl,
    },
    endpoints: {
      someApiUrl: { baseUrl: 'https://api-<SOME-API-URL>.com/' }, // Replace with your application's API endpoints
    },
  };
})();
