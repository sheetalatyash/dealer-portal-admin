import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { LoggerService } from './logger.service';
import { LogLevel } from '../../_enums';
import { Environment, ENVIRONMENT_CONFIG } from '../../_types';

describe('LoggerService', () => {
  let service: LoggerService;
  let router: Router;
  let appInsights: ApplicationInsights;
  let environmentMock: Partial<Environment> = {
    appInsights: {
      connectionString: undefined,
      logLevel: LogLevel.Trace,
      enableConsoleLogging: true,
    },
  };

  /**
   * Configures the LoggerService with the specified log level and console logging setting.
   * @param logLevel The log level to set for the LoggerService.
   * @param enableConsoleLogging A boolean indicating whether console logging should be enabled.
   */
  const configureService = (logLevel: LogLevel, enableConsoleLogging: boolean): void => {
    if (environmentMock.appInsights) {
      environmentMock.appInsights.logLevel = logLevel;
      environmentMock.appInsights.enableConsoleLogging = enableConsoleLogging;
    }

    // Override the ENVIRONMENT_CONFIG provider with the mock environment configuration
    TestBed.overrideProvider(ENVIRONMENT_CONFIG, { useValue: environmentMock });

    // Inject the LoggerService
    service = TestBed.inject(LoggerService);

    // Set the private _appInsights property to the mock instance
    // Since we are constructing app insights in the service, we need this 'hack' to use a mock instance
    (service as any)._appInsights = appInsights;
  };

  beforeEach(() => {
    router = { navigate: jest.fn() } as never;
    appInsights = {
      loadAppInsights: jest.fn(),
      trackTrace: jest.fn(),
      trackException: jest.fn(),
      trackPageView: jest.fn(),
      trackEvent: jest.fn(),
    } as unknown as ApplicationInsights;

    TestBed.configureTestingModule({
      providers: [LoggerService, { provide: Router, useValue: router }],
    });

    TestBed.overrideProvider(ENVIRONMENT_CONFIG, { useValue: environmentMock });

    // Add mocks to the console objects to clean up tests
    global.console = {
      ...console,
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
  });

  it('should be created', () => {
    configureService(LogLevel.Trace, false);
    expect(service).toBeTruthy();
  });

  describe('logTrace', () => {
    it('should log a trace message when log level is Trace', () => {
      // Arrange
      const logMessage = 'Trace message';
      const logLevel = LogLevel.Trace;
      configureService(logLevel, false);

      // Act
      service.logTrace(logMessage);

      // Assert
      expect(appInsights.trackTrace).toHaveBeenCalledWith(
        { message: logMessage, severityLevel: logLevel },
        expect.any(Object)
      );
    });

    it('should not log a trace message when log level is higher than Trace', () => {
      // Arrange
      configureService(LogLevel.Debug, false);

      // Act
      service.logTrace('Trace message');

      // Assert
      expect(appInsights.trackTrace).not.toHaveBeenCalled();
    });
  });

  describe('logDebug', () => {
    it('should log a debug message when log level is Debug', () => {
      // Arrange
      const logMessage = 'Debug message';
      const logLevel = LogLevel.Debug;
      configureService(logLevel, false);

      // Act
      service.logDebug(logMessage);

      // Assert
      expect(appInsights.trackTrace).toHaveBeenCalledWith(
        { message: logMessage, severityLevel: logLevel },
        expect.any(Object)
      );
    });

    it('should not log a debug message when log level is higher than Debug', () => {
      // Arrange
      configureService(LogLevel.Information, false);

      // Act
      service.logDebug('Debug message');

      // Assert
      expect(appInsights.trackTrace).not.toHaveBeenCalled();
    });
  });

  describe('logInformation', () => {
    it('should log an informational message when log level is Information', () => {
      // Arrange
      const logMessage = 'Information message';
      const logLevel = LogLevel.Information;
      configureService(logLevel, false);

      // Act
      service.logInformation(logMessage);

      // Assert
      expect(appInsights.trackTrace).toHaveBeenCalledWith(
        { message: logMessage, severityLevel: logLevel },
        expect.any(Object)
      );
    });

    it('should not log an informational message when log level is higher than Information', () => {
      // Arrange
      configureService(LogLevel.Warning, false);

      // Act
      service.logInformation('Information message');

      // Assert
      expect(appInsights.trackTrace).not.toHaveBeenCalled();
    });
  });

  describe('logWarning', () => {
    it('should log a warning message when log level is Warning', () => {
      // Arrange
      const logMessage = 'Warning message';
      const logLevel = LogLevel.Warning;
      configureService(logLevel, false);

      // Act
      service.logWarning(logMessage);

      // Assert
      expect(appInsights.trackTrace).toHaveBeenCalledWith(
        { message: logMessage, severityLevel: logLevel },
        expect.any(Object)
      );
    });

    it('should not log a warning message when log level is higher than Warning', () => {
      // Arrange
      configureService(LogLevel.Error, false);

      // Act
      service.logWarning('Warning message');

      // Assert
      expect(appInsights.trackTrace).not.toHaveBeenCalled();
    });
  });

  describe('logError', () => {
    it('should log an error message when log level is Error', () => {
      // Arrange
      const logMessage = 'Error message';
      const logLevel = LogLevel.Error;
      configureService(logLevel, false);

      // Act
      service.logError(logMessage);

      // Assert
      expect(appInsights.trackException).toHaveBeenCalledWith(
        { exception: new Error(logMessage), severityLevel: logLevel },
        expect.any(Object)
      );
    });

    it('should not log an error message when log level is higher than Error', () => {
      // Arrange
      configureService(LogLevel.Critical, false);

      // Act
      service.logError('Error message');

      // Assert
      expect(appInsights.trackException).not.toHaveBeenCalled();
    });
  });

  describe('logCritical', () => {
    it('should log a critical message when log level is Critical', () => {
      // Arrange
      const logMessage = 'Critical message';
      const logLevel = LogLevel.Critical;
      configureService(logLevel, false);

      // Act
      service.logCritical(logMessage);

      // Assert
      expect(appInsights.trackException).toHaveBeenCalledWith(
        { exception: new Error(logMessage), severityLevel: logLevel },
        expect.any(Object)
      );
    });
  });

  describe('console logging', () => {
    it('should trace log to console when console logging is enabled', () => {
      // Arrange
      const logMessage = 'Trace message';
      const logLevel = LogLevel.Trace;
      const expectedMessage = `[${LogLevel[logLevel]}] ${logMessage}`;
      configureService(logLevel, true);

      // Act
      service.logTrace(logMessage);

      // Assert
      expect(console.debug).toHaveBeenCalledWith(expect.stringContaining(expectedMessage), undefined);
    });

    it('should debug log to console when console logging is enabled', () => {
      // Arrange
      const logMessage = 'Debug message';
      const logLevel = LogLevel.Debug;
      const expectedMessage = `[${LogLevel[logLevel]}] ${logMessage}`;
      configureService(logLevel, true);

      // Act
      service.logDebug(logMessage);

      // Assert
      expect(console.debug).toHaveBeenCalledWith(expect.stringContaining(expectedMessage), undefined);
    });

    it('should info log to console when console logging is enabled', () => {
      // Arrange
      const logMessage = 'Info message';
      const logLevel = LogLevel.Information;
      const expectedMessage = `[${LogLevel[logLevel]}] ${logMessage}`;
      configureService(logLevel, true);

      // Act
      service.logInformation(logMessage);

      // Assert
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining(expectedMessage), undefined);
    });

    it('should warn log to console when console logging is enabled', () => {
      // Arrange
      const logMessage = 'Warning message';
      const logLevel = LogLevel.Warning;
      const expectedMessage = `[${LogLevel[logLevel]}] ${logMessage}`;
      configureService(logLevel, true);

      // Act
      service.logWarning(logMessage);

      // Assert
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(expectedMessage), undefined);
    });

    it('should error log to console when console logging is enabled', () => {
      // Arrange
      const logMessage = 'Error message';
      const logLevel = LogLevel.Error;
      const expectedMessage = `[${LogLevel[logLevel]}] ${logMessage}`;
      configureService(logLevel, true);

      // Act
      service.logError(logMessage);

      // Assert
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining(expectedMessage), undefined);
    });

    it('should critical log to console when console logging is enabled', () => {
      // Arrange
      const logMessage = 'Critical message';
      const logLevel = LogLevel.Critical;
      const expectedMessage = `[${LogLevel[logLevel]}] ${logMessage}`;
      configureService(logLevel, true);

      // Act
      service.logCritical(logMessage);

      // Assert
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining(expectedMessage), undefined);
    });

    it('should not log to console when console logging is disabled', () => {
      // Arrange
      configureService(LogLevel.Trace, false);

      // Act
      service.logTrace('Trace message');

      // Assert
      expect(console.debug).not.toHaveBeenCalled();
    });
  });

  describe('logPageView', () => {
    it('should log a page view to Application Insights', () => {
      // Arrange
      configureService(LogLevel.Information, false);
      const name = 'HomePage';
      const url = '/home';

      // Act
      service.logPageView(name, url);

      // Assert
      expect(appInsights.trackPageView).toHaveBeenCalledWith({ name, uri: url });
    });

    it('should log a page view to console when console logging is enabled', () => {
      // Arrange
      configureService(LogLevel.Information, true);
      const name = 'HomePage';
      const url = '/home';

      // Act
      service.logPageView(name, url);

      // Assert
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining(`[PageView] name: ${name}, url: ${url}`),
        undefined
      );
    });
  });

  describe('logEvent', () => {
    it('should log a custom event to Application Insights', () => {
      configureService(LogLevel.Information, false);
      const name = 'UserSignup';
      const properties = { userId: '12345' };
      service.logEvent(name, properties);
      expect(appInsights.trackEvent).toHaveBeenCalledWith({ name }, properties);
    });

    it('should log a custom event to console when console logging is enabled', () => {
      configureService(LogLevel.Information, true);
      const name = 'UserSignup';
      const properties = { userId: '12345' };
      service.logEvent(name, properties);
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining(`[Event] name: ${name}`), properties);
    });
  });

  describe('handleError', () => {
    it('should log an error using logError method', () => {
      // Arrange
      configureService(LogLevel.Error, false);
      const error = new Error('Test error');
      jest.spyOn(service, 'logError');

      // Act
      service.handleError(error);

      // Assert
      expect(service.logError).toHaveBeenCalledWith(error.message, { stack: error.stack });
    });

    it('should log an error toString if no message is provided', () => {
      // Arrange
      configureService(LogLevel.Error, false);
      const error = new Error();
      jest.spyOn(service, 'logError');

      // Act
      service.handleError(error);

      // Assert
      expect(service.logError).toHaveBeenCalledWith(error.toString(), { stack: error.stack });
    });
  });
});
