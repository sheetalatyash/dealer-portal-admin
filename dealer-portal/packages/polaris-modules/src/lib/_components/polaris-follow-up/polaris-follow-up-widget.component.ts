import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PolarisBadge,
  PolarisBadgeColor,
  PolarisBadgeSizeSquare,
  PolarisHref,
  PolarisLoader,
} from '@dealer-portal/polaris-ui';
import { TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject, Subject, debounceTime, switchMap, tap, Observable } from 'rxjs';
import { AccountConnectorApiService, FollowUp, StandardResponse } from '@dealer-portal/polaris-core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PolarisBaseWidgetComponent } from '../polaris-base-widget/polaris-base-widget.component';

declare const window: Window;

@UntilDestroy()
@Component({
  selector: 'polaris-follow-up-widget',
  imports: [
    CommonModule,
    PolarisBadge,
    PolarisLoader,
    TranslatePipe,
    PolarisBaseWidgetComponent,
    PolarisHref,
  ],
  templateUrl: './polaris-follow-up-widget.component.html',
  styleUrl: './polaris-follow-up-widget.component.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class PolarisFollowUpWidget implements OnInit {
  public polarisBadgeSizeSquare: typeof PolarisBadgeSizeSquare = PolarisBadgeSizeSquare;
  public followUpDataSubject: BehaviorSubject<FollowUp[]> = new BehaviorSubject<FollowUp[]>([]);
  public followUpData$: Observable<FollowUp[]> = this.followUpDataSubject.asObservable();
  public isLoading: boolean = false;
  public shouldClearCache: boolean = false;
  private _refreshTrigger$: Subject<void> = new Subject<void>();
  private readonly REFRESH_DEBOUNCE_TIME_MS: number = 300;

  constructor(
    private _accountConnectorApiService: AccountConnectorApiService,
  ) {}

  public ngOnInit(): void {
    this._refreshTrigger$
      .pipe(
        tap((): boolean => this.isLoading = true),
        debounceTime(this.REFRESH_DEBOUNCE_TIME_MS),
        switchMap(() => this._accountConnectorApiService.getFollowUps$(this.shouldClearCache)),
        untilDestroyed(this)
      )
      .subscribe((response: StandardResponse<FollowUp[]>) => {
        if (response.success && response.data) {
          this.followUpDataSubject.next(response.data);
        }
        this.isLoading = false;
      });

    this.refreshFollowUpData();
  }

  public refreshFollowUpData(clearCache: boolean = false): void {
    this.shouldClearCache = clearCache;
    this._refreshTrigger$.next();
  }

  public navigateToItem(url: string | undefined): void {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  protected readonly PolarisBadgeColor = PolarisBadgeColor;
}
