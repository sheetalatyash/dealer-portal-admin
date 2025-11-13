import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { ExtraOptions, provideRouter, RouterConfigOptions, withRouterConfig } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Environment, ENVIRONMENT_CONFIG, HttpRequestInterceptor, LoggerService } from '@dealer-portal/polaris-core';
import { POLARIS_NOTIFICATION_TOKEN } from '@dealer-portal/polaris-shared';
import { PolarisNotificationService } from '@dealer-portal/polaris-ui';
import { appRoutes } from './app.routes';
import { environment } from '@environments/environment';

const routeOptions: RouterConfigOptions | ExtraOptions = {
    useHash: false,
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled',
};

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withRouterConfig(routeOptions)),
        provideHttpClient(withInterceptorsFromDi()),
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpRequestInterceptor,
          multi: true,
        },
        provideAnimations(),
        LoggerService,
        { provide: ENVIRONMENT_CONFIG, useValue: environment as Environment },
        { provide: POLARIS_NOTIFICATION_TOKEN, useClass: PolarisNotificationService },
        { provide: ErrorHandler, useClass: LoggerService }
    ],
};
