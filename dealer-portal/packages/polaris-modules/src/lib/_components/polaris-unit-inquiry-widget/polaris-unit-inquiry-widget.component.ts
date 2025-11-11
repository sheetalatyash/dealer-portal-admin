import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  Inject,
  OnInit,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisAlignment, PolarisAlignmentEnum, PolarisButton, PolarisHref, PolarisSearchBar, PolarisTable, PolarisTableColumnConfig, PolarisTableConfig, PolarisTableCustomCellDirective, PolarisTableTheme } from '@dealer-portal/polaris-ui';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PolarisBaseWidgetComponent } from '../polaris-base-widget/polaris-base-widget.component';
import { Observable, of } from 'rxjs';
import { Environment, ENVIRONMENT_CONFIG } from '@dealer-portal/polaris-core';
import { toSignal } from '@angular/core/rxjs-interop';

// TODO: This data model is temporary and should be replaced with the actual data model from the API.
export interface UnitInquiryRecord {
  vehicleIdentificationNumber: string;
  description: string;
  modelNumber: string;
}

@Component({
  selector: 'polaris-unit-inquiry-widget',
  imports: [
    CommonModule,
    TranslatePipe,
    PolarisBaseWidgetComponent,
    PolarisButton,
    PolarisSearchBar,
    PolarisTable,
    PolarisHref,
    PolarisTableCustomCellDirective
  ],
  templateUrl: './polaris-unit-inquiry-widget.component.html',
  styleUrl: './polaris-unit-inquiry-widget.component.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class PolarisUnitInquiryWidgetComponent implements OnInit {
  public readonly unitInquirySearchUrl: string;
  public readonly tableTheme: typeof PolarisTableTheme = PolarisTableTheme;

  private readonly pageSize: number = 5;

  // Source comes from an Observable → converted to Signal
  private readonly unitInquiries$: Observable<UnitInquiryRecord[]> = this.getUnitInquiries();
  private readonly unitInquiriesSignal: Signal<UnitInquiryRecord[] | undefined> = toSignal(this.unitInquiries$, { initialValue: [] });

  private readonly currentPageSignal: WritableSignal<number> = signal<number>(0);

  public readonly displayedUnitInquiries: Signal<UnitInquiryRecord[]> = computed((): UnitInquiryRecord[] => {
    const allUnitInquiries: UnitInquiryRecord[] = this.unitInquiriesSignal() ?? [];
    const currentPage: number = this.currentPageSignal();
    const endIndex: number = (currentPage + 1) * this.pageSize;
    return allUnitInquiries.slice(0, endIndex);
  });

  public tableConfiguration!: PolarisTableConfig<UnitInquiryRecord>;

  constructor(
    @Inject(ENVIRONMENT_CONFIG) private readonly environment: Environment,
    private readonly translateService: TranslateService
  ) {
    if (!environment.endpoints?.["legacyPortalUrl"]?.baseUrl) {
      throw new Error('No legacy portal URL found in environment.');
    }
    const legacyPortalUrl: string = environment.endpoints["legacyPortalUrl"].baseUrl;
    this.unitInquirySearchUrl = `${legacyPortalUrl}servwarr/UnitInquiry/Main.asp?Tab=ALL&VIN=`;
  }

  public ngOnInit(): void {
    this.initializeTableConfiguration();
  }

  public onLoadMore(): void {
    const totalItems: number = (this.unitInquiriesSignal() ?? []).length;
    if ((this.currentPageSignal() + 1) * this.pageSize < totalItems) {
      this.currentPageSignal.update((previousPage: number): number => previousPage + 1);
    }
  }

  public onVehicleIdentificationNumberClicked(vehicleIdentificationNumber: string): void {
    if (vehicleIdentificationNumber) {
      window.location.href = `${this.unitInquirySearchUrl}${vehicleIdentificationNumber}`;
    }
  }

  public onSearchSubmit(searchText: string): void {
    if (searchText) {
      window.location.href = `${this.unitInquirySearchUrl}${searchText}`;
    }
  }

  private initializeTableConfiguration(): void {
    const columns: PolarisTableColumnConfig<UnitInquiryRecord>[] = [
      this._createColumnConfiguration('table.col.vin', 'vehicleIdentificationNumber', PolarisAlignmentEnum.Start, PolarisAlignmentEnum.Start),
      this._createColumnConfiguration('table.col.model', 'modelNumber', PolarisAlignmentEnum.End, PolarisAlignmentEnum.End),
    ];

    this.tableConfiguration = new PolarisTableConfig<UnitInquiryRecord>({
      columns,
      pagination: {
        uiTestId: 'generic-table-pagination',
        totalItems: (this.unitInquiriesSignal() ?? []).length,
      }
    });
  }

  private _createColumnConfiguration(
    translationKey: string,
    propertyKey: keyof UnitInquiryRecord,
    headerAlignment: PolarisAlignment,
    contentAlignment: PolarisAlignment
  ): PolarisTableColumnConfig<UnitInquiryRecord> {
    return new PolarisTableColumnConfig<UnitInquiryRecord>({
      label: this.translateService.instant(translationKey),
      id: propertyKey as string,
      key: propertyKey,
      alignHeader: headerAlignment,
      alignContent: contentAlignment,
      sortable: false
    });
  }

  /**
   * Stubbed observable method that simulates API return.
   * Replace with HttpClient.get<UnitInquiryRecord[]>(...) later.
   */
  private getUnitInquiries(): Observable<UnitInquiryRecord[]> {
    return of<UnitInquiryRecord[]>([]);
  }
}
