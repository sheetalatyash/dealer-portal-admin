/**
 * Component for managing communications administration.
 */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { Router, RouterModule } from '@angular/router';
import {
  Communication,
  CommunicationListingOptions,
  CommunicationStatus,
  CommunicationStatusType,
  CoreService,
  LoggerService,
  PaginationResponse,
  ProductLine,
  ProductLineByBusinessUnit,
} from '@dealer-portal/polaris-core';
import {
  PolarisButton,
  PolarisChipList,
  PolarisChipListItem,
  PolarisDialogService,
  PolarisHeading,
  PolarisHref,
  PolarisIcon,
  PolarisIconButton,
  PolarisNotificationService,
  PolarisSearchBar,
  PolarisTable,
  PolarisTableColumnConfig,
  PolarisTableConfig,
  PolarisTableCustomCellDirective,
  PolarisTableDateCell,
} from '@dealer-portal/polaris-ui';
import { CommunicationAddEditStep, CommunicationListingColumn, CommunicationListingFilter, Route } from '@enums';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommunicationsService } from '@services/communications/communications.service';
import { LookupService } from '@services/lookup/lookup.service';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  filter,
  forkJoin,
  map,
  Observable,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { CommunicationListingVm } from '../../_view_models/communication-listing.vm';
import { StandardDialogComponent } from '../communication-add-edit/_components/standard-dialog/standard-dialog.component';

@UntilDestroy()
@Component({
  selector: 'ca-communication-administration',
  imports: [
    CommonModule,
    PolarisTable,
    PolarisTableCustomCellDirective,
    PolarisTableDateCell,
    PolarisHeading,
    PolarisHref,
    PolarisIcon,
    PolarisIconButton,
    PolarisButton,
    PolarisChipList,
    PolarisSearchBar,
    RouterModule,
    TranslatePipe,
  ],
  templateUrl: './communication-administration.component.html',
  styleUrl: './communication-administration.component.scss',
})
export class CommunicationAdministrationComponent implements OnInit {
  /**
   * Configuration for the Polaris table.
   */
  public tableConfig!: PolarisTableConfig<CommunicationListingVm>;

  /**
   * Subject for the list of communications.
   */
  public communicationsSubject: BehaviorSubject<CommunicationListingVm[]> = new BehaviorSubject<
    CommunicationListingVm[]
  >([]);

  /**
   * Observable for the list of communications.
   */
  public communications$: Observable<CommunicationListingVm[]> = this.communicationsSubject.asObservable();

  /**
   * Subject for managing the current page of pagination.
   */
  public currentPageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  /**
   * Observable for the current page of pagination.
   */
  public currentPage$: Observable<number> = this.currentPageSubject.asObservable();

  /**
   * The number of items to display per page.
   */
  public pageSize = 50;

  /**
   * Subject for managing search text.
   */
  public searchSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  /**
   * Observable for the search text.
   */
  public search$: Observable<string> = this.searchSubject.asObservable();

  /**
   * Subject for managing filters.
   */
  public filtersSubject: BehaviorSubject<PolarisChipListItem<number>[]> = new BehaviorSubject<
    PolarisChipListItem<number>[]
  >([]);

  /**
   * Observable for the filters
   */
  public filters$: Observable<PolarisChipListItem<number>[]> = this.filtersSubject.asObservable();

  /**
   * Subject for managing sort state.
   */
  public sortSubject: BehaviorSubject<Sort> = new BehaviorSubject<Sort>({ active: '', direction: '' });

  /**
   * Observable for the sort state.
   */
  public sort$: Observable<Sort> = this.sortSubject.asObservable();

  /**
   * List of sortable columns.
   */
  private readonly _sortableColumns: Set<string> = new Set<string>([
    CommunicationListingColumn.Title,
    CommunicationListingColumn.StartDate,
    CommunicationListingColumn.EndDate,
    CommunicationListingColumn.CreatedOn,
    CommunicationListingColumn.CreatedBy,
  ]);

