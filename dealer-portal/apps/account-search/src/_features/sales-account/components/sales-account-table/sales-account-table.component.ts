import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { SalesAccount } from '@classes/index';
import { Environment, ENVIRONMENT_CONFIG, ImpersonateResponse } from '@dealer-portal/polaris-core';
import {
  POLARIS_DESKTOP_BREAKPOINTS,
  POLARIS_MOBILE_BREAKPOINTS,
  POLARIS_TABLET_BREAKPOINTS,
  PolarisHref,
  PolarisIcon,
  PolarisLoader,
  PolarisNotificationService, PolarisTable, PolarisTableColumnConfig, PolarisTableConfig,
  PolarisTableCustomCellDirective
} from '@dealer-portal/polaris-ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DealerPortalService } from '@services/dealer-portal/dealer-portal.service';
import { filter, Observable } from 'rxjs';

@UntilDestroy()
@Component({
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        PolarisHref,
        PolarisLoader,
        PolarisIcon,
        PolarisTable,
        PolarisTableCustomCellDirective,
        TranslatePipe
    ],
    selector: 'as-sales-account-table',
    styleUrl: './sales-account-table.component.scss',
    templateUrl: './sales-account-table.component.html',
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class SalesAccountTableComponent implements OnInit {

  private _deepLinkId: number | undefined;

  @Input() searchTerm$!: Observable<string>;
  @Input() salesAccounts$!: Observable<SalesAccount[] | null>;
  @Input() selectedUsername$!: Observable<string | null>;

  public activeAccountNumber: string = '';
  public activeSearchTerm: string = '';
  public isAccountLogin: boolean = false;
  public salesAccounts: SalesAccount[] = [];
  public tableConfig!: PolarisTableConfig<SalesAccount>;

  constructor(
    @Inject(ENVIRONMENT_CONFIG) environment: Environment,
    private readonly _polarisNotificationService: PolarisNotificationService,
    private _dealerPortalService: DealerPortalService,
    private _translate: TranslateService // used in component template
  ) {

    if (!environment.businessPlanDeepLinkId) {
      throw new Error('No business plan app id found in environment');
    }
    this._deepLinkId = environment.businessPlanDeepLinkId;
  }

  public ngOnInit(): void {
    this._setTableConfig();
    this._subscribeToSalesHierarchy();
  }

  public loginToAccount(account: SalesAccount): void {
    this._impersonateAccountAndRedirect(account);
  }

  public showPlan(account: SalesAccount): void {
    const url: string = `/corp/BusinessPlanV4/BusinessReviewV2.asp?ProductLine=${account.productLineCode}&DealerId=${account.accountNumber}&dlid=${this._deepLinkId}`;
    this._impersonateAccountAndRedirect(account, url);
  }

  private _impersonateAccountAndRedirect(account: SalesAccount, url?: string): void
  {
    if (!account?.accountNumber) {
      this._polarisNotificationService.warning(this._translate.instant('errors.missing-account-number'));

      return;
    }

    // account login will redirect to the users's home page
    this.isAccountLogin = true;

    this._dealerPortalService.salesRepAccountLogin$(account.accountNumber)
    .pipe(
      untilDestroyed(this)
    )
    .subscribe({

      next: (impersonateResponse: ImpersonateResponse | undefined) => {
        if (impersonateResponse !== undefined) {
          window.location.href = url ? `${impersonateResponse.redirectUrl}${url}` : impersonateResponse.redirectUrl;
        }
      },
      error: () => {
        this.isAccountLogin = false;
      }
    });
  }

  private _setTableConfig(): void {
    const columns: PolarisTableColumnConfig<SalesAccount>[] = [
      new PolarisTableColumnConfig<SalesAccount>({
        key: 'salesManagerName',
        id: 'salesManagerName',
        label: this._translate.instant('sales-account-view.table-column.sales-manager-name'),
        sortable: true,
        alignHeader: 'center',
        columnVisibility: [
          'sm',
          ...POLARIS_DESKTOP_BREAKPOINTS,
          ...POLARIS_TABLET_BREAKPOINTS,
          ...POLARIS_MOBILE_BREAKPOINTS,
        ]
      }),
      new PolarisTableColumnConfig<SalesAccount>({
        key: 'accountNumber',
        id: 'accountNumber',
        label: this._translate.instant('sales-account-view.table-column.account-number'),
        sortable: true,
        alignHeader: 'center',
        columnVisibility: [
          'sm',
          ...POLARIS_DESKTOP_BREAKPOINTS,
          ...POLARIS_TABLET_BREAKPOINTS,
          ...POLARIS_MOBILE_BREAKPOINTS,
        ]
      }),
      new PolarisTableColumnConfig<SalesAccount>({
        key: 'accountName',
        id: 'accountName',
        label: this._translate.instant('sales-account-view.table-column.account-name'),
        sortable: true,
        alignHeader: 'center',
        columnVisibility: [
          'md',
          ...POLARIS_DESKTOP_BREAKPOINTS,
          ...POLARIS_TABLET_BREAKPOINTS,
        ]
      }),
      new PolarisTableColumnConfig<SalesAccount>({
        key: 'city',
        id: 'city',
        label: this._translate.instant('sales-account-view.table-column.city'),
        sortable: true,
        columnVisibility: [
          'md',
          ...POLARIS_DESKTOP_BREAKPOINTS,
          ...POLARIS_TABLET_BREAKPOINTS,
        ]
      }),
      new PolarisTableColumnConfig<SalesAccount>({
        key: 'state',
        id: 'state',
        label: this._translate.instant('sales-account-view.table-column.state'),
        sortable: true,
        columnVisibility: [
          'md',
          ...POLARIS_DESKTOP_BREAKPOINTS,
          ...POLARIS_TABLET_BREAKPOINTS,
        ]
      }),
      new PolarisTableColumnConfig<SalesAccount>({
        alignContent: 'center',
        key: 'plan',
        id: 'plan',
        label: this._translate.instant('sales-account-view.table-column.plan'),
        sortable: false,
        columnType: 'icon',
        columnVisibility: [
          'sm',
          ...POLARIS_MOBILE_BREAKPOINTS,
          ...POLARIS_TABLET_BREAKPOINTS,
          ...POLARIS_DESKTOP_BREAKPOINTS,
        ]
      }),
      new PolarisTableColumnConfig<SalesAccount>({
        alignContent: 'center',
        id: 'login',
        label: this._translate.instant('sales-account-view.table-column.login'),
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

    this.tableConfig = new PolarisTableConfig<SalesAccount>({
      columns, pagination: { uiTestId: '', totalItems: 0 },
    });
  }

  private _subscribeToSalesHierarchy(): void {

    this.salesAccounts$.pipe(
      untilDestroyed(this),
      filter((salesAccounts): salesAccounts is SalesAccount[] => salesAccounts !== null)
    ).subscribe((salesAccounts: SalesAccount[]) => {

        // sort by accountName, then by accountNumber
        this.salesAccounts = salesAccounts.sort((a, b) => {
          if (!a && !b) return 0;
          if (!a) return 1;
          if (!b) return -1;

          const managerA = a.salesManagerName ?? "";
          const managerB = b.salesManagerName ?? "";
          const managerCompare = managerA.localeCompare(managerB);
          if (managerCompare !== 0) return managerCompare;

          const nameA = a.accountName ?? "";
          const nameB = b.accountName ?? "";
          
          return nameA.localeCompare(nameB);
        });

        this.tableConfig.pagination.totalItems = salesAccounts.length;
    });
  }
}
