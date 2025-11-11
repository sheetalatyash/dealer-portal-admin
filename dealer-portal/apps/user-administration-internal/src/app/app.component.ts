import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PolarisBackToTop, ProductLine, ThemeService } from '@dealer-portal/polaris-ui';

@Component({
  imports: [
    RouterOutlet,
    PolarisBackToTop,
  ],
    selector: 'uai-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  public title: string = 'User Administration - Internal';

  constructor(
    private _themeService: ThemeService,
  ) {
    this._themeService.switchTheme(ProductLine.Crp);
  }
}
