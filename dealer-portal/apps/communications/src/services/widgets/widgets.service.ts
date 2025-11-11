import { Injectable } from '@angular/core';
import { DealerPortalApiService, StandardResponse, Widget } from '@dealer-portal/polaris-core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { map, Observable } from 'rxjs';

/**
 * Service for managing user widgets in the Dealer Portal application.
 *
 * Provides methods to fetch the current user's widgets and update their widget configuration
 * by communicating with the backend API. All methods return RxJS Observables for reactive usage.
 */
@UntilDestroy()
@Injectable()
export class WidgetsService {
  /**
   * Constructs the WidgetsService.
   * @param _dealerPortalApiService Service for API communication with the Dealer Portal backend.
   */
  constructor(private _dealerPortalApiService: DealerPortalApiService) {}

  /**
   * Retrieves the list of widgets configured for the current user.
   *
   * Calls the backend API to fetch the user's widgets and returns an observable
   * that emits the array of widgets. If the API response does not contain data,
   * an empty array is returned. The observable completes after emitting the result.
   *
   * @returns Observable that emits an array of `Widget` objects for the current user.
   */
  public getWidgets$(): Observable<Widget[]> {
    return this._dealerPortalApiService.getWidgetData$().pipe(
      map((dealerPortalResponse: StandardResponse<Widget[]>): Widget[] => {
        return dealerPortalResponse.data ?? [];
      }),
    );
  }

  /**
   * Updates the widget configuration for the current user.
   *
   * Sends the provided array of widgets to the backend API to update the user's
   * widget settings. Returns an observable that emits the standard API response
   * indicating success or failure.
   *
   * @param widgets Array of `Widget` objects representing the new widget configuration for the user.
   * @returns Observable emitting the API response after updating the widgets.
   */
  public updateWidgets$(widgets: Widget[]): Observable<StandardResponse<unknown>> {
    return this._dealerPortalApiService.updateWidgetData$(widgets);
  }
}
