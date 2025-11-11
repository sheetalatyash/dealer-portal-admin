import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { POLARIS_NOTIFICATION_TOKEN } from '@dealer-portal/polaris-shared';
import { AccessControlLevel, Environment, ENVIRONMENT_CONFIG, ResourceService, UserAccountService } from '@dealer-portal/polaris-core';
/**
 * Guard to check if the user has the required access control level or higher to navigate to the
 * account search user impersonation view.
 *
 * @returns An observable that emits a boolean indicating whether the user has access to navigate to the route.
 */

export const impersonationGuard: CanActivateFn = (
): Observable<boolean> => {
  const userAccountService: UserAccountService = inject(UserAccountService);
  const resourceService: ResourceService = inject(ResourceService);
  const polarisNotificationService: { danger: (message: string) => void } = inject(POLARIS_NOTIFICATION_TOKEN) as { danger: (message: string) => void };
  const environment: Environment = inject(ENVIRONMENT_CONFIG);

  const hasAccess = [AccessControlLevel.Read, AccessControlLevel.ReadWrite]
      .includes(
        (userAccountService.userAccount.accountImpersonationPermission ?? AccessControlLevel.None)
      );

  // Handle local development environment
  if (environment.isLocal) {

    if (!hasAccess) {
      polarisNotificationService.danger('Unauthorized Access');
    }

    return of(hasAccess);
  }

  if (!hasAccess) {
    window.location.href = `${environment.portalUrl}/${resourceService.getCultureCode()}/unauthorized`;
  }

  return of(hasAccess);
};
