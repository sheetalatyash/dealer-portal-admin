import { Routes } from '@angular/router';
import { CommunicationsListComponent } from './_views/communications-list/communications-list.component';
import { CommunicationsDetailsComponent } from './_views/communications-details/communications-details.component';
import { Route } from '@enums';

export const routes: Routes = [
  {
    path: Route.Home,
    component: CommunicationsListComponent,
  },
  {
    path: Route.CommunicationDetails,
    component: CommunicationsDetailsComponent,
  },
];
