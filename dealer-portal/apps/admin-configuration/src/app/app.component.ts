import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
// import { AuctionListComponent } from '../_features/auction-list/auction-list.component';
// import { CreateAuctionComponent } from '../_features/add-auction/add-auction.component';
import { ProductLine, ThemeService } from '@dealer-portal/polaris-ui';

@Component({
  // AuctionListComponent
  imports: [RouterModule],
  selector: 'ac-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'admin-configuration';
  constructor(private _themeService: ThemeService) {
    this._themeService.switchTheme(ProductLine.Crp);
  }
  auctionDataCustom = {
    title: 'Test Title Final',
    numberOfLanes: 4,
    laneIncrementTimeInMinutes: 5,
    customFilterSet: {
      UseStandardDealerProductLineRules: true,
      UseStandardDealerDistributionCenterRules: true,
      DealerCountryCode: 'CA',
    },
    startDate: '2025-11-25T00:00:00Z',
    startTime: '12:30:00',
    timeZone: 'America/Chicago',
    defaultListingDurationMinutes: 10,
    defaultMinimumBidIncrement: 10,
    endDate: '2025-10-25T00:00:00Z',
  };

  // Example with preconfigured filter
  auctionDataPreconfigured = {
    title: 'sheetal auction ',
    numberOfLanes: 25,
    laneIncrementTimeInMinutes: 35,
    preconfiguredFilterSet: 3,
    startDate: '2025-10-22T00:00:00Z',
    startTime: '12:30:00',
    timeZone: 'America/Chicago',
    defaultListingDurationMinutes: 11,
    defaultMinimumBidIncrement: 21,
    endDate: '2025-10-25T00:00:00Z',
    buyNow: false,
  };
}
