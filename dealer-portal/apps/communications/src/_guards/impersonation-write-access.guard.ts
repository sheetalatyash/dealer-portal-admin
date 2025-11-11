import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import {
  AccessControlLevel,
  Environment,
  ENVIRONMENT_CONFIG,
  ResourceService,
  UserAccountService,
} from '@dealer-portal/polaris-core';
import { PolarisNotificationService } from '@dealer-portal/polaris-ui';

/**
 * Guard that allows navigation only if:
 *  - the user is NOT impersonating, or
 *  - the user IS impersonating AND has ReadWrite impersonation permissions.
 *
 * Otherwise, the user is redirected (default: `/forbidden`).
 */
export const impersonationWriteAccessGuard: CanActivateFn = () => {
  const userAccountService: UserAccountService = inject(UserAccountService);
  const resourceService: ResourceService = inject(ResourceService);
  const environment: Environment = inject(ENVIRONMENT_CONFIG);
  const polarisNotificationService: PolarisNotificationService = inject(PolarisNotificationService);

  const { isImpersonating, accountImpersonationPermission } = userAccountService.userAccount;

  const hasAccess: boolean =
    !isImpersonating || accountImpersonationPermission === AccessControlLevel.ReadWrite;

  // Handle local development environment
  if (environment.isLocal) {
    if (!hasAccess) {
      // In local mode, display a notification about unauthorized access
      polarisNotificationService.danger('Unauthorized Access');
    }

    // Return true or false directly in local mode
    return hasAccess;
  }

  const portalUrl: string = environment.portalUrl;
  const cultureCode: string = resourceService.getCultureCode();
  const externalRedirectUrl: string = `${portalUrl}/${cultureCode}/unauthorized`;

  if (!hasAccess) {
    window.location.href = externalRedirectUrl;

    return false;
  }

  return true;
};
