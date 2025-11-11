import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisAlignment, PolarisStatusIcon, PolarisTable, PolarisTableColumnConfig, PolarisTableConfig, PolarisTableCustomCellDirective, PolarisTableTheme } from '@dealer-portal/polaris-ui';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { AccountConnectorApiService, CoreApiService, CoreDataEntity, GraphQLResponse, ProductLineByFamilyEntity, ProductLineEntity, RetailGoal, StandardResponse } from '@dealer-portal/polaris-core';
import { PolarisBaseWidgetComponent } from '../polaris-base-widget/polaris-base-widget.component';

@UntilDestroy()
@Component({
  selector: 'polaris-monthly-retail-goal-widget',
  imports: [
    CommonModule,
    PolarisTable,
    PolarisTableCustomCellDirective,
    PolarisStatusIcon,
    TranslatePipe,
    PolarisBaseWidgetComponent,
  ],
  templateUrl: './polaris-monthly-retail-goal-widget.component.html',
  styleUrl: './polaris-monthly-retail-goal-widget.component.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class PolarisMonthlyRetailGoalWidget implements OnInit {
  public PolarisTableTheme: typeof PolarisTableTheme = PolarisTableTheme;
  public retailGoalsDataSubject: BehaviorSubject<RetailGoal[]> = new BehaviorSubject<RetailGoal[]>([]);
  public retailGoalsData$: Observable<RetailGoal[]> = this.retailGoalsDataSubject.asObservable();
  public tableConfig!: PolarisTableConfig<RetailGoal>;


  constructor(
    private _accountConnectorApiService: AccountConnectorApiService,
    private _coreApiService: CoreApiService,
    private _translate: TranslateService) { }

  public ngOnInit(): void {
    this._initializeTableConfig();
    this._loadRetailGoalsData();
  }

  private _initializeTableConfig(): void {
    const columns: PolarisTableColumnConfig<RetailGoal>[] = [
      this._createColumnConfig('table.col.product', 'productLine', 'start', 'start'),
      this._createColumnConfig('table.col.actual', 'actual', 'center', 'center'),
      this._createColumnConfig('table.col.goal', 'goal', 'center', 'center'),
      new PolarisTableColumnConfig<RetailGoal>({
        label: '',
        id: 'achieved',
        key: 'achieved',
        columnType: 'icon',
        alignHeader: 'center',
        alignContent: 'center',
        sortable: false
      }),
    ];

    this.tableConfig = new PolarisTableConfig<RetailGoal>({
      columns,
      pagination: undefined
    });
  }

  private _loadRetailGoalsData(): void {
    const productLines$ = this._fetchProductLines();
    const monthlyRetailGoals$ = this._fetchMonthlyRetailGoals();

    combineLatest([productLines$, monthlyRetailGoals$])
      .pipe(untilDestroyed(this))
      .subscribe(([productLines, monthlyRetailGoalsResponse]: [ProductLineEntity[], StandardResponse<RetailGoal[]>]) => {
        if (monthlyRetailGoalsResponse.success && monthlyRetailGoalsResponse.data) {
          const mergedData = this._mergeRetailGoalsData(productLines, monthlyRetailGoalsResponse.data);
          this.retailGoalsDataSubject.next(mergedData);
        }
      });
  }

  private _fetchProductLines(): Observable<ProductLineEntity[]> {
    return this._coreApiService.getCoreData$({ productLineByFamily: true }).pipe(
      map((coreDataResponse: GraphQLResponse<CoreDataEntity>) =>
        coreDataResponse.data?.productLinesByProductFamily?.flatMap((family: ProductLineByFamilyEntity) => family.productLines) ?? []
      )
    );
  }

  private _fetchMonthlyRetailGoals(): Observable<StandardResponse<RetailGoal[]>> {
    return this._accountConnectorApiService.getMonthlyRetailGoals$();
  }

  private _mergeRetailGoalsData(productLines: ProductLineEntity[], retailGoals: RetailGoal[]): RetailGoal[] {
    const displayData: RetailGoal[] = retailGoals.map((retailGoal: RetailGoal) => ({
      ...retailGoal,
      productLine: productLines.find((productLine: ProductLineEntity) =>
        productLine.name === retailGoal.productLine?.substring(0, 3)
      )?.description ?? retailGoal.productLine
    }));

    return Array.from(
      displayData.reduce((map: Map<string, RetailGoal>, item: RetailGoal) => {
        const existing = map.get(item.productLine);
        if (existing) {
          existing.actual += item.actual;
          existing.goal += item.goal;
        } else {
          map.set(item.productLine, { ...item });
        }
        return map;
      }, new Map<string, RetailGoal>())
        .values()
    );
  }


  private _createColumnConfig(labelKey: string, key: string, alignHeader: PolarisAlignment, alignContent: PolarisAlignment): PolarisTableColumnConfig<RetailGoal> {
    return new PolarisTableColumnConfig<RetailGoal>({
      label: this._translate.instant(labelKey),
      id: key,
      key: key,
      alignHeader: alignHeader,
      alignContent: alignContent,
      sortable: false
    });
  }
}