  /**
   * Fallback product line codes for filters in case lookup fails.
   * These are to be used only in tandem with logging an error when the lookup fails.
   */
  private _fallbackProductLineFilters = new Map<CommunicationListingFilter, string>([
    [CommunicationListingFilter.ORV, 'ATV,RGR,RZR,XVR,YTH'],
    [CommunicationListingFilter.OnRoad, 'IND,SLG'],
    [CommunicationListingFilter.Snow, 'SNO,TSL'],
    [CommunicationListingFilter.Marine, 'GDY,HUR,BEN'],
    [CommunicationListingFilter.WorkAndTransport, 'COM,LEV,MIL,GEN,BRU'],
  ]);

  /**
   * List of filter chips.
   */
  public filters: PolarisChipListItem<number>[] = [];

  public communicationStatusType: typeof CommunicationStatusType = CommunicationStatusType;

  constructor(
    private _communicationService: CommunicationsService,
    private _coreService: CoreService,
    private _lookUpService: LookupService,
    private _loggerService: LoggerService,
    private _router: Router,
    private _translate: TranslateService,
    private _dialogService: PolarisDialogService,
    private _polarisNotificationService: PolarisNotificationService,
  ) {}

  public ngOnInit(): void {
    const columns: PolarisTableColumnConfig<CommunicationListingVm>[] = [
      new PolarisTableColumnConfig<CommunicationListingVm>({
        label: this._translate.instant('table.col.title'),
        id: CommunicationListingColumn.Title,
        key: 'title',
      }),
      new PolarisTableColumnConfig<CommunicationListingVm>({
        label: this._translate.instant('table.col.start-date'),
        id: CommunicationListingColumn.StartDate,
        key: 'startDate',
      }),
      new PolarisTableColumnConfig<CommunicationListingVm>({
        label: this._translate.instant('table.col.end-date'),
        id: CommunicationListingColumn.EndDate,
        key: 'endDate',
      }),
      new PolarisTableColumnConfig<CommunicationListingVm>({
        label: this._translate.instant('table.col.group'),
        id: CommunicationListingColumn.Group,
        key: 'group',
        sortable: false,
      }),
      new PolarisTableColumnConfig<CommunicationListingVm>({
        label: this._translate.instant('table.col.sub-group'),
        id: CommunicationListingColumn.SubGroup,
        key: 'subGroup',
        alignHeader: 'center',
        alignContent: 'center',
        sortable: false,
      }),
      new PolarisTableColumnConfig<CommunicationListingVm>({
        label: this._translate.instant('table.col.created-on'),
        id: CommunicationListingColumn.CreatedOn,
        key: 'createdDate',
      }),
      new PolarisTableColumnConfig<CommunicationListingVm>({
        label: this._translate.instant('table.col.status'),
        id: CommunicationListingColumn.Status,
        key: 'status',
        alignHeader: 'center',
        alignContent: 'center',
        sortable: false,
      }),
      new PolarisTableColumnConfig<CommunicationListingVm>({
        label: this._translate.instant('table.col.created-by'),
        id: CommunicationListingColumn.CreatedBy,
        key: 'createdBy',
      }),
      new PolarisTableColumnConfig<CommunicationListingVm>({
        label: this._translate.instant('table.col.language'),
        id: CommunicationListingColumn.Translations,
        sortable: false,
      }),
      new PolarisTableColumnConfig<CommunicationListingVm>({
        label: this._translate.instant('table.col.actions'),
        id: CommunicationListingColumn.Actions,
        sortable: false,
        alignHeader: 'center',
        alignContent: 'center',
      }),
      new PolarisTableColumnConfig<CommunicationListingVm>({
        key: 'delete',
        id: 'delete',
        label: '',
        sortable: false,
      }),
    ];

    this.tableConfig = new PolarisTableConfig<CommunicationListingVm>({
      columns,
      customSort: (sort: Sort) => this.onSort(sort),
    });

    this._getFilters();
    this._getCommunications();
  }

