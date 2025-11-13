import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PolarisButton } from '@dealer-portal/polaris-ui';

@Component({
  selector: 'ac-auction-card',
  imports: [MatCardModule,PolarisButton],
  templateUrl: './auction-card.component.html',
  styleUrl: './auction-card.component.scss',
})
export class AuctionCardComponent {
    @Input() title!: string;
  @Input() location!: string;
  @Input() startInfo!: string;
  @Input() status: string = 'UPCOMING';

}
