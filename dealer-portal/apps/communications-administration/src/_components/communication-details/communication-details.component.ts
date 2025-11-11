import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PolarisDivider,
  PolarisExpansionPanel,
  PolarisGroupOption,
  PolarisIcon,
  PolarisIconButton,
} from '@dealer-portal/polaris-ui';
import { TranslatePipe } from '@ngx-translate/core';
import { Params, Router } from '@angular/router';
import { CommunicationAddEditStep } from '@enums/communication-add-edit-step.enum';
import {
  CommunicationStatusType,
  CoreService,
  CoreData,
  CommunicationStatus,
  Communication,
  CommunicationAccountSummary,
  CommunicationCode,
  CommunicationMessage,
  DatetimeService,
  PartnerType,
} from '@dealer-portal/polaris-core';
import { CommunicationTranslation } from '@classes/communication-translation.class';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Route } from '@enums/route.enum';
import { LookupService } from '@services/lookup/lookup.service';
import { CommunicationsService } from '@services/communications/communications.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { LabeledRowComponent } from '../labeled-row/labeled-row.component';
import { TimezoneService } from '@services/timezone/timezone.service';

@UntilDestroy()
@Component({
  selector: 'ca-communication-details',
  imports: [
    CommonModule,
    PolarisExpansionPanel,
    TranslatePipe,
    PolarisIconButton,
    PolarisIcon,
    PolarisDivider,
    LabeledRowComponent,
  ],
  templateUrl: './communication-details.component.html',
  styleUrl: './communication-details.component.scss',
})
export class CommunicationDetailsComponent implements OnInit, OnChanges {
  @Input() communication?: Communication;
  @Input() showDeleteTranslation: boolean = false;
  @Input() disableFormControls: boolean = false;

  @Output() deleteTranslation: EventEmitter<CommunicationTranslation> = new EventEmitter<CommunicationTranslation>();

  public coreData: CoreData = new CoreData();
  public allStatuses: CommunicationStatus[] = [];
  public displayedStatuses: PolarisGroupOption<number>[] = [];

  // Display Communication Summary
  public communicationSummary?: CommunicationAccountSummary;

  // Displayed Message
  public displayedStartDate: string = '';
  public displayedEndDate: string = '';
  public displayedTimezone: string = '';

  // Displayed Account Targets
  public displayedPartnerTypes: string[] = [];
  public displayedProductLines: string[] = [];
  public displayedCustomerClasses: string[] = [];
  public displayedCountries: string[] = [];
  public displayedStatesOrProvinces: string[] = [];

  // Displayed User Targets
  public displayedDepartments: string[] = [];
  public displayedStaffRoles: string[] = [];
  public displayedServiceStaffRoles: string[] = [];

  // Displayed Translations
  public displayedTranslations: CommunicationTranslation[] = [];

  public isAnyUserTargetSelected: boolean = false;

  constructor(
    private _coreService: CoreService,
    private _datetimeService: DatetimeService,
    private _lookupService: LookupService,
    private _communicationService: CommunicationsService,
    private _timezoneService: TimezoneService,
    private _router: Router,
  ) {}

  public ngOnInit(): void {
    this._updateDisplayedTimestamps();
    this._getCoreData();
    this._getCommunicationData();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (!changes['communication'].firstChange) {
      this._updateDisplayedTranslations();
    }
  }

  public _updateDisplayedTimestamps(): void {
    if (this.communication && this.communication.startDate && this.communication.endDate) {
      const [startDate, startTime, startTimeZoneOffset] = this._datetimeService.getDatetimeComponents(
        this.communication.startDate,
      );
      const [endDate, endTime] = this._datetimeService.getDatetimeComponents(this.communication.endDate);
      const timezone: string = this._timezoneService.getTimezoneByOffset(startTimeZoneOffset)?.label ?? '';

      this.displayedStartDate = `${startDate.toLocaleDateString()} ${startTime.hours}:${startTime.minutes
        .toString()
        .padStart(2, '0')} ${startTime.period}`;
      this.displayedEndDate = `${endDate.toLocaleDateString()} ${endTime.hours}:${endTime.minutes
        .toString()
        .padStart(2, '0')} ${endTime.period}`;
      this.displayedTimezone = timezone;
    }
  }

  public getCommunicationStatus() {
    const option = this.displayedStatuses.find((status: PolarisGroupOption<number>) => status.selected);
    const status: keyof typeof CommunicationStatusType =
      (option?.label as keyof typeof CommunicationStatusType) ?? CommunicationStatusType.Draft;

    return status;
  }

