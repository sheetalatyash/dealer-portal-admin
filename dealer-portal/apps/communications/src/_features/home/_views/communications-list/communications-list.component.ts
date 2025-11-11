import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunicationsService, LookupService } from '@services';
import { Router } from '@angular/router';
import { CommunicationListItemComponent } from '../../_components/communication-list-item/communication-list-item.component';
import {
  PolarisButton,
  PolarisDialogService,
  PolarisHref,
  PolarisIcon,
  PolarisIconButton,
  PolarisLoader,
  PolarisNavigationTab,
  PolarisNotificationService,
  PolarisSearchBar,
  PolarisTabBar,
} from '@dealer-portal/polaris-ui';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CommunicationListTab } from '@enums';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ResourceService,
  CommunicationListingOptions,
  PaginationResponse,
  UserAccountService,
  ENVIRONMENT_CONFIG,
  Environment,
  CommunicationGroup,
  CommunicationType,
  Communication,
} from '@dealer-portal/polaris-core';
import { selectedCommunicationGuidSubject } from '@dealer-portal/polaris-modules';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { debounceTime, switchMap, combineLatest, filter, withLatestFrom, tap } from 'rxjs';
import { PolarisLoaderSize } from 'packages/polaris-ui/src/lib/polaris-loader/polaris-loader-enum';
import { StandardDialogComponent } from '../../_components/standard-dialog/standard-dialog.component';

@UntilDestroy()
@Component({
  selector: 'comm-communications-list',
  standalone: true,
  imports: [
    CommonModule,
    CommunicationListItemComponent,
    MatCheckboxModule,
    MatMenuModule,
    PolarisIconButton,
    MatFormFieldModule,
    MatInputModule,
    PolarisButton,
    PolarisSearchBar,
    PolarisLoader,
    PolarisHref,
    MatTabsModule,
    PolarisTabBar,
    PolarisIcon,
    TranslatePipe
  ],
  templateUrl: './communications-list.component.html',
  styleUrl: './communications-list.component.scss',
})
export class CommunicationsListComponent implements OnInit {
  displayedCommunications: Communication[] = [];
  selectedCommunications: Set<Communication> = new Set();

  /**
   * Subject for managing filters.
   */
  public filtersSubject: BehaviorSubject<CommunicationListingOptions> = new BehaviorSubject<CommunicationListingOptions>(new CommunicationListingOptions({
    cultureCode: this._resourceService.getCultureCode(),
    isArchive: false,
    sortByStartDateDescending: true
  }));

  public loadPastCommunications = false;
  /**
   * Indicates whether the search bar is currently selected or active.
   */
  public searchSelected: boolean = false;

  /**
   * Loader for the communications list.
   */
  public isLoading: boolean = true;

  /**
   * Observable for the filters
   */
  public filters$: Observable<CommunicationListingOptions> = this.filtersSubject.asObservable();

  /**
   * property for indicating if logged-in user is impersonating.
   */
  public get isImpersonating(): boolean {
    return this._userAccountService.userAccount.isImpersonating ?? false;
  }

  /**
   * property for indicating if logged-in user is internal User.
   */
  public get isInternalUser(): boolean {
    return this._userAccountService.userAccount.isInternalUser === 'true';
  }

  /**
   * Subject for managing search text.
   */
  public searchSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  /**
   * Observable for the search text.
   */
  public search$: Observable<string> = this.searchSubject.asObservable();

  /**
   * Subject for managing the current page of pagination.
   */
  public currentPageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  /**
   * Observable for the current page of pagination.
   */
  public currentPage$: Observable<number> = this.currentPageSubject.asObservable();

  public loaderSize: PolarisLoaderSize = PolarisLoaderSize.Sm;
  public showPanel: boolean = true;
  public sortByDateDescending: boolean = true;
  public redirectUrl: string = '';

  public dateFormat: string = this._translate.instant('date-format');

  public communicationFilter: CommunicationListTab = CommunicationListTab.All;
  public communicationListTab = CommunicationListTab;

  public pageSize: number = 50;
  public totalFilteredRecords: number = 0; 
  public groups: CommunicationGroup[] = [];

  public get noDataIcon(): string {
    if (!this.isLoading && this.searchSubject.getValue() !== '') {
      return 'search';
    }

    return this.tabsNoDataInfo.find((item) => item.code === this.communicationFilter)?.noDataIcon ?? '';
  }

