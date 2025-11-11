import { ErrorHandler, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularPlugin } from '@microsoft/applicationinsights-angularplugin-js';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { LogLevel } from '../../_enums';
import { Environment, ENVIRONMENT_CONFIG } from '../../_types';

/**
 * Service for logging messages, page views, and events using Application Insights and console logging.
 *
 * @example
 * // In your component/service inject the LoggerService
 * constructor(private _loggingService: LoggerService) { }
 * // After that you can then use _loggingService to start logging
 */
@Injectable({
  providedIn: 'root',
})
export class LoggerService implements ErrorHandler {
  /**
   * Application Insights API
   */
  private readonly _appInsights: ApplicationInsights | null = null;

  /**
   * Enum representing the standard log levels for application insights.
   */
  private readonly _logLevel: LogLevel;

  /**
   * Flag to enable or disable console logging.
   *
   * Set to false to disable console logging in production environment!
   *
   * This helps in reducing noise in the console output.
   */
  private readonly _enableConsoleLogging: boolean;

  /**
   * Initializes the LoggerService.
   * @param _router Angular Router for navigation tracking.
   * @param environment Environment configuration injected with ENVIRONMENT_CONFIG.
   */
  constructor(private _router: Router, @Inject(ENVIRONMENT_CONFIG) environment: Environment) {
    const angularPlugin: AngularPlugin = new AngularPlugin();
    // If we have a connection string we want to use application insights - normally not used for local, but higher env's we want to use it
    if (environment.appInsights.connectionString) {
      this._appInsights = new ApplicationInsights({
        config: {
          connectionString: environment.appInsights.connectionString,
          extensions: [angularPlugin],
          //TODO: Check to see if this is helpful or remove if we are going to use google analytics
          extensionConfig: {
            [angularPlugin.identifier]: { router: this._router },
          },
        },
      });

      // Load the Application Insights SDK asynchronously to initialize it.
      this._appInsights.loadAppInsights();
    }

    this._logLevel = environment.appInsights.logLevel;
    this._enableConsoleLogging = environment.appInsights.enableConsoleLogging;
  }

  /**
   * Detailed information, typically of interest only when diagnosing problems.
   * @param {string} message - The message to log.
   * @param {Object} [properties] - Additional properties to include with the log entry.
   * @returns {void} This function does not return anything.
   *
   * @example
   * // Log a trace message
   * this._loggerService.logTrace("This is a trace message");
   *
   * // Log a trace message with additional properties
   * this._loggerService.logTrace("This is a trace message", { userId: 12345 });
   */
  public logTrace(message: string, properties?: Record<string, unknown>): void {
    this._log(LogLevel.Trace, message, properties);
  }

  /**
   * Information useful to developers for debugging the application.
   * @param {string} message - The message to log.
   * @param {Object} [properties] - Additional properties to include with the log entry.
   * @returns {void} This function does not return anything.
   *
   * @example
   * // Log a debug message
   * this._loggerService.logDebug("This is a debug message");
   *
   * // Log a debug message with additional properties
   * this._loggerService.logDebug("This is a debug message", { userId: 12345 });
   */
  public logDebug(message: string, properties?: Record<string, unknown>): void {
    this._log(LogLevel.Debug, message, properties);
  }

  /**
   * Informational messages that highlight the progress of the application at a coarse-grained level.
   * @param {string} message - The message to log.
   * @param {Object} [properties] - Additional properties to include with the log entry.
   * @returns {void} This function does not return anything.
   *
   * @example
   * // Log an informational message
   * this._loggerService.logInformation("This is a informational message");
   *
   * // Log an informational message with additional properties
   * this._loggerService.logInformation("This is a informational message", { userId: 12345 });
   */
  public logInformation(message: string, properties?: Record<string, unknown>): void {
    this._log(LogLevel.Information, message, properties);
  }

