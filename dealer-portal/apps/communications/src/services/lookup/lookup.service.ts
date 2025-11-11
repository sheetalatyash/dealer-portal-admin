import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import {
  CommunicationGroup,
  CommunicationsApiService,
  CommunicationStatus,
  LoggerService,
  StandardResponse,
} from '@dealer-portal/polaris-core';

@Injectable({ providedIn: 'root' })
export class LookupService {
  constructor(private _communicationsApiService: CommunicationsApiService, private _loggerService: LoggerService) {}

  /**
   * Retrieves a list of communication status options.
   *
   * @returns - An observable that emits an array of `CommunicationStatus` objects.
   *
   * @example
   * // Get status options
   * getStatuses$().subscribe(statuses => {
   *   console.log('Statuses:', statuses);
   * });
   */
  public getStatuses$(): Observable<CommunicationStatus[]> {
    return this._communicationsApiService.getAllStatuses$().pipe(
      tap(({ success, error }: StandardResponse<CommunicationStatus[]>) => {
        if (!success) {
          this._loggerService.logError('Failed to Get Communication Statuses', {
            error,
          });
        }
      }),
      map((response: StandardResponse<CommunicationStatus[]>) => response.data ?? [])
    );
  }

  /**
   * Retrieves a list of communication groups.
   *
   * @returns - An observable that emits an array of `CommunicationGroup` objects.
   *
   * @example
   * // Get groups
   * getGroups$().subscribe(groups => {
   *   console.log('Groups:', groups);
   * });
   */
  public getGroups$(): Observable<CommunicationGroup[]> {
    return this._communicationsApiService.getAllGroups$().pipe(
      tap(({ success, error }: StandardResponse<CommunicationGroup[]>) => {
        if (!success) {
          this._loggerService.logError('Failed to Get Communication Groups', {
            error,
          });
        }
      }),
      map((response: StandardResponse<CommunicationGroup[]>): CommunicationGroup[] => response.data ?? [])
    );
  }

  /**
   * Retrieves a list of communication subgroups for a specific group.
   *
   * @param groupId - The ID of the group to retrieve subgroups for.
   * @returns - An observable that emits an array of `CommunicationSubGroup` objects.
   *
   * @example
   * // Get subgroups for a group
   * getSubGroups$(1).subscribe(subGroups => {
   *   console.log('SubGroups:', subGroups);
   * });
   */
  public getSubGroups$(groupId: number): Observable<CommunicationGroup[]> {
    return this._communicationsApiService.getAllSubGroups$(groupId).pipe(
      tap(({ success, error }: StandardResponse<CommunicationGroup[]>) => {
        if (!success) {
          this._loggerService.logError(`Failed to Get Communication Sub Groups for Group ID ${groupId}`, {
            error,
          });
        }
      }),
      map((response: StandardResponse<CommunicationGroup[]>) => response.data ?? [])
    );
  }
}