  public get noDataMessage(): string {
    if (!this.isLoading && this.searchSubject.getValue() !== '') {
      return 'table.no-results-search';
    }

    return this.tabsNoDataInfo.find((item) => item.code === this.communicationFilter)?.noDataMessage ?? '';
  }

  public get viewPastCommunicationsTranslationKey(): string {
    return this.communicationFilter === CommunicationListTab.Alerts ? (this.loadPastCommunications ? 'table.paging.view-alert' : 'table.paging.view-past-alert') : (this.loadPastCommunications ? 'table.paging.view-program' : 'table.paging.view-past-program')
  }

  public tabs: PolarisNavigationTab[] = [
    {
      label: this._translate.instant('all-active'),
      code: CommunicationListTab.All,
      id: 'communications-all-tab',
      selected: true
    },
    {
      label: this._translate.instant('table.tab.programs'),
      code: CommunicationListTab.Programs,
      id: 'communications-programs-tab',
      selected: false
    },
    {
      label: this._translate.instant('table.tab.alerts'),
      code: CommunicationListTab.Alerts,
      id: 'communications-alerts-tab',
      selected: false
    },
    {
      label: this._translate.instant('table.tab.communications'),
      code: CommunicationListTab.Communications,
      id: 'communications-communications-tab',
      selected: false
    },
    {
      label: this._translate.instant('table.tab.favorites'),
      code: CommunicationListTab.Favorites,
      id: 'communications-favorites-tab',
      selected: false
    },
    {
      label: this._translate.instant('table.tab.archive'),
      code: CommunicationListTab.Archive,
      id: 'communications-archive-tab',
      selected: false
    },
  ];

  public tabsNoDataInfo = [
    {
      code: CommunicationListTab.All,
      noDataIcon: 'no-comm',
      noDataMessage: 'table.no-results'
    },
    {
      code: CommunicationListTab.Communications,
      noDataIcon: 'no-comm',
      noDataMessage: 'table.no-results'
    },
    {
      code: CommunicationListTab.Alerts,
      noDataIcon: 'no-alert',
      noDataMessage: 'table.no-results-alert'
    },
    {
      code: CommunicationListTab.Programs,
      noDataIcon: 'no-program',
      noDataMessage: 'table.no-results-program'
    },
    {
      code: CommunicationListTab.Favorites,
      noDataIcon: 'no-favorite',
      noDataMessage: 'table.no-results-favorite'
    },
    {
      code: CommunicationListTab.Archive,
      noDataIcon: 'no-archive',
      noDataMessage: 'table.no-results-archive'
    },
  ];

  public selectActions = [
    {
      label: this._translate.instant('all'),
      name: 'All',
      action: () => {
        this.displayedCommunications.forEach((comm) => this.selectedCommunications.add(comm));
      },
    },
    {
      label: this._translate.instant('none'),
      name: 'None',
      action: () => {
        this.selectedCommunications.clear();
      },
    },
    {
      label: this._translate.instant('read'),
      name: 'Read',
      action: () => {
        this.displayedCommunications
          .filter((comm) => comm.isRead)
          .forEach((comm) => this.selectedCommunications.add(comm));
      },
    },
    {
      label: this._translate.instant('starred'),
      name: 'Starred',
      action: () => {
        this.displayedCommunications
          .filter((comm) => comm.isFavorite)
          .forEach((comm) => this.selectedCommunications.add(comm));
      },
    },
    {
      label: this._translate.instant('unstarred'),
      name: 'Unstarred',
      action: () => {
        this.displayedCommunications
          .filter((comm) => !comm.isFavorite)
          .forEach((comm) => this.selectedCommunications.add(comm));
      },
    },
  ];

  public selectedCommunicationsActions = [
    {
      label: this._translate.instant('mark-unread'),
      name: 'Mark Unread',
      icon: 'mail-unread',
      display: true,
      isDisabled: this.isImpersonating,
      action: () => this.onMarkUnreadSelections(),
    },
    {
      label: this._translate.instant('mark-read'),
      name: 'Mark Read',
      icon: 'mail-read',
      isDisabled: this.isImpersonating,
      display: true,
      action: () => this.onMarkReadSelections(),
    },
    {
      label: this._translate.instant('archive'),
      name: 'Archive',
      icon: 'archive',
      display: true,
      isDisabled: this.isImpersonating,
      action: () => this.onArchiveSelections(),
    },
    {
      label: this._translate.instant('unarchive'),
      name: 'Unarchive',
      icon: 'undo-archive',
      isDisabled: this.isImpersonating,
      display: false,
      action: () => this.onUnarchiveSelections(),
    },
  ];

