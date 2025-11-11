import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { ExtraOptions, provideRouter, RouterConfigOptions, withRouterConfig } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  ENVIRONMENT_CONFIG,
  HttpRequestInterceptor,
  LoggerService,
  createTranslationProviders,
  provideUserAccount,
} from '@dealer-portal/polaris-core';
import { PolarisNotificationService } from '@dealer-portal/polaris-ui';
import { POLARIS_NOTIFICATION_TOKEN } from '@dealer-portal/polaris-shared';
import { routes } from './app.routes';
import { environment } from '../_environments/environment';
import translations from '../assets/translations/en-us.json';

const routeOptions: RouterConfigOptions | ExtraOptions = {
  useHash: false,
  anchorScrolling: 'enabled',
  scrollPositionRestoration: 'enabled',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withRouterConfig(routeOptions)),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true,
    },
    ...createTranslationProviders(translations),
    provideUserAccount(),
    provideAnimations(),
    LoggerService,
    { provide: ENVIRONMENT_CONFIG, useValue: environment },
    { provide: POLARIS_NOTIFICATION_TOKEN, useClass: PolarisNotificationService },
    { provide: ErrorHandler, useClass: LoggerService }
  ],
};

