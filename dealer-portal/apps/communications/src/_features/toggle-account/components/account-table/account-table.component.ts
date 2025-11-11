import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ToggleAccount } from '@classes';
import { CoreData, CoreDataOptions, CoreService, StandardResponse, UserAccountSchema, UserInfoApiService } from '@dealer-portal/polaris-core';
import {
  PolarisHref,
  PolarisIcon,
  PolarisLoader,
  PolarisNotificationService,
  PolarisStatusIcon, PolarisTableConfig
} from '@dealer-portal/polaris-ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DealerPortalService } from '@services';
import { ToggleAccountDetailEntity, ToggleAccountEntity } from '@types';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';

@UntilDestroy()
@Component({
    imports: [
        AsyncPipe,
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        PolarisHref,
        PolarisIcon,
        PolarisLoader,
        PolarisStatusIcon,
        TranslatePipe
    ],
    selector: 'comm-account-table',
    styleUrl: './account-table.component.scss',
    templateUrl: './account-table.component.html',
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
    ]
})
export class AccountTableComponent implements OnInit {

  @Input() searchTerm$!: Observable<string>;

  private _accounts: BehaviorSubject<ToggleAccount[] | null> = new BehaviorSubject<ToggleAccount[] | null>(null);

  public isExpanded: boolean = false;
  public activeAccountNumber: string = '';
  public activeSearchTerm: string = '';
  public isImpersonating: boolean = false;
  public accounts: ToggleAccount[] = [];
  public accounts$: Observable<ToggleAccount[] | null> = this._accounts.asObservable();
  public tableConfig!: PolarisTableConfig<ToggleAccount>;
  public columnsToDisplay = ['accountName', 'accountNumber', 'accountType', 'city', 'state', 'toggle'];
  public columnsToDisplayWithExpand = ['expand', ...this.columnsToDisplay];
  public expandedAccount: ToggleAccount | null = null;

  constructor(
    private readonly _coreService: CoreService,
    private readonly _dealerPortalService: DealerPortalService,
    private readonly _userInfoApiService: UserInfoApiService,
    private readonly _polarisNotificationService: PolarisNotificationService,
    private _translate: TranslateService // used in component template
  ) {}

  public ngOnInit(): void {
    this._subscribeToSearchTerm();
    this._subscribeToUserInfo();
  }

  public switchAccount(account: ToggleAccount): void {

    this.isImpersonating = true;

    // impersonation will redirect to the impersonated users's home page or unauthorized page
    this._dealerPortalService.switchAccount$(account)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((redirectUrl:string) => {
        window.location.href = redirectUrl;
        // by default when redirecting, this.isImpersonating = false;
      });
  }

  public toggleExpansion(account: ToggleAccount): void {
    this.isExpanded = !this.isExpanded;
    this.expandedAccount = this.expandedAccount === account ? null : account;
  }

  private _filterAccountUsers(searchTerm: string): void {
    let accounts: ToggleAccount[] | null = structuredClone(this.accounts);
    if (!accounts || accounts.length === 0) {

      return;
    }

    // Filter users based on search term
    accounts = accounts.filter((toggleAccounts: ToggleAccount): boolean => {
      const userAsString: string = JSON.stringify(Object.values(toggleAccounts)).toLowerCase();
      const includesSearchTerm: boolean = userAsString.includes(searchTerm.toLowerCase());

      return includesSearchTerm;
    });

    this._accounts.next(accounts);
  }

  private _flattenEntityHierarchy(entities: ToggleAccountDetailEntity[]): ToggleAccountDetailEntity[] {
    if (!entities || entities.length === 0) {
      return [];
    }

    return entities.reduce((acc, entity) => {
      acc.push(entity);
      if (entity && entity.hierarchy && entity.hierarchy.length > 0) {
        acc.push(...this._flattenEntityHierarchy(entity.hierarchy));
      }

      return acc;
    }, [] as ToggleAccountDetailEntity[]);
  }

  private _subscribeToSearchTerm(): void {
    this.searchTerm$.pipe(untilDestroyed(this)).subscribe((value: string) => {
      this._filterAccountUsers(value);
    });
  }

  private _subscribeToUserInfo(): void {
    const coreDataNeeded: CoreDataOptions = {
      customerClasses: true // other core data defaults to null (false)
    };

    combineLatest([
      this._userInfoApiService.getUserInfo$<ToggleAccountEntity>(UserAccountSchema.User),
      this._coreService.getCoreData$(coreDataNeeded)
    ]).pipe(
      untilDestroyed(this),
    ).subscribe(([userInfoResponse, coreResponse]:[StandardResponse<ToggleAccountEntity>, CoreData]) => {

      if (!userInfoResponse || !userInfoResponse.data || !coreResponse || !coreResponse.customerClasses) {
        this._polarisNotificationService.warning('Account data was not found.');
        this._accounts.next([]);

        return;
      }

      const entity: ToggleAccountEntity = userInfoResponse.data;
      this.activeAccountNumber = entity.accountNumber ?? '';
      entity.accounts.forEach((detailEntity: ToggleAccountDetailEntity) => {
        const account: ToggleAccount = new ToggleAccount(detailEntity, coreResponse.customerClasses);
        const flattenEntities = this._flattenEntityHierarchy(detailEntity.hierarchy);
        flattenEntities?.forEach((detail: Partial<ToggleAccountDetailEntity>) => {
          account.details.push(new ToggleAccount(detail, coreResponse.customerClasses));
        });

        this.accounts.push(account);
      });

      this._accounts.next(this.accounts);
    });
  }
}