  /**
   * Potentially harmful situations which still allow the application to continue running.
   * @param {string} message - The message to log.
   * @param {Object} [properties] - Additional properties to include with the log entry.
   * @returns {void} This function does not return anything.
   *
   * @example
   * // Log a warning message
   * this._loggerService.logWarning("This is a warning message");
   *
   * // Log a warning message with additional properties
   * this._loggerService.logWarning("This is a warning message", { userId: 12345 });
   */
  public logWarning(message: string, properties?: Record<string, unknown>): void {
    this._log(LogLevel.Warning, message, properties);
  }

  /**
   * Error events that might still allow the application to continue running.
   * @param {string} message - The message to log.
   * @param {Object} [properties] - Additional properties to include with the log entry.
   * @returns {void} This function does not return anything.
   *
   * @example
   * // Log an error message
   * this._loggerService.logError("This is a error message");
   *
   * // Log an error message with additional properties
   * this._loggerService.logError("This is a error message", { userId: 12345 });
   */
  public logError(message: string, properties?: Record<string, unknown>): void {
    this._log(LogLevel.Error, message, properties);

    // Flush logs immediately after an error log for faster transmission
    this.flush();
  }

  /**
   * Severe error events that will presumably lead the application to abort.
   * @param {string} message - The message to log.
   * @param {Object} [properties] - Additional properties to include with the log entry.
   * @returns {void} This function does not return anything.
   *
   * @example
   * // Log a critical message
   * this._loggerService.logCritical("This is a critical message");
   *
   * // Log a critical message with additional properties
   * this._loggerService.logCritical("This is a critical message", { userId: 12345 });
   */
  public logCritical(message: string, properties?: Record<string, unknown>): void {
    this._log(LogLevel.Critical, message, properties);

    // Flush logs immediately after a critical log for faster transmission
    this.flush();
  }

  /**
   * Logs a message with the specified log level.
   * @param level Log level (Trace, Debug, Information, Warning, Error, Critical).
   * @param message Log message.
   * @param properties Optional additional properties.
   * @returns {void} This function does not return anything.
   *
   * @example
   * // Log an informational message
   * this._loggerService.log(LogLevel.Information, 'This is an informational message');
   *
   * // Log an error message with additional properties
   * this._loggerService.log(LogLevel.Error, 'An error occurred', { userId: 12345 });
   */
  private _log(level: LogLevel, message: string, properties?: Record<string, unknown>): void {
    // Check to see if based environment logging level if we should log anything at all
    if (level >= this._logLevel) {
      const stackInfo: string | undefined = this._getStackInfo();
      // Check to see if based environment is we want to log to console - prod we would not have this enabled
      if (this._enableConsoleLogging) {
        const logMessage: string = `${message} (${stackInfo})`;
        this._consoleLog(level, logMessage, properties);
      }
      // If we have appInsights for our environment
      if (this._appInsights) {
        // If error or height we tack and exception
        if (level >= LogLevel.Error) {
          const appInsightsProperties: Record<string, unknown> =
            this._appInsightsPropertiesForTrackException(properties);
          this._appInsights.trackException(
            { exception: new Error(message), severityLevel: level },
            appInsightsProperties,
          );
        } else {
          // Else we just trace it
          const appInsightsProperties: Record<string, unknown> = this._appInsightsPropertiesForTrackTrace(
            stackInfo,
            properties,
          );
          this._appInsights.trackTrace({ message, severityLevel: level }, appInsightsProperties);
        }
      }
    }
  }

  /**
   * Constructs an object containing properties for tracking trace information with Application Insights.
   * @param {string | undefined} stackInfo - Stack trace information.
   * @param {object | undefined} properties - Optional custom properties to include in the tracking data.
   * @returns {Record<string, unknown>} An object containing the combined properties, stack trace information, and the current URL.
   */
  private _appInsightsPropertiesForTrackTrace(
    stackInfo: string | undefined,
    properties?: Record<string, unknown>,
  ): Record<string, unknown> {
    return {
      ...properties,
      stackInfo,
      url: window.location.href,
    };
  }

  /**
   * Constructs a record containing properties for tracking exception information with Application Insights.
   * @param {object | undefined} properties - Optional custom properties to include in the tracking data.
   * @returns {Record<string, unknown>} An record containing the combined properties and the current URL.
   */
  private _appInsightsPropertiesForTrackException(properties?: Record<string, unknown>): Record<string, unknown> {
    return {
      ...properties,
      url: window.location.href,
    };
  }