  constructor(
    private _commService: CommunicationsService,
    private _polarisNotificationService: PolarisNotificationService,
    private _router: Router,
    private _userAccountService: UserAccountService,
    private _lookUpService: LookupService,
    private _resourceService: ResourceService,
    private _dialogService: PolarisDialogService,
    private _translate: TranslateService,
    @Inject(ENVIRONMENT_CONFIG) environment: Environment,
  ) {
    const baseUrl: string = environment.endpoints['dealerPortalApiUrl'].baseUrl;
    this.redirectUrl = `${baseUrl}${_resourceService.getCultureCode()}/internal/dealer-platform/dealer-management/account-search/`;
  }

  public ngOnInit(): void {
    this.selectedCommunicationsActions.forEach(selectedCommunicationsAction => selectedCommunicationsAction.isDisabled = this.isImpersonating);

    this._getGroups();
    this._subscribeToTableFilters();

    this._getCommunications();
  }

  /**
   * Fetches all the groups.
   */
  private _getGroups(): void {
    this._lookUpService.getGroups$()
      .pipe(
        tap((groups: CommunicationGroup[]): void => {
          this.groups = groups;
        }),
        tap(() => {
          const selectedTab: number | undefined = this._commService.getSelectedTab();

          this._restoreSelectedTab(selectedTab);
        }),
        untilDestroyed(this)
    ).subscribe();
  }

  /**
   * Restores the selected tab based on the provided tab code.
   * @param selectedTabCode The code of the tab to restore.
   */
  private _restoreSelectedTab(selectedTabCode: number | undefined): void {
    if (selectedTabCode) {
      this.communicationFilter = selectedTabCode;
      this._createFilterOptions();
      this.tabs.forEach((tab: PolarisNavigationTab) => tab.selected = false);
      const selectedTab: PolarisNavigationTab | undefined = this.tabs.find((tab: PolarisNavigationTab) => tab.code === selectedTabCode);
      if (selectedTab) selectedTab.selected = true;
    }
  }

  /**
   * Fetches all communications and updates the displayed communications.
   */
  public _getCommunications(): void {
    this.currentPage$
      .pipe(
        debounceTime(300),
        untilDestroyed(this),
        filter((currentPage) => currentPage > 0),
        withLatestFrom(this.filters$, this.search$),
        switchMap(([currentPage, filters, search]) => {

          if (this.searchSelected) {
            const filterOptions: CommunicationListingOptions = new CommunicationListingOptions({
              cultureCode: this._resourceService.getCultureCode(),
              isArchive: undefined,
              sortByStartDateDescending: this.sortByDateDescending,
              groupIds: [],
              searchString: search,
            });

            return this._commService.getCommunicationsSearch$(filterOptions, currentPage, this.pageSize)
          }

          return this._commService.getCommunications$(filters, currentPage, this.pageSize)
        })
      )
      .subscribe((paginationResponse: PaginationResponse<Communication>) => {
        this.isLoading = false;
        this.totalFilteredRecords = paginationResponse.totalRecords;
        if (this.currentPageSubject.getValue() === 1) {
          this.displayedCommunications = paginationResponse.data ?? [];
        }
        else
        {
          this.displayedCommunications = [...this.displayedCommunications, ...paginationResponse.data ?? []];
        }
        },
        () => this.isLoading = false);
  }

