import { Routes } from '@angular/router';
import { AccountApiService, CoreApiService, CoreService, DealerPortalApiService, SalesHierarchyApiService, UserAdminApiService, UserInfoApiService } from '@dealer-portal/polaris-core';
import { PolarisNotificationService } from '@dealer-portal/polaris-ui';
import { Route } from '@enums/route.enum';
import { SalesAccountComponent } from '@features/sales-account/sales-account.component';
import { RecentListComponent } from '@features/home/_components/recent-list/recent-list.component';
import { HomeComponent } from '@features/home/home.component';
import { UserImpersonationComponent } from '@features/user-impersonation/user-impersonation.component';
import { AccountFilterService } from '@services/account-filter/account-filter.service';
import { AccountService } from '@services/account/account.service';
import { DealerPortalService } from '@services/dealer-portal/dealer-portal.service';
import { UserAdminService } from '@services/user-admin/user-admin.service';
import { SalesAccountService } from '@services/sales-account/sales-account.service';
import { impersonationGuard } from '../_guards/impersonation.guard';

export const routes: Routes = [
  {
    path: Route.Home,
    children: [
      {
        path: Route.Home,
        providers: [
          AccountApiService,
          AccountFilterService,
          AccountService,
          CoreService,
          DealerPortalService,
          DealerPortalApiService,
          PolarisNotificationService,
          SalesAccountService,
          UserAdminApiService,
          UserAdminService,
          UserInfoApiService
        ],
        component: HomeComponent,
        pathMatch: 'full',
      },
      {
        path: Route.Recent,
        providers: [
          DealerPortalService,
          DealerPortalApiService,
          PolarisNotificationService,
          UserInfoApiService
        ],
        component: RecentListComponent,
        pathMatch: 'full',
      },
      {
        path: Route.SalesAccount,
        providers: [
          DealerPortalService,
          DealerPortalApiService,
          CoreApiService,
          CoreService,
          SalesAccountService,
          SalesHierarchyApiService,
          UserInfoApiService
        ],
        component: SalesAccountComponent,
        pathMatch: 'full',
      },
      {
        path: Route.UserImpersonation,
        providers: [
          DealerPortalService,
          DealerPortalApiService,
          UserAdminApiService,
          UserAdminService
        ],
        component: UserImpersonationComponent,
        canActivate: [ impersonationGuard ],
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