  /**
   * Logs a message to the console.
   * @param level Log level.
   * @param message Log message.
   * @param properties Optional additional properties.
   * @returns {void} This function does not return anything.
   */
  private _consoleLog(level: LogLevel, message: string, properties?: Record<string, unknown>): void {
    const logMessage = `[${LogLevel[level]}] ${message}`;

    // Temporarily disable eslint no-console rule
    /* eslint-disable no-console */
    switch (level) {
      case LogLevel.Trace:
      case LogLevel.Debug:
        console.debug(logMessage, properties);
        break;
      case LogLevel.Information:
        console.info(logMessage, properties);
        break;
      case LogLevel.Warning:
        console.warn(logMessage, properties);
        break;
      case LogLevel.Error:
      case LogLevel.Critical:
        console.error(logMessage, properties);
        break;
    }
    /* eslint-enable no-console */
    // Re-enable eslint no-console rule
  }

  /**
   * Extracts the current stack trace.
   * @returns {string | undefined} The current stack trace as a string, or undefined if not available.
   *
   * @example
   * // Example usage:
   * const stackInfo = this.getStackInfo();
   */
  private _getStackInfo(): string | undefined {
    return new Error()?.stack;
  }

  /**
   * Logs a page view.
   * @param name Optional name of the page.
   * @param url Optional URL of the page.
   * @returns {void} This function does not return anything.
   *
   * @example
   * // Log a page view with name and URL
   * this._loggerService.logPageView('HomePage', '/home');
   */
  public logPageView(name?: string, url?: string): void {
    // Log the page view to the console if enabled
    if (this._enableConsoleLogging) {
      this._consoleLog(LogLevel.Information, `[PageView] name: ${name}, url: ${url}`);
    }

    // Log the page view to Application Insights if enabled
    if (this._appInsights) {
      this._appInsights.trackPageView({ name, uri: url });
    }
  }

  /**
   * Track Custom Events: This method allows you to log custom events in your application.
   *
   * These events can represent user actions, such as button clicks, feature usage, or any other significant occurrences within your app.
   * @param name Name of the event.
   * @param properties Optional additional properties.
   * @returns {void} This function does not return anything.
   *
   * @example
   * // Log a custom event with properties
   * this._loggerService.logEvent('UserSignup', { userId: '12345' });
   */
  public logEvent(name: string, properties?: { [key: string]: unknown }): void {
    // Log the event to the console if enabled
    if (this._enableConsoleLogging) {
      this._consoleLog(LogLevel.Information, `[Event] name: ${name}`, properties);
    }

    // Log the event to Application Insights if enabled
    if (this._appInsights) {
      this._appInsights.trackEvent({ name }, properties);
    }
  }

  /**
   * Forces immediate transmission of all telemetry data currently in the buffer.
   * This bypasses the normal batching interval and sends logs immediately to Application Insights.
   * @param isAsync - Whether to flush asynchronously (default: true)
   * @returns {void} This function does not return anything.
   *
   * @example
   * // Force immediate send of all pending logs
   * this._loggerService.flush();
   *
   * // Force immediate synchronous send (use with caution)
   * this._loggerService.flush(false);
   */
  public flush(isAsync: boolean = true): void {
    if (this._appInsights) {
      try {
        this._appInsights.flush(isAsync);
      } catch (error) {
        if (this._enableConsoleLogging) {
          console.error('[LoggerService] Failed to flush Application Insights:', error);
        }
      }
    }
  }

  /**
   * Handles Angular errors.
   * @param error The error to handle.
   * @returns {void} This function does not return anything.
   *
   * @example
   * // Angular will automatically call this method when an error occurs when provided as a ErrorHandler in provided in the ApplicationConfig providers.
   */
  public handleError(error: Error): void {
    const message: string = error.message ? error.message : error.toString();
    this.logError(message, { stack: error.stack });
  }
}