  /**
   * Subscribes to changes in the search text, filters, and sort state to reset pagination.
   */
  private _subscribeToTableFilters(): void {
    // Reset the pagination when the search text, filters, or sort state changes
    combineLatest([this.search$, this.filters$])
      .pipe(
        debounceTime(300),
        untilDestroyed(this))
      .subscribe(() => {

        this.currentPageSubject.next(1);
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
          title: `dialog.message-center-listing-help.title`,
          htmlMessage: `dialog.message-center-listing-help.message`,
          primaryButtonLabel: 'close',
        },
      })
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  /**
   * Filters, paginates, and sorts communications based on the current filter, page, and sort order.
   * @returns The filtered and sorted communications.
   */
  private _createFilterOptions(): void {
    // Default filter to all communications
    const filterOptions: CommunicationListingOptions = new CommunicationListingOptions({
      cultureCode: this._resourceService.getCultureCode(),
      isArchive: false,
      sortByStartDateDescending: this.sortByDateDescending,
      groupIds: []
    });

    switch (this.communicationFilter) {
      case CommunicationListTab.Alerts:
        filterOptions.groupIds?.push(this.groups.find(group => group.name === CommunicationType.Alert)?.groupId ?? 0);
        filterOptions.isArchive = this.loadPastCommunications ? undefined : filterOptions.isArchive;
        break;
      case CommunicationListTab.Communications:
        filterOptions.groupIds?.push(this.groups.find(group => group.name === CommunicationType.Communication)?.groupId ?? 0);
        break;
      case CommunicationListTab.Programs:
        filterOptions.groupIds?.push(this.groups.find(group => group.name === CommunicationType.Program)?.groupId ?? 0);
        filterOptions.isArchive = this.loadPastCommunications ? undefined : filterOptions.isArchive;
        break;
      case CommunicationListTab.Favorites:
        filterOptions.isFavorite = true;
        filterOptions.isArchive = undefined;
        break;
      case CommunicationListTab.Archive:
        filterOptions.isArchive = true;
        break;
    }

    this.filtersSubject.next(filterOptions);
  }

  /**
   * Updates the search text.
   * @param searchText The new search text.
   */
  public onSearch(searchText: string): void {
    this.isLoading = true;

    this.searchSelected = searchText !== '';

    this.searchSubject.next(searchText);
  }

  /**
   * Handles tab selection, updating the displayed communications, and actions.
   * @param tab The selected tab.
   */
  public onTabSelected(tab: PolarisNavigationTab): void {
    const isArchiveTab: boolean = tab.code === (CommunicationListTab.Archive as number);
    this.selectedCommunicationsActions.forEach((action) => {
      if (action.name === 'Archive') {
        action.display = !isArchiveTab;
      } else if (action.name === 'Unarchive') {
        action.display = isArchiveTab;
      }
    });

    this._commService.setSelectedTab(tab.code);
    this.communicationFilter = tab.code;
    this.selectedCommunications.clear();
    this.loadPastCommunications = false;
    this.isLoading = true;
    this._createFilterOptions();
  }

  /**
   * Sorts communications based on the specified order.
   * @param descending Whether to sort in descending order.
   */
  public onSortCommunications(descending: boolean): void {
    this.sortByDateDescending = descending;

    this.isLoading = true;
    this._createFilterOptions();
  }

  public onLoadPastCommunications() {
    this.loadPastCommunications = !this.loadPastCommunications;
    this._createFilterOptions();
  }

  /**
   * Navigates to the communication details page of the selected communication.
   * @param communication The selected communication.
   */
  public onCommunicationClicked(communication: Communication): void {
    selectedCommunicationGuidSubject.next(undefined);

    this._router.navigate(['/details', communication.communicationGuid]);
  }

  /**
   * Navigates to the account search page.
   */
  public redirectToAccountSearch(): void {
    this._router.navigate(['/internal/dealer-platform/dealer-management/account-search/']);
  }

  /**
   * Toggles the selection of a communication.
   * @param communication The communication to toggle.
   */
  public onCommunicationSelected(communication: Communication): void {
    if (this.selectedCommunications.has(communication)) {
      this.selectedCommunications.delete(communication);
    } else {
      this.selectedCommunications.add(communication);
    }
  }

  /**
   * Toggles the favorite status of a communication.
   * @param communication The communication to toggle.
   */
  public onToggleFavoriteCommunication(communication: Communication): void {
    if (this.isImpersonating) {
      return;
    }

    this._commService
      .setCommunicationFavorited$(communication.communicationGuid as string, !communication.isFavorite)
      .subscribe((success) => {
        if (success) {
          this._createFilterOptions();
        } else {
          this._polarisNotificationService.danger(this._translate.instant('notification.failed'), {
            actionText: this._translate.instant('notification.try-again'),
            onAction: () => this.onToggleFavoriteCommunication(communication),
          });
        }
      });
  }

