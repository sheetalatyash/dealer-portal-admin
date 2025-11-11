import { Routes } from '@angular/router';
import { CommunicationAddEditComponent } from './communication-add-edit.component';
import { CommunicationAddEditStep } from '@enums/communication-add-edit-step.enum';
import { CommunicationConfirmationComponent } from '@features/communication-confirmation/communication-confirmation.component';

const formRoutes: Routes = [
  { path: CommunicationAddEditStep.Message, component: CommunicationAddEditComponent },
  { path: CommunicationAddEditStep.AccountTargets, component: CommunicationAddEditComponent },
  { path: CommunicationAddEditStep.UserTargets, component: CommunicationAddEditComponent },
  { path: CommunicationAddEditStep.Translation, component: CommunicationAddEditComponent },
  { path: CommunicationAddEditStep.Review, component: CommunicationAddEditComponent },
];

export const routes: Routes = [
  {
    path: 'add',
    data: { mode: 'add' },
    children: [
      { path: '', redirectTo: CommunicationAddEditStep.Message, pathMatch: 'full' },
      { path: CommunicationAddEditStep.Message, component: CommunicationAddEditComponent },
    ],
  },
  {
    path: 'add/:communicationGuid',
    data: { mode: 'add' },
    children: formRoutes,
  },
  {
    path: 'edit/:communicationGuid',
    data: { mode: 'edit' },
    children: [...formRoutes, { path: '**', redirectTo: CommunicationAddEditStep.Message }],
  },
  { path: 'confirmation/:communicationGuid', component: CommunicationConfirmationComponent },
  { path: '**', redirectTo: 'add/' + CommunicationAddEditStep.Message },
];
