import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Communication, Environment, ENVIRONMENT_CONFIG } from '@dealer-portal/polaris-core';
import { PolarisBadge, PolarisBadgeColor, PolarisHref, PolarisIcon } from '@dealer-portal/polaris-ui';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs';
import { PolarisBaseWidgetComponent } from '../polaris-base-widget/polaris-base-widget.component';

@Component({
  selector: 'polaris-communication-video-widget',
  imports: [
    CommonModule,
    PolarisBadge,
    PolarisHref,
    PolarisIcon,
    TranslatePipe,
    PolarisBaseWidgetComponent,
  ],
  templateUrl: './polaris-communication-video-widget.component.html',
  styleUrl: './polaris-communication-video-widget.component.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class PolarisCommunicationVideoWidgetComponent  {
  /**
   * The date format string used for displaying dates, translated using the TranslateService.
   */
  public dateFormat: string = this._translate.instant('date-format');

  /**
   * Input property that accepts an array of CommunicationVideo objects to be displayed in the widget.
   */
  @Input() communications: Communication[] = [];

  /**
   * Output event that emits when the view more button is clicked.
   */
  @Output() viewAllClicked: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Constructor for the PolarisCommunicationVideoWidgetComponent.
   *
   * @param _translate - The TranslateService used for internationalization.
   * @param _router - The Angular Router used for navigation.
   */
  constructor(
    @Inject(ENVIRONMENT_CONFIG) private readonly environment: Environment,
    private _translate: TranslateService,
  ) { }

  /**
   * Determines if a communication is new based on its start date.
   * A communication is considered new if its start date is within the last 7 days.
   *
   * @param startDateStr - The start date of the communication as a string.
   *                       If undefined or invalid, the function returns false.
   * @returns `true` if the communication is new, otherwise `false`.
   */
  public IsNewCommunication(startDateStr: string | undefined): boolean {
    if (!startDateStr) {
      return false;
    }

    const now: Date = new Date();
    const startDate: Date = new Date(startDateStr);

    if (isNaN(startDate.getTime())) {
      return false; // Invalid date
    }

    startDate.setDate(startDate.getDate() + 7);

    return startDate >= now;
  }


  /**
    * Handles the click event for a communication item.
    *
    * When a communication is clicked, this method updates the `selectedCommunicationGuidSubject`
    * with the GUID of the clicked communication and navigates to the details page for that communication.
    *
    * @param communication - The `Communication` object representing the clicked communication.
    */
  public onCommunicationClicked(communication: Communication): void {
    selectedCommunicationGuidSubject.next(communication.communicationGuid);

    // TODO: Update navigation to Polaris Connect when available
    // Uncomment line below, remove both lines below that, and remove polarisConnectUrl from environment files
    // Add back in the router import and add to constructor. dealer-portal\packages\polaris-modules\package.json
    // this._router.navigate(['/polaris-connect', communication.communicationGuid]);
    if (this.environment.endpoints['polarisConnectUrl'] !== null) {
      const polarisConnectUrl = this.environment.endpoints['polarisConnectUrl'].baseUrl ?? '';
      if (polarisConnectUrl !== null) {
        window.open(polarisConnectUrl, '_blank', 'noopener,noreferrer');
      }
    }
  }

  public onViewAll(): void {
    // TODO: Update navigation to Polaris Connect when available
    // Uncomment line below, remove both lines below that, and remove polarisConnectUrl from environment files
    // Add back in the router import and add to constructor, also add to dealer-portal\packages\polaris-modules\package.json
    // this.viewAllClicked.emit();
    if (this.environment.endpoints['polarisConnectUrl'] !== null) {
      const polarisConnectUrl = this.environment.endpoints['polarisConnectUrl'].baseUrl ?? '';
      if (polarisConnectUrl !== null) {
        window.open(polarisConnectUrl, '_blank', 'noopener,noreferrer');
      }
    }
  }

  protected readonly PolarisBadgeColor: typeof PolarisBadgeColor = PolarisBadgeColor;
}

/**
 * A BehaviorSubject that holds the GUID of the selected communication.
 * It is initialized with an empty string and can be used to track the currently selected communication.
 */
export const selectedCommunicationGuidSubject: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>('');

/**
 * An observable that emits the current value of the selected communication GUID.
 * This can be used to subscribe to changes in the selected communication GUID.
 */
export const selectedCommunicationGuid$: Observable<string | undefined> = selectedCommunicationGuidSubject.asObservable();

