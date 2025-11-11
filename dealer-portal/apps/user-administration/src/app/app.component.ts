import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PolarisBackToTop, ProductLine, ThemeService } from '@dealer-portal/polaris-ui';

@Component({
  imports: [
    RouterOutlet,
    PolarisBackToTop,
  ],
    selector: 'ua-app',
    styleUrls: ['./app.component.scss'],
    templateUrl: './app.component.html'
})
export class AppComponent {
  public title: string = 'User Administration';

  constructor(
    private _themeService: ThemeService,
  ) {
    this._themeService.switchTheme(ProductLine.Crp);
  }
}
