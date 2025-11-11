import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  PolarisDialogService,
  PolarisDivider,
  PolarisHeading,
  PolarisHref,
  PolarisIcon,
} from '@dealer-portal/polaris-ui';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';
import { AccountFilterComponent } from './_components/account-filters/account-filter.component';
import { TranslateService } from '@ngx-translate/core';
import { AccountResultsComponent } from './_components/account-results/account-results.component';

@Component({
    selector: 'as-home',
  imports: [
    AccountFilterComponent,
    AccountResultsComponent,
    CommonModule,
    PolarisHeading,
    PolarisIcon,
    PolarisHref,
    PolarisDivider,
  ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA,
    ]
})
export class HomeComponent {
  public title: string = this._translate.instant('home-view.title.account-search');

  constructor(
    private _dialogService: PolarisDialogService,
    private _translate: TranslateService
  ) {}

  public openHelpDialog(): void {
    this._dialogService.open(HelpDialogComponent);
  }
}
