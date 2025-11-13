import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuctionCardComponent } from '../auction-card/auction-card.component';


@Component({
  selector: 'ac-auction-list',
  imports: [AuctionCardComponent,CommonModule],
  templateUrl: './auction-list.component.html',
  styleUrl: './auction-list.component.scss',
})
export class AuctionListComponent {
  auctions = [
  {
    title: 'Test1',
    location: '56 - BLOOMINGTON DC',
    startInfo: 'Starts in 4 months - 10:00 AM CST - 1/8/26',
    status: 'UPCOMING'
  },
  {
    title: 'test',
    location: '66 - SALT LAKE CITY DC',
    startInfo: 'Starts in 2 weeks - 10:00 AM CDT - 9/25/25',
    status: 'UPCOMING'
  },
  {
    title: 'Eric Test Auction sept 9th',
    location: '56 - BLOOMINGTON DC',
    startInfo: 'Starts in 4 days - 8:00 AM CDT - 9/13/25',
    status: 'UPCOMING'
  }
]

}
