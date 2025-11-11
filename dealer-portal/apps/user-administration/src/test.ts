import { CommonModule } from '@angular/common';
import { ApplicationModule } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { DefaultTitleStrategy, TitleStrategy } from '@angular/router';
import { ngMocks, MockService } from 'ng-mocks';

ngMocks.autoSpy('jasmine');

// auto restore for jasmine and jest <27
// jasmine.getEnv().addReporter({
//   specDone: MockInstance.restore,
//   specStarted: MockInstance.remember,
//   suiteDone: MockInstance.restore,
//   suiteStarted: MockInstance.remember,
// });

// In case, if you use @angular/router and Angular 14+.
// You might want to set a mock of DefaultTitleStrategy as TitleStrategy.
// A14 fix: making DefaultTitleStrategy to be a default mock for TitleStrategy
ngMocks.defaultMock(TitleStrategy, () => MockService(DefaultTitleStrategy));

// Usually, *ngIf and other declarations from CommonModule aren't expected to be mocked.
// The code below keeps them.`
ngMocks.globalKeep(ApplicationModule, true);
ngMocks.globalKeep(CommonModule, true);
//ngMocks.globalKeep(BrowserModule, true);

// Initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});
