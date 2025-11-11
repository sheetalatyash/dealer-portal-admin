import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Polyfills must be imported using a relative path
// TODO: CHORE: Possibly remove polyfills if not needed
import '../../../packages/polaris-core/src/lib/_polyfills';
import { LoggerService } from '@dealer-portal/polaris-core';
import { inject } from '@angular/core';

bootstrapApplication(AppComponent, appConfig)
.catch((err) => {
    const loggerService = inject(LoggerService);
    loggerService.logCritical('Bootstrap error', { error: err });
});

