import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PolarisBackToTop, ProductLine, ThemeService } from '@dealer-portal/polaris-ui';

@Component({
  imports: [
    RouterModule,
    PolarisBackToTop,
  ],
    selector: 'as-app',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  public title: string = 'Account Search';

  constructor(
    private _themeService: ThemeService,
  ) {
    this._themeService.switchTheme(ProductLine.Crp);
  }
}
