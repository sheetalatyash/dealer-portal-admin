import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisHref } from '@dealer-portal/polaris-ui';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { tap, catchError } from 'rxjs';
import {
  DealerPortalApiService,
  Environment,
  ENVIRONMENT_CONFIG,
  Favorite,
  ResourceService,
} from '@dealer-portal/polaris-core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PolarisBaseWidgetComponent } from '../polaris-base-widget/polaris-base-widget.component';

declare const window: Window;

@UntilDestroy()
@Component({
  selector: 'polaris-favorites-widget',
  imports: [CommonModule, TranslatePipe, PolarisBaseWidgetComponent, PolarisHref],
  templateUrl: './polaris-favorites-widget.component.html',
  styleUrl: './polaris-favorites-widget.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PolarisFavoritesWidget implements OnInit {
  public readonly editFavoritesUrl: string;
  public readonly newsUrl: string;
  public newsTranslate = '';
  public favorites: WritableSignal<Favorite[]> = signal([]);

  private readonly _maxCustomFavoritesToShow: number = 15;

  constructor(
    private _dealerPortalApiService: DealerPortalApiService,
    @Inject(ENVIRONMENT_CONFIG) private readonly environment: Environment,
    private readonly translateService: TranslateService,
    private readonly resourceService: ResourceService,
  ) {
    this.editFavoritesUrl = `/${this.resourceService.getCultureCode()}/site-map`;

    if (!environment.endpoints?.['newsUrl'] || !environment.endpoints['newsUrl'].baseUrl) {
      throw new Error('No news url or baseUrl found in environment.');
    }
    this.newsUrl = environment.endpoints['newsUrl'].baseUrl;
  }

  public ngOnInit(): void {
    this._getFavorites();
    this.newsTranslate = this.translateService.instant('news-forms-links'); // 'News, Forms & Links';
  }

  public navigateToItem(url: string | undefined): void {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  public onEditFavorites(): void {
    window.location.href = `${this.editFavoritesUrl}`;
  }

  private _getFavorites(): void {
    this._dealerPortalApiService
      .getFavorites$()
      .pipe(
        tap((response: { success: boolean; data?: Favorite[] }): void => {
          // Always add the News, Forms & Links link as the first item
          const newsLink: Favorite = {
            pageId: 0,
            pageName: this.newsTranslate,
            url: this.newsUrl,
          };

          const allFavorites = [newsLink];
          if (response.success && response.data) {
            allFavorites.push(...response.data);
          }

          // Limit the number of custom favorites shown, +1 for the hardcoded News link
          const displayedFavorites = allFavorites.slice(0, this._maxCustomFavoritesToShow + 1);

          this.favorites.set(displayedFavorites);
        }),
        catchError((error) => {
          this.favorites.set([]);
          console.error(error);
          return error;
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }
}
