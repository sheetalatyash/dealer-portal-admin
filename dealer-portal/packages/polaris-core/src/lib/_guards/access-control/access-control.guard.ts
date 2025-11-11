import { CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AccessControlLevel } from '../../_enums';
import { AccessControlService, ResourceService } from '../../_services';
import { AccessControlConfig, Environment, ENVIRONMENT_CONFIG } from '../../_types';
import { POLARIS_NOTIFICATION_TOKEN } from '@dealer-portal/polaris-shared';

/**
 * Guard to check if the user has the required access control level or higher to navigate to a route.
 *
 * @param route - The current route snapshot.
 *
 * @returns An observable that emits a boolean indicating whether the user has access to navigate to the route.
 *
 * @example
 * export const routes: Routes = [
 * {
 *   path: Route.ExampleRoute,
 *   component: ExampleComponent,
 *   pathMatch: 'full',
 *   canActivate: [
 *     accessControlGuard,
 *   ],
 *   data: { requiredLevel: <AccessControlLevel | AccessControlConfig> },
 * }];
 *
 * The requiredLevel, which can be:
 * an AccessControlLevel ('-', 'r', 'rw'),
 * or
 * an AccessControlConfig object.
 *
 * @see AccessControlService For more information on access control.
 */
export const accessControlGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<boolean> => {
  const accessControlService: AccessControlService = inject(AccessControlService);
  const resourceService: ResourceService = inject(ResourceService);
  const polarisNotificationService: { danger: (message: string) => void } = inject(POLARIS_NOTIFICATION_TOKEN) as { danger: (message: string) => void };
  const environment: Environment = inject(ENVIRONMENT_CONFIG);


  // Extract route data
  const config: AccessControlLevel | AccessControlConfig = route.data['requiredLevel'];

  return accessControlService.hasAccess(config).pipe(
    map((hasAccess: boolean): boolean => {

      // Handle local development environment
      if (environment.isLocal) {
        if (!hasAccess) {
          // In local mode, display a notification about unauthorized access
          polarisNotificationService.danger('Unauthorized Access');
        }

        // Return true or false directly in local mode
        return hasAccess;
      }

      // Currently, redirect to the unauthorized page which is statically defined for now.
      // TODO: Implement a way to pass a custom unauthorized page (url, app-route, or component) in the future.

      // Build the external redirect URL
      const portalUrl: string = environment.portalUrl;
      const cultureCode: string = resourceService.getCultureCode();
      const externalRedirectUrl: string = `${portalUrl}/${cultureCode}/unauthorized`;

      if (!hasAccess) {
        window.location.href = externalRedirectUrl;

        return false;
      }

      return true;
    })
  );
};
