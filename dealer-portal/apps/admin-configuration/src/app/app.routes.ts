import { Route } from '@angular/router';
import { EditAuctionListingComponent } from '../_features/edit-auction-listing/edit-auction-listing.component';
import { CreateAuctionComponent } from '../_features/add-auction/add-auction.component';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'listings',
    pathMatch: 'full',
  },
  {
    path: 'listings',
    children: [
      {
        path: '',
        component: EditAuctionListingComponent,
      },
    ],
  },
  {
    path: 'auctions',
    component: CreateAuctionComponent,
  },
  {
    path: '**',
    redirectTo: 'listings',
  },
];
