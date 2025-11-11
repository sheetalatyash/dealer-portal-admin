import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import {
  Communication,
  CommunicationProductLine,
  CommunicationType,
  CoreData,
  CoreService,
  KebabCasePipe,
  StartCasePipe,
  ProductLine,
  ProductLineByBusinessUnit,
  ResourceService,
} from '@dealer-portal/polaris-core';
import {
  PolarisBadge,
  PolarisBadgeColor,
  PolarisDivider,
  PolarisHeading,
  PolarisHref,
  PolarisIcon,
  PolarisLoader,
  PolarisNavigationTab,
  PolarisTabBar,
} from '@dealer-portal/polaris-ui';
import { Route } from '@enums';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommunicationsService } from '@services';
import { BehaviorSubject, filter, Observable, tap } from 'rxjs';
import { VideoThumbnailComponent } from '../video-thumbnail/video-thumbnail.component';

@UntilDestroy()
@Component({
  selector: 'comm-polaris-connect',
  providers: [CommunicationsService],
  imports: [
    CommonModule,
    TranslatePipe,
    PolarisHref,
    PolarisIcon,
    RouterLink,
    PolarisHeading,
    PolarisTabBar,
    PolarisBadge,
    PolarisDivider,
    PolarisLoader,
    VideoThumbnailComponent,
  ],
  templateUrl: './polaris-connect.component.html',
  styleUrl: './polaris-connect.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class PolarisConnectComponent implements OnInit {
  readonly Route: typeof Route = Route;
  readonly polarisBadgeColor: typeof PolarisBadgeColor = PolarisBadgeColor;
  public kebabCasePipe: KebabCasePipe = new KebabCasePipe();
  public startCasePipe: StartCasePipe = new StartCasePipe();
  public loading: boolean = true;

  public tabs: PolarisNavigationTab[] = [];

  private _communication: BehaviorSubject<Communication| null> = new BehaviorSubject<Communication | null>(null);
  public communication$: Observable<Communication | null> = this._communication.asObservable();

  private _videoCategoryTabs: BehaviorSubject<PolarisNavigationTab[] | null> = new BehaviorSubject<PolarisNavigationTab[] | null>(null);
  public videoCategoryTabs$: Observable<PolarisNavigationTab[] | null> = this._videoCategoryTabs.asObservable();

  private _productLines: BehaviorSubject<ProductLineByBusinessUnit[] | null> = new BehaviorSubject<ProductLineByBusinessUnit[] | null>(null);
  public productLines$: Observable<ProductLineByBusinessUnit[] | null> = this._productLines.asObservable();

  private _sideNavCategories: BehaviorSubject<PolarisNavigationTab[] | null> = new BehaviorSubject<PolarisNavigationTab[] | null>(null);
  public sideNavCategories$: Observable<PolarisNavigationTab[] | null> = this._sideNavCategories.asObservable();

  private _communicationVideos: BehaviorSubject<Communication[] | null> = new BehaviorSubject<Communication[] | null>(null);
  public communicationVideos$: Observable<Communication[] | null> = this._communicationVideos.asObservable();

  private _attachmentUrl: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public attachmentUrl$: Observable<string | null> = this._attachmentUrl.asObservable();

  public selectedVideoCategory: PolarisNavigationTab | null = null;

  constructor(
    private _translate: TranslateService,
    private _communicationService: CommunicationsService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _resourceService: ResourceService,
    private _coreService: CoreService,
  ) {
    this._subscribeToRoute();
  }

  public ngOnInit(): void {
    this._getProductLines();
    this._getCommunicationVideos();
  }

  private _subscribeToRoute(): void {
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      tap((): void => {
        const communicationGuid: string | null | undefined = this._activatedRoute.root.firstChild?.snapshot.paramMap.get('communicationGuid');
        if (communicationGuid && communicationGuid !== 'all') {
          this._getSingleCommunication(communicationGuid);
        }
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  private _getProductLines(): void {
    this._coreService.getCoreData$({
      productLineByBusinessUnit: true,
      productLineByFamily: true,
    }).pipe(
      tap((coreData: CoreData): void  => {
        this._productLines.next(coreData.productLinesByBusinessUnit);
        this.createTabs(coreData.productLinesByBusinessUnit);
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  private _getSingleCommunication(communicationGuid: string): void {
    const cultureCode: string = this._resourceService.getCultureCode();

    this._communicationService.getCommunication$(communicationGuid, cultureCode).pipe(
      tap((communication: Communication  | null): void => {
        this._communication.next(communication);
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  /**
   * Create Tabs via the product lines returned from polaris-core
   * @param {ProductLineByBusinessUnit[]} productLines
   */
  public createTabs(productLines: ProductLineByBusinessUnit[]): void {
    const tabs: PolarisNavigationTab[] = [
      new PolarisNavigationTab({
        label: this._translate.instant('widgets.polaris-connect.tabs.all'),
        id: 'all',
        selected: true,
      }),
    ];

    // Build the tabs
    productLines.forEach((productLine: ProductLineByBusinessUnit, index: number): void => {
      const id: string = this.kebabCasePipe.transform(productLine.salesBusinessUnit as string);
      const tab: PolarisNavigationTab = new PolarisNavigationTab({
        label: this.startCasePipe.transform(id),
        code: index + 1,
        id,
        testId: `polaris-connect-tab-${id}`,
      });
      if (tab.id === 'orv') { 
        tab.label = this._translate.instant('widgets.polaris-connect.tabs.off-road-vehicles');
      }
      else if (tab.id === 'snow') { // Snowmobile and Timbersled
        tab.label = this._translate.instant('widgets.polaris-connect.tabs.snowmobiles-and-timbersleds');
      }
      else if (tab.id === 'on-road') { // Indian and Slingshot
        tab.label = this._translate.instant('widgets.polaris-connect.tabs.indian-and-slingshot');
      }

      if (tab.id !== 'marine' && tab.id !== 'apex') { // Remove marine and apex
        tabs.push(tab);
      }
    });

    // Set the tabs
    this.selectedVideoCategory = tabs[0];
    this._videoCategoryTabs.next(tabs);

    // Set the side navigation categories
    this._sideNavCategories.next(tabs);
  }

  public openHelpDialog(): void {
    // stub
  }

  public changeVideoCategoryTab(updatedTab: PolarisNavigationTab): void {
    const currentTabs: PolarisNavigationTab[] = this._videoCategoryTabs.getValue() as PolarisNavigationTab[];

    // Deselect all tabs
    currentTabs.forEach((tab: PolarisNavigationTab): boolean => tab.selected = tab.id === updatedTab.id);

    // Trigger fade-out by clearing the selected category
    this.selectedVideoCategory = null;
    this._videoCategoryTabs.next(currentTabs);

    // Wait for fade-out to complete before updating
    setTimeout((): void => {
      updatedTab.selected = true;
      this.selectedVideoCategory = updatedTab;
      this._sideNavCategories.next(currentTabs);
    }, 200); // match the :leave animation duration
  }

  private _getCommunicationVideos(): void {
    const communicationPageSize: number = 999;

    this._communicationService.getCommunicationByGroup$([CommunicationType.Video], false, 1, communicationPageSize).pipe(
      tap((communications: Communication[]): void => {
        this._communicationVideos.next(communications);

        const communication: Communication | null = this._communication.getValue();

        if (communication) {
          this._getAttachmentUrl(communication?.communicationGuid);
        } else {
          this.loadVideo(communications[0].communicationGuid);
        }

      }),
      untilDestroyed(this),
    ).subscribe();
  }

  private _getAttachmentUrl(communicationGuid: string | undefined): void {
    this._attachmentUrl.next(null);
    this.loading = true;

    if (!communicationGuid) {
      this._router.navigate(['/polaris-connect', 'all']);
    }

    const communicationVideos: Communication[] = this._communicationVideos.getValue() as Communication[];
    const communicationVideo: Communication | undefined = communicationVideos.find((communication: Communication): boolean => {
      return communication.communicationGuid === communicationGuid;
    })

    this._attachmentUrl.next(communicationVideo?.videoLinks?.[0] ?? '-');
    this.loading = false;
  }

  public isNewCommunication(startDate: string | undefined): boolean {
    return this._communicationService.isNewCommunication(startDate);
  }

  /**
   * Find if any given video is currently a member of the active tab's category.
   * @param {CommunicationProductLine[]} communicationProductLines
   * @return {boolean}
   */
  public isSelectedCategory(communicationProductLines: CommunicationProductLine[]): boolean {
    const category: PolarisNavigationTab | null = this.selectedVideoCategory;
    if (!communicationProductLines.length || !category) {
      return false;
    }

    // get selected Tab's key
    const selectedKey = category.id;

    // Find the matching business unit for this tab's key
    const businessUnits: ProductLineByBusinessUnit[] = this._productLines.getValue() as ProductLineByBusinessUnit[];
    const businessUnit: ProductLineByBusinessUnit = businessUnits.find((unit: ProductLineByBusinessUnit): boolean => {
      return this.kebabCasePipe.transform(unit.salesBusinessUnit as string) === selectedKey;
    }) as ProductLineByBusinessUnit;

    if (!businessUnit) {
      return false;
    }

    // Build a lookup set of this tab’s product-line names (lowercased)
    const tabSet: Set<string> = new Set(businessUnit.productLines.map((unit: ProductLine): string => (unit.name as string).toLowerCase()));

    // If any video’s code is in that set, return true
    return communicationProductLines
      .some((productLine: CommunicationProductLine): boolean => {
        return tabSet.has((productLine.code).toLowerCase());
      });
  }

  public loadVideo(communicationGuid: string | undefined): void {
    if (communicationGuid) {
      this._router.navigate(['/polaris-connect', communicationGuid], {
        replaceUrl: true,
      }).then((): void => {
        this._communication.next(null);
        this._getSingleCommunication(communicationGuid);
        this._getAttachmentUrl(communicationGuid);
      })
    }
  }

  public isActiveCommunication(communicationGuid: string | undefined): boolean {
    const communication: Communication = this._communication.getValue() as Communication;

    return communicationGuid === communication?.communicationGuid;
  }
}
