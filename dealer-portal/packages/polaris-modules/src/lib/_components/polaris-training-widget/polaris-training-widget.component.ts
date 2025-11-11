import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisDialogService, PolarisHref } from '@dealer-portal/polaris-ui';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PolarisBaseWidgetComponent } from '../polaris-base-widget/polaris-base-widget.component';
import {
  Environment,
  ENVIRONMENT_CONFIG,
  ResourceService,
  UserAccount,
  UserAccountService,
  UserInfoService,
} from '@dealer-portal/polaris-core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SupportCallbackDialogComponent } from './support-callback-dialog/support-callback-dialog.component';
import { TrainingVideoDialogComponent } from './training-video-dialog';

export interface TrainingDataSource {
  homepageAndNavigationVideoUrl?: string;
  homepageAndNavigationArticleUrl?: string;
  homepageAndNavigationArticleUrlFrench?: string;
  securityAdministrationVideoUrl?: string;
  securityAdministrationArticleUrl?: string;
  securityAdministrationArticleUrlFrench?: string;
}

export interface TrainingCategory {
  title: string;
  videoUrl: string;
  articleUrl: string;
  articleUrlFrench: string;
  requiresUserAdminAccess?: boolean;
}

@UntilDestroy()
@Component({
  selector: 'polaris-training-widget',
  imports: [CommonModule, TranslatePipe, PolarisBaseWidgetComponent, PolarisHref],
  templateUrl: './polaris-training-widget.component.html',
  styleUrl: './polaris-training-widget.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PolarisTrainingWidgetComponent implements OnInit {
  @Input() trainingDataSource: TrainingDataSource | null = null;

  public trainingData: TrainingCategory[] = [];
  public userAdminLink = 'userAdministration';
  public hasSecurityAccess = false;
  public supportPhoneNumber = '';
  public callSupportImageLocation = '';
  public supportCallbackImageLocation = '';
  public showSupportSection = false;
  public showCallSupportInfo = true;

  private userAccount: UserAccount;
  private readonly US_CUSTOMER_CLASS_ID = 'DLR';
  private readonly CANADIAN_CUSTOMER_CLASS_ID = 'CND';
  private readonly MISC_CUSTOMER_CLASS_ID = 'MIS';

  private readonly US_SUPPORT = '1-800-330-9407';
  private readonly CANADA_SUPPORT = '1-877-289-1343';

  constructor(
    @Inject(ENVIRONMENT_CONFIG) readonly environment: Environment,
    private _dialogService: PolarisDialogService,
    private _resourceService: ResourceService,
    private _translateService: TranslateService,
    private _userAccountService: UserAccountService,
    private _userInfoService: UserInfoService,
  ) {
    if (!environment.endpoints?.['legacyPortalUrl']) {
      throw new Error('No legacy portal URL found in environment.');
    }

    this.userAccount = this._userAccountService.userAccount;

    this.showSupportSection =
      this.userAccount.classCode === this.US_CUSTOMER_CLASS_ID ||
      this.userAccount.classCode === this.CANADIAN_CUSTOMER_CLASS_ID ||
      this.userAccount.classCode === this.MISC_CUSTOMER_CLASS_ID;

    switch (this.userAccount.classCode) {
      case this.US_CUSTOMER_CLASS_ID:
      case this.MISC_CUSTOMER_CLASS_ID:
        this.supportPhoneNumber = this.US_SUPPORT;
        break;
      case this.CANADIAN_CUSTOMER_CLASS_ID:
        this.supportPhoneNumber = this.CANADA_SUPPORT;
        break;
      default:
        this.supportPhoneNumber = this.US_SUPPORT;
        break;
    }

    const cdnLocation: string = this._resourceService.getCDNPath();

    this.callSupportImageLocation = cdnLocation + '/images/call-support.png';
    this.supportCallbackImageLocation = cdnLocation + '/images/support-callback.png';
  }

  public ngOnInit(): void {
    // get user perms.
    this._userAdministrationAccess(this.userAdminLink);

    // Set training data from input source if provided.
    this.trainingData = [
      {
        title: this._translateService.instant('widgets.polaris-training.home-page-communication'),
        videoUrl: this.trainingDataSource?.homepageAndNavigationVideoUrl ?? '',
        articleUrl: this.trainingDataSource?.homepageAndNavigationArticleUrl ?? '',
        articleUrlFrench: this.trainingDataSource?.homepageAndNavigationArticleUrlFrench ?? '',
        requiresUserAdminAccess: false,
      },
      {
        title: this._translateService.instant('widgets.polaris-training.security-administration'),
        videoUrl: this.trainingDataSource?.securityAdministrationVideoUrl ?? '',
        articleUrl: this.trainingDataSource?.securityAdministrationArticleUrl ?? '',
        articleUrlFrench: this.trainingDataSource?.securityAdministrationArticleUrlFrench ?? '',
        requiresUserAdminAccess: true,
      },
    ];

    // Determine if call support info should be shown based on current business hours.
    this.showCallSupportInfo = this._isWithinSupportHours();
  }

  public openCallbackDialog(): void {
    // Attempt to use standard name claims first then fallback to application specific claims
    const firstName = this.userAccount.givenName ?? this.userAccount.firstName;
    const lastName = this.userAccount.familyName ?? this.userAccount.lastName;

    this._dialogService
      .open(SupportCallbackDialogComponent, {
        data: {
          contactName: `${firstName ?? ''} ${lastName ?? ''}`.trim(),
          supportPhoneNumber: this.supportPhoneNumber,
          isOffHours: !this._isWithinSupportHours(),
        },
      })
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  public openVideoDialog(videoUrl: string, dialogTitle?: string): void {
    this._dialogService.open(TrainingVideoDialogComponent, {
      data: {
        title: dialogTitle,
        videoUrl: videoUrl,
      },
      minWidth: '50vw',
      maxHeight: '95vh',
      maxWidth: '90vw',
    });
  }

  // Check if user has access to user administration section.
  // if they do, we want to show the security administration training link.
  private _userAdministrationAccess(application: string): void {
    this._userInfoService
      .getAccessControlLevelForApplication$(application)
      .pipe(untilDestroyed(this))
      .subscribe((accessControlLevel: string | undefined) => {
        this.hasSecurityAccess = accessControlLevel === 'r' || accessControlLevel === 'rw';
      });
  }

  /** Returns true if current time (America/Chicago) is within support hours */
  private _isWithinSupportHours(reference: Date = new Date()): boolean {
    // Convert the local browser time to America/Chicago time by creating a Date from the localized string.
    // This preserves wall-clock components for easier getDay/getHours usage.
    const chicagoNow = new Date(reference.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    const day = chicagoNow.getDay();
    const hour = chicagoNow.getHours();

    // Monday-Friday
    if (day >= 1 && day <= 5) {
      return hour >= 8 && hour < 19; // 8:00 AM through 6:59 PM
    }

    // Saturday
    if (day === 6) {
      return hour >= 10 && hour < 14; // 10:00 AM through 1:59 PM
    }

    // Sunday
    return false;
  }
}
