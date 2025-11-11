import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, Input, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { Account, ProductLinesBySalesBusinessUnit } from '@classes';
import { AccessControlLevel, CoreData, CoreService, Environment, ENVIRONMENT_CONFIG, ImpersonateResponse, PhoneNumberPipe, ProductLine, ProductLineByBusinessUnit, UserAccountService } from '@dealer-portal/polaris-core';
import {
  PolarisDivider,
  PolarisHref, PolarisIcon,
  PolarisLoader,
  PolarisNotificationService,
} from '@dealer-portal/polaris-ui';
import { AccountSearchDefaults } from '@enums/index';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DealerPortalService } from '@services/dealer-portal/dealer-portal.service';
import { UserAdminService } from '@services/user-admin/user-admin.service';
import { combineLatest, filter, Observable, of } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'as-account-list',
  imports: [
    CommonModule,
    MatCardModule,
    PolarisHref,
    PolarisLoader,
    PhoneNumberPipe,
    ReactiveFormsModule,
    TranslatePipe,
    PolarisDivider,
    PolarisIcon
    ],
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.scss',
  schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA,
  ]
})

export class AccountListComponent implements OnInit {
  @Input () accounts$: Observable<Account[] | null>= of([]);
  @Input () firstSearch: boolean = true;

  private readonly _salesUserClassCodes: string[] = ["DOS", "GSM", "RSM", "SLS"];
  private readonly _dealerProfileAppId: number;

  public accountCount?: number = 0;
  public isLoading: boolean = false;
  public canImpersonateAccount: boolean = false;
  public canImpersonateUser: boolean = false;

  constructor(
    @Inject(ENVIRONMENT_CONFIG) environment: Environment,
    private readonly _router: Router,
    private readonly _dealerPortalService: DealerPortalService,
    private readonly _userAdminService: UserAdminService,
    private readonly _polarisNotificationService: PolarisNotificationService,
    private readonly _userAccountService: UserAccountService,
    private readonly _translate: TranslateService,
    private readonly _coreDataService: CoreService
  )
  {
    if (!environment.dealerProfileAppId) {
      throw new Error('No dealer profile app id found in environment');

    }
    this._dealerProfileAppId = environment.dealerProfileAppId;
  }

  public ngOnInit(): void {

    this._loadAccountAndCoreData();

    this.canImpersonateAccount = [AccessControlLevel.Read, AccessControlLevel.ReadWrite]
      .includes(this._userAccountService.userAccount.accountImpersonationPermission ?? AccessControlLevel.None);
    this.canImpersonateUser = [AccessControlLevel.Read, AccessControlLevel.ReadWrite]
      .includes(this._userAccountService.userAccount.internalImpersonationPermission ?? AccessControlLevel.None);

    // If page was restored from back-forward cache, reset loading state.
    window.addEventListener('pageshow', (event: PageTransitionEvent) => {
      if (event.persisted) {
        // The user's claims may have changed, so we need to refetch the account.
        this._userAccountService.fetchUserClaims().pipe(untilDestroyed(this)).subscribe(() => {
          this.isLoading = false;
        });
      }
    });
  }

  public loginToAccount(account?: Account): void {

    if (!account?.accountNumber) {
      this._polarisNotificationService.warning(this._translate.instant('errors.missing-account-number'));

      return;
    }

    // impersonation will redirect to the users's home page
    this.isLoading = true;
    this._userAdminService.getAdminUserByAccount$(account)
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

  public loginAsSalesUser(account?: Account): void {
    if (!account?.emailAddress) {
      this._polarisNotificationService.warning(this._translate.instant("errors.missing-account-number-email-address"));

      return;
    }

    this.isLoading = true;
    this._dealerPortalService
      .impersonateInternalUser$(AccountSearchDefaults.internalAccount, account.emailAddress)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (impersonationResponse: ImpersonateResponse | undefined) => {
          if (impersonationResponse) {
            this.isLoading = false;
            window.location.href = impersonationResponse.redirectUrl;
          }

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  public openInGoogleMaps(account: Account): void {
    if (account.primaryAddress?.Address1 && account.primaryAddress?.CityStatePostal) {
      const query = `${account.primaryAddress.Address1}, ${account.primaryAddress.CityStatePostal}, ${account.accountName}`;
      const googleMapsUrl = `http://maps.google.com/?q=${encodeURIComponent(query)}`;
      window.open(googleMapsUrl, '_blank');
    }
  }

  public openWebsite(account: Account): void {
    if (account.website) {
      window.open(account.website, '_blank');
    }
  }

  public impersonateAndRedirect(account: Account): void {
    if (account.accountNumber && account.emailAddress) {
      this._dealerPortalService.impersonateAndRedirect$(account.accountNumber, this._dealerProfileAppId, account.emailAddress).pipe(untilDestroyed(this)).subscribe();
    }
  }

  public selectUser(account?: Account): void {
    this._router.navigate(['/user-impersonation'], { queryParams: { account: account?.accountNumber ?? '', accountName: account?.accountName ?? '', cityState: account?.primaryAddress?.CityState ?? ''} });
  }

  public isSalesUser(account: Account): boolean {
    return this._salesUserClassCodes.includes(account.classCode ?? '');
  }

  private _loadAccountAndCoreData(): void {
    combineLatest([
      this.accounts$,
      this._coreDataService.getCoreData$({productLineByBusinessUnit: true})
    ])
    .pipe(
      filter(([accounts, coreData]) => !!accounts && !!coreData),
      untilDestroyed(this)
    )
    .subscribe(([accounts, coreData])  => {

      // sort the core data product lines by sales business unit and then by default sort order within each sales business unit
      let accountAvailableProductLines: string[] = [];
      accounts?.forEach((account: Account) => {
        accountAvailableProductLines.push(...(account.products?.map(product => product.productFamilyName?.toLowerCase() ?? '') ?? []));
        const filteredAndSortedAccountProductLineByBusinessUnit = this._processAccountData(coreData, accountAvailableProductLines);
        account.productLinesBySalesBusinessUnit = filteredAndSortedAccountProductLineByBusinessUnit.map(
          productLineByBusinessUnit => new ProductLinesBySalesBusinessUnit(productLineByBusinessUnit));
        accountAvailableProductLines = [];
      });
    });
  }

  private _processAccountData(data: CoreData, availableProductLines: string[]) : ProductLineByBusinessUnit[] {
    const availableSet: Set<string> = new Set(availableProductLines.map((productLine) => productLine.toLowerCase()));
    const productLinesByBusinessUnit: ProductLineByBusinessUnit[] = data.productLinesByBusinessUnit
      .map((businessUnit) => {
        const filteredLines: ProductLine[] = businessUnit.productLines
          .filter((productLine) => productLine.description && availableSet.has(productLine.description.toLowerCase()))
          .sort((a, b) => (a.defaultSortOrder ?? 0) - (b.defaultSortOrder ?? 0));

        const productLineByBusinessUnit = new ProductLineByBusinessUnit();
        productLineByBusinessUnit.salesBusinessUnit = businessUnit.salesBusinessUnit;
        productLineByBusinessUnit.salesBusinessSort = businessUnit.salesBusinessSort;
        productLineByBusinessUnit.productLines = filteredLines;

        return productLineByBusinessUnit;
      })
      .filter((unit) => unit.productLines.length > 0)
      .sort((a, b) => (a.salesBusinessSort ?? 0) - (b.salesBusinessSort ?? 0));

      return productLinesByBusinessUnit;
  }
}
