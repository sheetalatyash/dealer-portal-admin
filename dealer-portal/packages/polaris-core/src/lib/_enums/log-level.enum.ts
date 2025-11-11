/**
 * Enum representing the standard log levels for application insights.
 */
export enum LogLevel {
  /**
   * Detailed information, typically of interest only when diagnosing problems.
   */
  Trace = 0,

  /**
   * Information useful to developers for debugging the application.
   */
  Debug = 1,

  /**
   * Informational messages that highlight the progress of the application at a coarse-grained level.
   */
  Information = 2,

  /**
   * Potentially harmful situations which still allow the application to continue running.
   */
  Warning = 3,

  /**
   * Error events that might still allow the application to continue running.
   */
  Error = 4,

  /**
   * Severe error events that will presumably lead the application to abort.
   */
  Critical = 5
}