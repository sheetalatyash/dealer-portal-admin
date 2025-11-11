import { InjectionToken } from '@angular/core';
import { EnvironmentName, LogLevel } from '../_enums';
import { EndpointConfig } from './endpoint-config.type';

/**
 * Injection token for the environment configuration.
 * This token is used to inject the environment configuration into Angular services or components.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ENVIRONMENT_CONFIG: InjectionToken<Environment> = new InjectionToken<Environment>('environment.config');

/**
 * Represents the configuration settings for different environments.
 */
export interface Environment {
  /**
   * The Application Name.
   */
  applicationName: string;

  /**
   * The name of the environment.
   */
  environmentName: EnvironmentName;

  portalUrl: string;

  /**
   * Indicates if the environment is for local development.
   */
  isLocal: boolean;

  /**
   * Indicates if the environment is for development on higher env.
   */
  isDevelopment: boolean;

  /**
   * Indicates if the environment is for staging on higher env.
   */
  isStaging: boolean;

  /**
   * Indicates if the environment is for production on higher env.
   */
  isProduction: boolean;

  /**
   * The Application Insights configuration object.
   */
  appInsights: {
    /**
     * Connection string for Application Insights.
     *
     * Replace with your actual connection string.
     *
     * This is used to send telemetry data to Application Insights.
     */
    connectionString: string | undefined;

    /**
     * The log level for Application Insights.
     *
     * This should be one of the values from the LogLevel enum.
     */
    logLevel: LogLevel;

    /**
     * Flag to enable or disable console logging.
     *
     * Set to false to disable console logging in production environment!
     *
     * This helps in reducing noise in the console output.
     */
    enableConsoleLogging: boolean;
  };

  /**
   * Translations configuration.
   */
  translations: {
    /**
     * The name of the application.
     */
    appName: string;

    /**
     * The endpoint for the translation API.
     */
    apiEndpoint: string | undefined;
  };

  /**
   * List of endpoints for the application.
   */
  endpoints: Record<string, EndpointConfig>;

  /**
   * The Optimizely page ID for the dealer profile application.
   */
  dealerProfileAppId?: number;

    /**
   * The Optimizely page ID for the business plan application.
   */
  businessPlanDeepLinkId?: number;
}
