import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PolarisBackToTop, ProductLine, ThemeService } from '@dealer-portal/polaris-ui';
import { FeedbackService } from '../services/feedback/feedback.service';

@Component({
  imports: [
    RouterModule,
    PolarisBackToTop,
  ],
    selector: 'comm-app',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'communications';

  constructor(
    private _themeService: ThemeService,
    private _feedbackService: FeedbackService
  ) {
    this._themeService.switchTheme(ProductLine.Crp);
  }

  public ngOnInit() {
    this._feedbackService.injectFeedbackComponent();
  }
}
