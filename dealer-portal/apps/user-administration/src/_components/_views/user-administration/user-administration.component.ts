import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ControlBarComponent } from '@components/control-bar';
import { HelpDialogComponent } from '@components/help-dialog/help-dialog.component';
import { UserTableComponent } from '@components/user-table';
import {
  AccessControlDirective,
  AccessControlLevel,
  ENVIRONMENT_CONFIG,
  UserAccountService,
} from '@dealer-portal/polaris-core';
import { PolarisButton, PolarisDialogService, PolarisHeading, PolarisHref, PolarisIcon } from '@dealer-portal/polaris-ui';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UserAdministrationService } from '@services';
import { TrainingVideoDialogComponent } from '@dealer-portal/polaris-modules';
import { SecurityAdminEnvironment } from '../../../_environments/security-admin-environment';

@Component({
    selector: 'ua-user-administration',
  imports: [
    UserTableComponent,
    PolarisButton,
    PolarisHeading,
    PolarisHref,
    PolarisIcon,
    TranslatePipe,
    AccessControlDirective,
    ControlBarComponent,
  ],
    templateUrl: './user-administration.component.html',
    styleUrl: './user-administration.component.scss',
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ]
})
export class UserAdministrationComponent {
  public title: string = this._translate.instant('title.security-administration');
  public readonly accessControlLevel: typeof AccessControlLevel = AccessControlLevel;

  // Training Resources
  public videoUrl: string = '';
  public articleUrl: string = '';
  public articleUrlFrench: string = '';

  constructor(
    @Inject(ENVIRONMENT_CONFIG) private readonly _environment: SecurityAdminEnvironment,
    private _router: Router,
    private _dialogService: PolarisDialogService,
    private _translate: TranslateService,
    private _userAccountService: UserAccountService,
    private _userAdministrationService: UserAdministrationService,
  ) {
    this._userAdministrationService.setUserInfo(this._userAccountService.userAccount, true);
    this.videoUrl = this._environment.trainingContent.securityAdmin.videoUrl;
    this.articleUrl = this._environment.trainingContent.securityAdmin.articleUrl;
    this.articleUrlFrench = this._environment.trainingContent.securityAdmin.articleUrlFrench;
  }

  public navigateApplication(route: string): void {
    this._router.navigate([route]);
  }

  public openHelpDialog(): void {
    this._dialogService.open(HelpDialogComponent)
  }

  public openVideoDialog(videoUrl: string): void {
    this._dialogService.open(TrainingVideoDialogComponent, {
      data: {
        title: this._translate.instant('title.security-administration'),
        videoUrl,
      },
      minWidth: '50vw',
      maxHeight: '95vh',
      maxWidth: '90vw',
    });
  }
}