  /**
   * Fetches the list of filters and initializes the filter chips.
   */
  private _getFilters(): void {
    forkJoin([
      this._lookUpService.getStatuses$(),
      this._lookUpService.getGroups$(),
      this._coreService.getCoreData$({ productLineByBusinessUnit: true }),
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([statuses, groups, { productLinesByBusinessUnit }]) => {
        if (productLinesByBusinessUnit === undefined) {
          this._loggerService.logError(
            'Failed to fetch product lines by business unit for communication filters, productLinesByBusinessUnit was undefined.',
          );
        }

        this.filters = [
          new PolarisChipListItem<number>({
            id: CommunicationListingFilter.Active,
            label: this._translate.instant('communication-administration.filter.active'),
            value: statuses.find((status) => status.name === CommunicationListingFilter.Active)?.statusId ?? '',
            testId: 'active-filter',
          }),
          new PolarisChipListItem<number>({
            id: CommunicationListingFilter.ORV,
            label: this._translate.instant('communication-administration.filter.orv'),
            value: this._getProductLineCodeFilter(productLinesByBusinessUnit, CommunicationListingFilter.ORV),
            testId: 'orv-filter',
          }),
          new PolarisChipListItem<number>({
            id: CommunicationListingFilter.Snow,
            label: this._translate.instant('communication-administration.filter.snow'),
            value: this._getProductLineCodeFilter(productLinesByBusinessUnit, CommunicationListingFilter.Snow),
            testId: 'snow-filter',
          }),
          new PolarisChipListItem<number>({
            id: CommunicationListingFilter.OnRoad,
            label: this._translate.instant('communication-administration.filter.on-road'),
            value: this._getProductLineCodeFilter(productLinesByBusinessUnit, CommunicationListingFilter.OnRoad),
            testId: 'on-road-filter',
          }),
          new PolarisChipListItem<number>({
            id: CommunicationListingFilter.Marine,
            label: this._translate.instant('communication-administration.filter.marine'),
            value: this._getProductLineCodeFilter(productLinesByBusinessUnit, CommunicationListingFilter.Marine),
            testId: 'marine-filter',
          }),
          new PolarisChipListItem<number>({
            id: CommunicationListingFilter.WorkAndTransport,
            label: this._translate.instant('communication-administration.filter.work-and-transport'),
            value: this._getProductLineCodeFilter(
              productLinesByBusinessUnit,
              CommunicationListingFilter.WorkAndTransport,
            ),
            testId: 'work-and-transport-filter',
          }),
          new PolarisChipListItem<number>({
            id: CommunicationListingFilter.Alerts,
            label: this._translate.instant('communication-administration.filter.alerts'),
            value: groups.find((group) => group.name === CommunicationListingFilter.Alerts)?.groupId ?? '',
            testId: 'alerts-filter',
          }),
          new PolarisChipListItem<number>({
            id: CommunicationListingFilter.Programs,
            label: this._translate.instant('communication-administration.filter.programs'),
            value: groups.find((group) => group.name === CommunicationListingFilter.Programs)?.groupId ?? '',
            testId: 'programs-filter',
          }),
          new PolarisChipListItem<number>({
            id: CommunicationListingFilter.PolarisConnect,
            label: this._translate.instant('communication-administration.filter.polaris-connect'),
            value: groups.find((group) => group.name === CommunicationListingFilter.PolarisConnect)?.groupId ?? '',
            testId: 'polaris-connect-filter',
          }),
          new PolarisChipListItem<number>({
            id: CommunicationListingFilter.MyCommunications,
            label: this._translate.instant('communication-administration.filter.my-communications'),
            selected: true,
            testId: 'my-communications-filter',
          }),
        ];

        this.filtersSubject.next(this.filters.filter((initialFilter) => initialFilter.selected));
        this._subscribeToTableFilters();
      });
  }

  /**
   * Returns a comma-separated list of product line codes for the given business unit filter.
   *
   * @param productLinesByBusinessUnit Full list of product lines grouped by business unit from core data.
   * @param filter The communication listing filter (business unit identifier).
   * @returns Comma-separated string of product line codes (e.g., "ATV,RGR,RZR") or empty string if not found.
   */
  private _getProductLineCodeFilter(
    productLinesByBusinessUnit: ProductLineByBusinessUnit[],
    listingFilter: CommunicationListingFilter,
  ): string {
    // Find the product lines for the given business unit
    const matchingBusinessUnit = productLinesByBusinessUnit.find(
      (productLineGrouping) => productLineGrouping.salesBusinessUnit === listingFilter,
    );

    // Serialize the product line codes for the given business unit into a comma-separated string
    let productLineFilter = matchingBusinessUnit?.productLines
      .map((productLine: ProductLine) => productLine.name?.toUpperCase())
      .filter((name) => name != null)
      .join(',');

    if (!matchingBusinessUnit) {
      this._loggerService.logError(`No product line codes found for filter '${listingFilter}', using fallback values.`);
      productLineFilter = this._fallbackProductLineFilters.get(listingFilter);
    }

    return productLineFilter ?? '';
  }

  /**
   * Subscribes to changes in the search text, filters, and sort state to reset pagination.
   */
  private _subscribeToTableFilters(): void {
    // Reset the pagination when the search text, filters, or sort state changes
    combineLatest([this.search$.pipe(debounceTime(300)), this.filters$.pipe(debounceTime(300)), this.sort$])
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.currentPageSubject.next(1);
      });
  }

  /**
   * Fetches the list of communications based on the current page, search text, filters, and sort state.
   */
  private _getCommunications(): void {
    this.currentPage$
      .pipe(
        filter((currentPage) => currentPage > 0),
        withLatestFrom(this.search$, this.filters$, this.sort$),
        switchMap(([currentPage, searchText, filters, sort]) => {
          const options = this._createFilterOptions(searchText, filters, sort);

          return this._communicationService.getCommunications$(options, currentPage, this.pageSize);
        }),
        map(({ data = [], totalRecords, pageNumber, success }: PaginationResponse<Communication>) => {
          this.tableConfig.pagination.totalItems = totalRecords;

          // Clear any displayed records when fetching the first page or if there is an error
          if (pageNumber === 1 || !success) {
            this.communicationsSubject.next([]);
          }

          return data.map((communication) => new CommunicationListingVm(communication));
        }),
        withLatestFrom(this.communications$),
        untilDestroyed(this),
      )
      .subscribe(([nextCommunications, allCommunications]) => {
        // Append the next page of communications to the list
        this.communicationsSubject.next([...allCommunications, ...nextCommunications]);
      });
  }

  /**
   * Creates filter options based on the search text and selected filters.
   * @param searchText The search text to filter by.
   * @param filters The selected filters.
   * @param sort The Custom Sort Function
   * @returns The filter options.
   */
  private _createFilterOptions(
    searchText: string,
    filters: PolarisChipListItem<number>[],
    sort: Sort,
  ): CommunicationListingOptions {
    const options: CommunicationListingOptions = new CommunicationListingOptions({
      groupIds: [],
      productLineCodes: [],
      searchString: searchText,
    });

    for (const selectedFilter of filters) {
      // Disable lint rule for switch block since we want to rely on case fallthrough otherwise we would need to duplicate the logic for each case
      /* eslint-disable no-case-declarations */
      switch (selectedFilter.id) {
        case CommunicationListingFilter.Active.toString():
          options.statusId = selectedFilter.value as number;
          break;
        case CommunicationListingFilter.ORV.toString():
        case CommunicationListingFilter.Snow.toString():
        case CommunicationListingFilter.OnRoad.toString():
        case CommunicationListingFilter.Marine.toString():
        case CommunicationListingFilter.WorkAndTransport.toString():
          // Decode comma-separated product line codes into an array
          const productLineCodes = (selectedFilter.value as string).split(',');
          options.productLineCodes.push(...productLineCodes);
          break;
        case CommunicationListingFilter.Alerts.toString():
        case CommunicationListingFilter.Programs.toString():
        case CommunicationListingFilter.PolarisConnect.toString():
          options.groupIds.push(selectedFilter.value as number);
          break;
        case CommunicationListingFilter.MyCommunications.toString():
          options.myCommunication = true;
          break;
      }
      /* eslint-enable no-case-declarations */
    }

    // Set the sort options if a sortable column is selected
    if (sort.direction) {
      if (this._sortableColumns.has(sort.active as CommunicationListingColumn)) {
        options.sortBy = sort.active;
      }
      options.sortDirection = sort.direction;
    }

    return options;
  }

  /**
   * Navigates to the add communication page.
   */
  public onAddCommunication(): void {
    this._router.navigate([Route.CommunicationAdd]);
  }

  /**
   * Navigates to the edit communication page.
   * @param communicationGuid The ID of the communication to edit.
   */
  public onEditCommunication(communicationGuid: string): void {
    this._router.navigate([Route.CommunicationEdit, communicationGuid]);
  }

  /**
   * Navigates to the edit translation page for the communication.
   * @param communicationGuid The ID of the communication to edit.
   * @param cultureCode The culture code of the translation to edit.
   */
  public onEditCommunicationTranslation(communicationGuid: string, cultureCode: string): void {
    this._router.navigate([Route.CommunicationEdit, communicationGuid, CommunicationAddEditStep.Translation], {
      queryParams: { cultureCode },
    });
  }

  /**
   * Opens the help dialog.
   */
  public openHelpDialog(): void {
    this._dialogService
      .open(StandardDialogComponent, {
        minWidth: '50dvh',
        maxWidth: '95dvh',
        data: {
          title: `dialog.communication-admin-listing-help.title`,
          htmlMessage: `dialog.communication-admin-listing-help.message`,
          primaryButtonLabel: 'close',
        },
      })
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  public openDeleteDialog(item: CommunicationListingVm): void {
    this._dialogService
      .open(StandardDialogComponent, {
        minWidth: '25dvh',
        maxWidth: '50dvh',
        data: {
          title: 'dialog.confirm-delete-draft.title',
          message: 'dialog.confirm-delete-draft.message',
          primaryButtonLabel: 'delete',
          secondaryButtonLabel: 'cancel',
        },
      })
      .pipe(
        untilDestroyed(this),
        filter((dialogResult: boolean) => dialogResult),
        switchMap(() =>
          this._lookUpService.getStatusByName$(CommunicationStatusType.Deleted).pipe(
            map((deletedStatus: CommunicationStatus | undefined) => {
              if (!deletedStatus) {
                throw new Error('Status ID not found.');
              }

              return deletedStatus.statusId;
            }),
          ),
        ),
        switchMap((deletedStatusId: number) =>
          this._communicationService.updateStatus$(
            new Communication({ communicationGuid: item.communicationGuid }),
            deletedStatusId,
          ),
        ),
        tap((success: boolean) => {
          if (success) {
            this._polarisNotificationService.success(this._translate.instant('notification.delete.success'));
            this._getCommunications();
          } else {
            this._polarisNotificationService.danger(this._translate.instant('notification.delete.failed'));
          }
        }),
        catchError(() => {
          this._polarisNotificationService.danger(this._translate.instant('notification.delete.failed'));

          return [];
        }),
      )
      .subscribe();
  }

  /**
   * Updates the search text.
   * @param searchText The new search text.
   */
  public onSearch(searchText: string): void {
    this.searchSubject.next(searchText);
  }

  /**
   * Updates the sort state.
   * @param sort The new sort state.
   */
  public onSort(sort: Sort): void {
    this.sortSubject.next(sort);
  }

  /**
   * Updates the filters based on the selected chip.
   * @param changedFilter The chip that was selected or deselected.
   */
  public onChangeFilter(changedFilter: PolarisChipListItem<number>): void {
    let updatedFilters: PolarisChipListItem<number>[];
    if (changedFilter.selected) {
      updatedFilters = [...this.filtersSubject.getValue(), changedFilter];
    } else {
      updatedFilters = this.filtersSubject
        .getValue()
        .filter((selectedFilter) => selectedFilter.id !== changedFilter.id);
    }
    this.filtersSubject.next(updatedFilters);
  }

  /**
   * Loads more items for pagination.
   */
  public onLoadMore(): void {
    this.currentPageSubject.next(this.currentPageSubject.getValue() + 1);
  }
}
