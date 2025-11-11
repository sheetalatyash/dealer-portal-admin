import { Routes } from '@angular/router';
import { EditWidgetsComponent, PolarisConnectComponent } from '@components';
import { Route } from '@enums';
import { HomeComponent } from '@features/home/home.component';
import {
  CanDeactivateGuard,
  CommunicationsApiService,
  CoreApiService,
  CoreService,
  UserInfoApiService,
} from '@dealer-portal/polaris-core';
import { CommunicationsService, DealerPortalService, LookupService } from '@services';
import { ToggleAccountComponent } from '@features/toggle-account/toggle-account.component';

export const routes: Routes = [
  {
    path: Route.Home,
    providers: [CommunicationsService, CommunicationsApiService, LookupService],
    component: HomeComponent,
    loadChildren: () => import('@features/home/home.component.routes').then((m) => m.routes),
  },
  {
    path: Route.ToggleAccount,
    providers: [DealerPortalService, CoreApiService, CoreService, UserInfoApiService],
    component: ToggleAccountComponent,
    pathMatch: 'full',
  },
  {
    path: Route.EditWidgets,
    component: EditWidgetsComponent,
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: Route.PolarisConnect,
    component: PolarisConnectComponent,
  },
  {
    path: '**',
    redirectTo: Route.Home,
    pathMatch: 'full',
  },
];
