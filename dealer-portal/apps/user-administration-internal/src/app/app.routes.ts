import { Routes } from '@angular/router';
import { accessControlGuard, CanDeactivateGuard } from '@dealer-portal/polaris-core';
import { Route } from '@enums';
import { internalUserInfoResolver } from '@resolvers';
import { UserAdministrationApiService, UserAdministrationService } from '@services';
import {
  InternalUserComponent,
  UserAdministrationInternalComponent,
} from '@components';

export const appRoutes: Routes = [
  {
    path: Route.Home,
    providers: [
      UserAdministrationService,
      UserAdministrationApiService,
    ],
    children: [
      {
        path: Route.Home,
        component: UserAdministrationInternalComponent,
        pathMatch: 'full',
        canActivate: [ accessControlGuard ],
        data: { requiredLevel: 'r' },
      },
      {
        path: Route.User,
        children: [
          {
            path: Route.UserDetails,
            component: InternalUserComponent,
            resolve: { internalUserInfo: internalUserInfoResolver },
            canActivate: [ accessControlGuard ],
            data: { requiredLevel: 'r' },
          },
          {
            path: Route.UserEdit,
            component: InternalUserComponent,
            canDeactivate: [CanDeactivateGuard],
            resolve: { internalUserInfo: internalUserInfoResolver },
            canActivate: [ accessControlGuard ],
            data: { requiredLevel: 'rw' },
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