  private _getCommunicationData(): void {
    forkJoin([
      this._communicationService.getCommunicationAccountSummary$(this.communication?.communicationGuid ?? ''),
      this._lookupService.getStatuses$(),
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([communicationSummary, statuses]) => {
        this.allStatuses = statuses;
        this.communicationSummary = communicationSummary;

        this.displayedStatuses = statuses.map(
          (status: CommunicationStatus) =>
            new PolarisGroupOption({
              value: status.statusId,
              label: status.name,
              selected: this.communication?.statusId === status.statusId,
              disabled: status.name !== CommunicationStatusType.Draft,
            }),
        );
      });
  }

  private _getCoreData(): void {
    this._coreService
      .getCoreData$({
        countries: true,
        customerClasses: true,
        departments: true,
        languages: true,
        partnerTypes: true,
        productLineByFamily: true,
        serviceStaffRoles: true,
        staffRoles: true,
        stateAndProvinces: true,
      })
      .pipe(untilDestroyed(this))
      .subscribe((coreData) => {
        this.coreData = coreData;

        this._updateDisplayedAccountTargets();
        this._updateDisplayedUserTargets();
        this._updateDisplayedTranslations();
      });
  }

  private _updateDisplayedAccountTargets(): void {
    this.displayedPartnerTypes =
      this.communication?.partnerTypes?.map(
        (partnerTypeEntity: CommunicationCode) =>
          this.coreData.partnerTypes.find((partnerType: PartnerType) => partnerType.id === partnerTypeEntity.code)
            ?.name ?? '',
      ) ?? [];

    const productLineDetails = new Map<string, { family: string; description: string }>();
    const productFamilyToSelectedProductLines = new Map<string, string[]>();

    // Create an lookup by product line code for product line details
    for (const productLineFamily of this.coreData.productLinesByFamily) {
      productFamilyToSelectedProductLines.set(productLineFamily.productFamily ?? '', []);
      for (const productLine of productLineFamily.productLines) {
        productLineDetails.set(productLine.name ?? '', {
          family: productLineFamily.productFamily ?? '',
          description: productLine.description ?? '',
        });
      }
    }

    // Populate each product family with the selected product lines
    this.communication?.productLines?.forEach((productLineEntity: CommunicationCode) => {
      const productLineDetail = productLineDetails.get(productLineEntity.code);
      if (productLineDetail) {
        productFamilyToSelectedProductLines.get(productLineDetail.family)?.push(productLineDetail.description);
      }
    });

    // Convert the grouped product lines map to a simple 2D array of non-empty list of product lines per family
    this.displayedProductLines = Array.from(productFamilyToSelectedProductLines.values()).flat();

    this.displayedCustomerClasses =
      this.communication?.custClasses?.map(
        (customerClassEntity: CommunicationCode) =>
          this.coreData.customerClasses.find((customerClass) => customerClass.id === customerClassEntity.code)?.name ??
          '',
      ) ?? [];

    this.displayedCountries =
      this.communication?.countries?.map(
        (countryEntity: CommunicationCode) =>
          this.coreData.countries.find((country) => country.code === countryEntity.code)?.name ?? '',
      ) ?? [];

    this.displayedStatesOrProvinces =
      this.communication?.stateOrProvinces?.map(
        (stateOrProvinceEntity: CommunicationCode) =>
          this.coreData.stateProvinces.find((stateOrProvince) => stateOrProvince.code === stateOrProvinceEntity.code)
            ?.name ?? '',
      ) ?? [];

    // TODO: Integrate by specific accounts
  }

  private _updateDisplayedUserTargets(): void {
    this.displayedDepartments =
      this.communication?.departments?.map(
        (departmentEntity: CommunicationCode) =>
          this.coreData.departments.find((department) => department.id === departmentEntity.code)?.name ?? '',
      ) ?? [];

    this.displayedStaffRoles =
      this.communication?.roles?.map(
        (staffRoleEntity: CommunicationCode) =>
          this.coreData.staffRoles.find((staffRole) => staffRole.id === staffRoleEntity.code)?.name ?? '',
      ) ?? [];

    this.displayedServiceStaffRoles =
      this.communication?.serviceStaffRoles?.map(
        (serviceStaffRoleEntity: CommunicationCode) =>
          this.coreData.serviceStaffRoles.find(
            (serviceStaffRole) => serviceStaffRole.id === serviceStaffRoleEntity.code,
          )?.name ?? '',
      ) ?? [];

    this.isAnyUserTargetSelected =
      this.displayedDepartments.length > 0 ||
      this.displayedStaffRoles.length > 0 ||
      this.displayedServiceStaffRoles.length > 0;

    // TODO: Integrate security/app permissions

    // TODO: Integrate by specific accounts
  }

  private _updateDisplayedTranslations(): void {
    // Display all translations except the default one and add their language name
    this.displayedTranslations =
      this.communication?.messages
        ?.filter(
          (message: CommunicationMessage) => message.cultureCode !== this.communication?.defaultMessage?.cultureCode,
        )
        .map(
          (message: CommunicationMessage) =>
            new CommunicationTranslation(
              message,
              this.coreData.languages.find((language) => language.cultureCode === message.cultureCode),
            ),
        ) ?? [];
  }

  private _navigateToStep(step: CommunicationAddEditStep, queryParams?: Params): void {
    this._router.navigate([Route.CommunicationEdit, this.communication?.communicationGuid, step], { queryParams });
  }

  public onEditMessage(event: MouseEvent): void {
    event.stopPropagation();
    this._navigateToStep(CommunicationAddEditStep.Message);
  }

  public onEditAccountTargets(event: MouseEvent): void {
    event.stopPropagation();
    this._navigateToStep(CommunicationAddEditStep.AccountTargets);
  }

  public onEditUserTargets(event: MouseEvent): void {
    event.stopPropagation();
    this._navigateToStep(CommunicationAddEditStep.UserTargets);
  }

  public onEditTranslation(event: MouseEvent, translation: CommunicationTranslation): void {
    event.stopPropagation();
    this._navigateToStep(CommunicationAddEditStep.Translation, { cultureCode: translation.cultureCode });
  }

  public onDeleteTranslation(event: MouseEvent, translation: CommunicationTranslation): void {
    event.stopPropagation();
    this.deleteTranslation.emit(translation);
  }
}
