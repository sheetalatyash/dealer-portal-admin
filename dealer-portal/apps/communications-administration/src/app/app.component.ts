import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PolarisBackToTop, ProductLine, ThemeService } from '@dealer-portal/polaris-ui';

@Component({
  imports: [
    RouterModule,
    PolarisBackToTop,
  ],
    selector: 'ca-app',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'communications-administration';

  constructor(
    private _themeService: ThemeService,
  ) {
    this._themeService.switchTheme(ProductLine.Crp);
  }
}
