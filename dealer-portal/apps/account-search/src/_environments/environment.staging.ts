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
 * @property {number} dealerProfileAppId - The Optimizely page ID for the dealer profile application.
 * @property {number} businessPlanDeepLinkId - The Optimizely deep link ID for the business plan feature.
 */

export const environment: Environment = ((): Environment => {
  const portalUrl: string = 'https://stg.polarisportal.com';

  return {
    applicationName: 'AccountSearch',
    environmentName: EnvironmentName.Staging,
    portalUrl,
    isLocal: false,
    isDevelopment: false,
    isStaging: true,
    isProduction: false,
    appInsights: {
      connectionString:
        'InstrumentationKey=cbdf102b-832b-4ef4-972c-66d20ee9541f;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=5be4ee8b-64de-4983-be9e-591970cace66',
      logLevel: LogLevel.Warning,
      enableConsoleLogging: true,
    },
    translations: {
      appName: 'channels-dpp.account-search',
      apiEndpoint: portalUrl,
    },
    endpoints: {
      accountApiUrl: { baseUrl: 'https://api-account-stg.polarisportal.com/' },
      coreApiUrl: { baseUrl: 'https://api-core-stg.polarisportal.com/' },
      dealerPortalUrl: { baseUrl: 'https://apps-stg.polarisportal.com/' },
      dealerPortalApiUrl: { baseUrl: `${portalUrl}/` },
      salesHierarchyApiUrl: { baseUrl: 'https://api-saleshierarchy-stg.polarisportal.com/' },
      userAdminApiUrl: { baseUrl: 'https://api-useradmin-stg.polarisportal.com/api/v1/' },
      userInfoApiUrl: { baseUrl: 'https://api-userinfo-stg.polarisportal.com/' },
    },
    dealerProfileAppId: 67,
    businessPlanDeepLinkId: 65,
  };
})();
