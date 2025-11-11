import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { ExtraOptions, provideRouter, RouterConfigOptions, withRouterConfig } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { POLARIS_NOTIFICATION_TOKEN, POLARIS_RICH_TEXT_EDITOR_SRC_URL_TOKEN } from '@dealer-portal/polaris-shared';
import { PolarisNotificationService } from '@dealer-portal/polaris-ui';
import { routes } from './app.routes';
import {
  createTranslationProviders,
  ENVIRONMENT_CONFIG,
  HttpRequestInterceptor,
  LoggerService,
  ResourceService,
} from '@dealer-portal/polaris-core';
import { environment } from '@environments/environment';
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
    provideAnimations(),
    LoggerService,
    { provide: ENVIRONMENT_CONFIG, useValue: environment },
    { provide: POLARIS_NOTIFICATION_TOKEN, useClass: PolarisNotificationService },
    {
      provide: POLARIS_RICH_TEXT_EDITOR_SRC_URL_TOKEN,
      useFactory: (resourceService: ResourceService) =>
        resourceService.getCDNPath() + (resourceService.getCDNPath() ? '/' : '') + 'tinymce/tinymce.min.js',
      deps: [ResourceService],
    },
    { provide: ErrorHandler, useClass: LoggerService },
  ],
};
