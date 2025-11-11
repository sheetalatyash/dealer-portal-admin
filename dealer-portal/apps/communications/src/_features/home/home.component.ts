import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {
  Communication,
  CommunicationType,
  ENVIRONMENT_CONFIG,
  Widget,
} from '@dealer-portal/polaris-core';
import {
  PolarisCommunicationVideoWidgetComponent,
  PolarisFavoritesWidget,
  PolarisFollowUpWidget,
  PolarisMonthlyRetailGoalWidget,
  PolarisTasksWidget,
  PolarisTrainingWidgetComponent,
  PolarisUnitInquiryWidgetComponent,
  TrainingDataSource,
} from '@dealer-portal/polaris-modules';
import { PolarisHref, PolarisIcon } from '@dealer-portal/polaris-ui';
import { Route } from '@enums';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe } from '@ngx-translate/core';
import { CommunicationsService, WidgetsService } from '@services';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { HomepageEnvironment } from '../../_environments/homepage-environment';

@UntilDestroy()
@Component({
    selector: 'comm-home',
    providers: [WidgetsService],
    standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    PolarisTasksWidget,
    PolarisCommunicationVideoWidgetComponent,
    PolarisFollowUpWidget,
    PolarisFavoritesWidget,
    PolarisMonthlyRetailGoalWidget,
    PolarisUnitInquiryWidgetComponent,
    PolarisTrainingWidgetComponent,
    PolarisHref,
    TranslatePipe,
    PolarisIcon,
  ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  public videoCommunication$: Observable<Communication[] | null> = of(null);
  private _activeWidgets: BehaviorSubject<Widget[] | null> = new BehaviorSubject<Widget[] | null>(null);
  public activeWidgets$: Observable<Widget[] | null> = this._activeWidgets.asObservable();
  public trainingDataSource: TrainingDataSource = {};

  constructor(
    @Inject(ENVIRONMENT_CONFIG) public environment: HomepageEnvironment,
    private _communicationService: CommunicationsService,
    private _router: Router,
    private _widgetsService: WidgetsService,
  ) { }

  public ngOnInit(): void {
    this._getVideoCommunications();
    this._getWidgets();

    this.trainingDataSource = {
      homepageAndNavigationVideoUrl: this.environment.trainingContent.homepageAndNavigation.videoUrl,
      homepageAndNavigationArticleUrl: this.environment.trainingContent.homepageAndNavigation.articleUrl,
      homepageAndNavigationArticleUrlFrench: this.environment.trainingContent.homepageAndNavigation.articleUrlFrench,
      securityAdministrationVideoUrl: this.environment.trainingContent.securityAdmin.videoUrl,
      securityAdministrationArticleUrl: this.environment.trainingContent.securityAdmin.articleUrl,
      securityAdministrationArticleUrlFrench: this.environment.trainingContent.securityAdmin.articleUrlFrench,
    };
  }

  /**
   * Fetches all communications with a webinar group.
   */
  private _getVideoCommunications(): void {
    this.videoCommunication$ = this._communicationService.getCommunicationByGroup$([CommunicationType.Video]);
  }

  private _getWidgets(): void {
    this._activeWidgets.next(null);

    this._widgetsService.getWidgets$().pipe(
      tap((widgets: Widget[]): void => {

        const allWidgets: Widget[] = widgets;

        if (allWidgets) {
          const activeWidgets: Widget[] = allWidgets
            .filter((widget: Widget): boolean => widget.active || widget.isPinned)
            .sort((a: Widget, b: Widget): number => a.sortOrder - b.sortOrder);

          this._activeWidgets.next(activeWidgets);
        }
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  public editWidgets(): void {
    this._router.navigate([Route.EditWidgets]);
  }

  public viewAllPolarisConnect(): void {
    this._router.navigate(['/polaris-connect', 'all']);
  }
}
