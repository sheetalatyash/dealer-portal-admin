import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { PolarisNavigationTab } from './polaris-tab-bar.class';
import { PolarisUiBase } from '../polaris-ui-base';

@Component({
  selector: 'polaris-tab-bar',
  imports: [
    CommonModule,
    MatTabsModule,
  ],
  templateUrl: './polaris-tab-bar.component.html',
  styleUrl: './polaris-tab-bar.component.scss'
})
export class PolarisTabBar extends PolarisUiBase {
  @Input() compact: boolean = false;
  @Input() stretchTabs: boolean = false;
  @Input() tabs: (PolarisNavigationTab)[] = [];

  @Output() tabSelected: EventEmitter<PolarisNavigationTab> = new EventEmitter<PolarisNavigationTab>();

  public get selectedIndex(): number {
    const index: number = this.tabs.findIndex((tab: PolarisNavigationTab): boolean => tab.selected);

    return index >= 0 ? index : 0;
  }

  public emitSelectedTab(selectedTab: PolarisNavigationTab): void {


    if (!selectedTab.disabled) {
      this.tabs.forEach((tab: PolarisNavigationTab): void => { tab.selected = false });
      selectedTab.selected = true;

      this.tabSelected.emit(selectedTab);
    }
  }
}
