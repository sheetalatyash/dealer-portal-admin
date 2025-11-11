import { Routes } from '@angular/router';
import { Route } from '@enums/route.enum';
import { CommunicationAdministrationComponent } from '@features/communication-administration/communication-administration.component';
import { CommunicationsService } from '@services/communications/communications.service';
import { LookupService } from '@services/lookup/lookup.service';
import { TooltipService } from '../_features/communication-add-edit/services/tooltip/tooltip.service';
import { TimezoneService } from '@services/timezone/timezone.service';

export const routes: Routes = [
  {
    path: Route.Communications,
    providers: [CommunicationsService, LookupService],
    component: CommunicationAdministrationComponent,
  },
  {
    path: Route.Communication,
    providers: [CommunicationsService, LookupService, TimezoneService, TooltipService],
    loadChildren: () =>
      import('@features/communication-add-edit/communication-administration.component.routes').then((m) => m.routes),
  },
  {
    path: '**',
    redirectTo: Route.Communications,
    pathMatch: 'full',
  },
];
