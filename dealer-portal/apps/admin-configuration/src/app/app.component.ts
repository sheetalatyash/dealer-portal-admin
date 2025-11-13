import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
// import { AuctionListComponent } from '../_features/auction-list/auction-list.component';
import { AddAuctionComponent } from '../_features/add-auction/add-auction.component';
import {  ProductLine, ThemeService } from '@dealer-portal/polaris-ui';

@Component({
  // AuctionListComponent
  imports: [ RouterModule,AddAuctionComponent],
  selector: 'ac-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'admin-configuration';
    constructor(
      private _themeService: ThemeService,
    ) {
      this._themeService.switchTheme(ProductLine.Crp);
    }

}
