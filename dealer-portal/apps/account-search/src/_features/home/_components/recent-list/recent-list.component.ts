import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, NO_ERRORS_SCHEMA, OnInit, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RecentAccount } from '@classes';
import { ImpersonateResponse } from '@dealer-portal/polaris-core';
import {
  POLARIS_DESKTOP_BREAKPOINTS,
  POLARIS_MOBILE_BREAKPOINTS,
  POLARIS_TABLET_BREAKPOINTS,
  PolarisHref,
  PolarisIcon,
  PolarisIconButton,
  PolarisLoader,
  PolarisNotificationService,
  PolarisTable,
  PolarisTableColumnConfig,
  PolarisTableConfig,
  PolarisTableCustomCellDirective,
  PolarisTableDateCell,
} from '@dealer-portal/polaris-ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DealerPortalService } from '@services/dealer-portal/dealer-portal.service';
import { filter, Observable, of } from 'rxjs';

@UntilDestroy()
@Component({
    selector: 'as-recent-list',
    imports: [
        AsyncPipe,
        CommonModule,
        MatCardModule,
        PolarisHref,
        PolarisIcon,
        PolarisIconButton,
        PolarisLoader,
        PolarisTable,
        PolarisTableCustomCellDirective,
        PolarisTableDateCell,
        TranslatePipe
    ],
    templateUrl: './recent-list.component.html',
    styleUrl: './recent-list.component.scss',
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
    ]
})
export class RecentListComponent implements OnInit {
  @Input () accounts$: Observable<RecentAccount[] | null>= of([]);
  @Output() accountDeleted = new EventEmitter<RecentAccount>();

  public isLoading: boolean = false;
  public tableConfig!: PolarisTableConfig<RecentAccount>;

  constructor(
    private readonly _dealerPortalService: DealerPortalService,
    private readonly _polarisNotificationService: PolarisNotificationService,
    private readonly _translate: TranslateService
  ) {
      this._setTableConfig();
  }

  public ngOnInit(): void {
    // If page was restored from back-forward cache, reset loading state.
    window.addEventListener('pageshow', (event: PageTransitionEvent) => {
      if (event.persisted) {
        this.isLoading = false;
      }
    });

    this.accounts$.pipe(
      untilDestroyed(this),
      filter((accounts): accounts is RecentAccount[] => accounts !== null && accounts.length > 0)
    ).subscribe((accounts) => {
        this.tableConfig.pagination.totalItems = accounts.length;
    });
  }

  public deleteRecent(recentAccount: RecentAccount): void {
    if (!recentAccount) {
      this._polarisNotificationService.warning(this._translate.instant('recently-viewed.account-was-not-found'));

      return;
    }

    this.accountDeleted.emit(recentAccount);
  }

  public loginAsUser(recentAccount: RecentAccount): void {
    if (!recentAccount) {
      this._polarisNotificationService.warning(this._translate.instant('recently-viewed.account-is-null-or-undefined'));

      return;
    }

    this.isLoading = true;
    this._dealerPortalService.impersonateUser$(recentAccount.accountNumber, recentAccount.accountName, recentAccount.cityState, recentAccount.userName, recentAccount.portalAuthenticationId)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe({
        next: (impersonateResponse: ImpersonateResponse | undefined) => {
          if (impersonateResponse !== undefined) {
            this.isLoading = false;
            window.location.href = impersonateResponse.redirectUrl;
          }

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  private _setTableConfig(): void {
    const columns: PolarisTableColumnConfig<RecentAccount>[] = [
      new PolarisTableColumnConfig<RecentAccount>({
        key: 'accountName',
        id: 'accountName',
        label: 'Account Name',
        columnType: 'text',
        columnVisibility: [
          'sm',
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
      new PolarisTableColumnConfig<RecentAccount>({
        key: 'accountNumber',
        id: 'accountNumber',
        label: 'Account Number',
        columnVisibility: [
          'sm',
          ...POLARIS_TABLET_BREAKPOINTS,
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
      new PolarisTableColumnConfig<RecentAccount>({
        key: 'cityState',
        id: 'cityState',
        label: 'City, State',
        columnVisibility: [
          'sm',
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
      new PolarisTableColumnConfig<RecentAccount>({
        key: 'firstName',
        id: 'firstName',
        label: 'First Name',
        columnVisibility: [
          'sm',
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
      new PolarisTableColumnConfig<RecentAccount>({
        key: 'lastName',
        id: 'lastName',
        label: 'Last Name',
        columnVisibility: [
          'sm',
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
      new PolarisTableColumnConfig<RecentAccount>({
        key: 'userName',
        id: 'userName',
        label: 'Username',
        columnVisibility: [
          'sm',
          ...POLARIS_MOBILE_BREAKPOINTS,
          ...POLARIS_TABLET_BREAKPOINTS,
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
      new PolarisTableColumnConfig<RecentAccount>({
        key: 'impersonationDatetime',
        id: 'impersonationDatetime',
        label: 'Last Impersonation Date',
        alignContent: 'center',
        columnType: 'date',

        columnVisibility: [
          'sm',
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
      new PolarisTableColumnConfig<RecentAccount>({
        id: 'impersonate',
        label: 'Action',
        sortable: false,
        columnType: 'link',
        columnVisibility: [
          'sm',
          ...POLARIS_MOBILE_BREAKPOINTS,
          ...POLARIS_TABLET_BREAKPOINTS,
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ],
      }),
    ];

    this.tableConfig = new PolarisTableConfig<RecentAccount>({
      columns, pagination : {uiTestId: '', totalItems: 0},
    });
  }
}