  /**
   * Marks selected communications as read.
   */
  public onMarkReadSelections(): void {
    if (this.isImpersonating) {
      return;
    }

    const communicationIds: string[] = Array.from(this.selectedCommunications.values())
      .map((comm: Communication): string | undefined => comm.communicationGuid)
      .filter((guid: string | undefined): guid is string => typeof guid === 'string');

    this._commService.setCommunicationsRead$(communicationIds, true).subscribe((success) => {
      if (success) {
        // Update the communications and clear selections
        this._createFilterOptions();
        this.selectedCommunications.clear();
      } else {
        this._polarisNotificationService.danger(this._translate.instant('notification.failed'), {
          actionText: this._translate.instant('notification.try-again'),
          onAction: () => this.onMarkReadSelections(),
        });
      }
    });
  }

  /**
   * Marks selected communications as unread.
   */
  public onMarkUnreadSelections(): void {
    if (this.isImpersonating) {
      return;
    }


    const communicationIds: string[] = Array.from(this.selectedCommunications.values())
      .map((comm: Communication): string | undefined => comm.communicationGuid)
      .filter((guid: string | undefined): guid is string => typeof guid === 'string');

    this._commService.setCommunicationsRead$(communicationIds, false).subscribe((success) => {
      if (success) {
        // Update the communications and clear selections
        this._createFilterOptions();
        this.selectedCommunications.clear();
      } else {
        this._polarisNotificationService.danger(this._translate.instant('notification.failed'), {
          actionText: this._translate.instant('notification.try-again'),
          onAction: () => this.onMarkUnreadSelections(),
        });
      }
    });
  }

  /**
   * Archives selected communications.
   */
  public onArchiveSelections(): void {
    if (this.isImpersonating) {
      return;
    }

    const communicationIds: string[] = Array.from(this.selectedCommunications.values())
      .map((comm: Communication): string | undefined => comm.communicationGuid)
      .filter((guid: string | undefined): guid is string => typeof guid === 'string');

    this._commService.setCommunicationsArchived$(communicationIds, true).subscribe((success) => {
      if (success) {
        // Update the communications and clear selections

        this.isLoading = true;
        this._createFilterOptions();
        this.selectedCommunications.clear();
      } else {
        this._polarisNotificationService.danger(this._translate.instant('notification.failed'), {
          actionText: this._translate.instant('notification.try-again'),
          onAction: () => this.onArchiveSelections(),
        });
      }
    });
  }

  /**
   * Unarchives selected communications.
   */
  public onUnarchiveSelections(): void {
    if (this.isImpersonating) {
      return;
    }

    const communicationIds: string[] = Array.from(this.selectedCommunications.values())
      .map((comm: Communication): string | undefined => comm.communicationGuid)
      .filter((guid: string | undefined): guid is string => typeof guid === 'string');

    this._commService.setCommunicationsArchived$(communicationIds, false).subscribe((success) => {
      if (success) {
        // Update the communications and clear selections
        this.isLoading = true;
        this._createFilterOptions();
        this.selectedCommunications.clear();
      } else {
        this._polarisNotificationService.danger(this._translate.instant('common.action-failed'), {
          actionText: this._translate.instant('common.try-again'),
          onAction: () => this.onUnarchiveSelections(),
        });
      }
    });
  }

  /**
   * Loads more communications for pagination.
   */
  public onLoadMore(): void {
    this.isLoading = true;
    this.currentPageSubject.next(this.currentPageSubject.getValue() + 1);
  }

  // Template Getters

  /**
   * Checks if there are any selected communications.
   * @returns True if there are selected communications, false otherwise.
   */
  public get hasSelectedItems(): boolean {
    return this.selectedCommunications.size > 0;
  }

  /**
   * Checks if some but not all displayed communications are selected.
   * @returns True if the selection is indeterminate, false otherwise.
   */
  public get isSelectionIndeterminate(): boolean {
    return this.hasSelectedItems && this.displayedCommunications.length !== this.selectedCommunications.size;
  }

  /**
   * Checks if all displayed communications are selected.
   * @returns True if all displayed communications are selected, false otherwise.
   */
  public get isSelectionChecked(): boolean {
    return this.hasSelectedItems && this.displayedCommunications.length === this.selectedCommunications.size;
  }

  /**
   * Checks if there are more records to load.
   * @returns True if there are more records, false otherwise.
   */
  public get hasMorePages(): boolean {
    return this.totalFilteredRecords > this.pageSize * this.currentPageSubject.getValue();
  }
}
