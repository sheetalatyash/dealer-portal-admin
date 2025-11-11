import { Component, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisIcon } from '../polaris-icon';
import { PolarisUiBase } from '../polaris-ui-base';

@Component({
  selector: 'polaris-back-to-top',
  imports: [
    CommonModule,
    PolarisIcon,
  ],
  templateUrl: './polaris-back-to-top.component.html',
  styleUrl: './polaris-back-to-top.component.scss',
})
export class PolarisBackToTop extends PolarisUiBase {
  /**
   * Indicates whether the back-to-top button is visible.
   * This is upon init only and will be updated whenever the window scrolls.
   * @default false
   *
   * @type {boolean}
   */
  @Input() public isVisible: boolean = false;

  @HostListener('window:scroll', [])
  public onWindowScroll(): void {
    this.isVisible = window.scrollY > 300;
  }

  public scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
