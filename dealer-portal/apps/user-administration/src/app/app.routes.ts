import { Routes } from '@angular/router';
import { UserAdministrationComponent, UserComponent } from '@components/_views';
import { ManagePermissionsComponent } from '@components/manage-permissions/manage-permissions.component';
import {
  accessControlGuard,
  CanDeactivateGuard
} from '@dealer-portal/polaris-core';
import { Route } from '@enums';

export const routes: Routes = [
  {
    path: Route.Home,
    children: [
      {
        path: Route.Home,
        component: UserAdministrationComponent,
        pathMatch: 'full',
        canActivate: [
          accessControlGuard,
        ],
        data: { requiredLevel: 'r' }
      },
      {
        path: Route.ManagePermissions,
        component: ManagePermissionsComponent,
        pathMatch: 'full',
        canActivate: [
          accessControlGuard,
        ],
        data: { requiredLevel: 'rw' }
      },
      {
        path: Route.User,
        children: [
          {
            path: Route.UserDetails,
            component: UserComponent,
            canActivate: [
              accessControlGuard,
            ],
            data: { requiredLevel: 'r' },
          },
          {
            path: Route.UserEdit,
            component: UserComponent,
            canDeactivate: [CanDeactivateGuard],
            canActivate: [
              accessControlGuard,
            ],
            data: { requiredLevel: 'rw' },
          },
          {
            path: Route.UserAdd,
            component: UserComponent,
            canDeactivate: [CanDeactivateGuard],
            canActivate: [
              accessControlGuard,
            ],
            data: { requiredLevel: 'rw' },
          }
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
