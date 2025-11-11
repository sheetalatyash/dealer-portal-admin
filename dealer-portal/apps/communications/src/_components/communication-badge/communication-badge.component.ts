import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CommunicationType } from '@dealer-portal/polaris-core';
import { PolarisBadge, PolarisBadgeColor } from '@dealer-portal/polaris-ui';

@Component({
    selector: 'comm-communication-badge',
    imports: [CommonModule, PolarisBadge],
    templateUrl: './communication-badge.component.html',
    styleUrl: './communication-badge.component.scss'
})
export class CommunicationBadgeComponent implements OnInit {
  @Input() badgeType: CommunicationType | undefined = undefined;

  public badgeColor!: PolarisBadgeColor;
  public badgeText: string = '';
  public showBadge: boolean = true;

  public ngOnInit(): void {
    switch (this.badgeType) {
      case CommunicationType.Alert:
        this.badgeColor = PolarisBadgeColor.Danger;
        this.badgeText = 'Alerts';
        break;
      case CommunicationType.Program:
        this.badgeColor = PolarisBadgeColor.Secondary;
        this.badgeText = 'Programs';
        break;
      case CommunicationType.Archive:
        this.badgeText = 'Archive';
        break;
      default:
        this.badgeColor = PolarisBadgeColor.Light;
        this.showBadge = false;
    }
  }
}
