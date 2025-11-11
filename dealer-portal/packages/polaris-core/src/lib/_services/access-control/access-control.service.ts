import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of} from 'rxjs';
import { AccessControlLevel } from '../../_enums';
import { AccessControlConfig, Environment, ENVIRONMENT_CONFIG } from '../../_types';
import { UserAccountService } from '../user-account';

@Injectable({
  providedIn: 'root'
})
export class AccessControlService {
  // Init Application Name
  private readonly _applicationName: string = '';

  // Stores access levels for different applications
  private _userAccessControlLevels: BehaviorSubject<Record<string, AccessControlLevel>> = new BehaviorSubject<Record<string, AccessControlLevel>>({});
  public _userAccessControlLevels$: Observable<Record<string, AccessControlLevel>> = this._userAccessControlLevels.asObservable();

  // Stores the hierarchy of access levels
  public readonly accessControlHierarchy: Record<AccessControlLevel, number> = {
    [AccessControlLevel.None]: 0,
    [AccessControlLevel.Read]: 1,
    [AccessControlLevel.ReadWrite]: 2
  };

  constructor(
    private _userAccountService: UserAccountService,
    @Inject(ENVIRONMENT_CONFIG) environment: Environment,
  ) {
    this._applicationName = environment.applicationName;
  }

  /**
   * Determines access control for the application.
   * @param {AccessControlLevel | AccessControlConfig} config
   * @return {Observable<boolean>}
   */

  /**
   * Determines access control for the application.
   * @param {AccessControlLevel | AccessControlConfig} config
   * The access control configuration which can be:
   * an AccessControlLevel ('-', 'r', 'rw'),
   * or
   * an AccessControlConfig object.
   *
   * - If an AccessControlLevel is provided, it is converted to
   * an AccessControlConfig Object with `exactMatch` set to false.
   *
   * - If an AccessControlConfig object is provided, the level
   * and exactMatch values are extracted.
   *
   * - If AccessControlLevel is '-' (No Access),
   * or
   * - If an AccessControlConfig object is provided & level is '-' (No Access),
   * We will Strictly check against the (No Access) level. regardless of exactMatch value.
   *
   * @examples
   *    this._accessControlService.hasAccess(config).pipe(
   *       tap((hasAccess: boolean): void => {
   *         if (hasAccess) {
   *           <USER HAS ACCESS>
   *         } else {
   *           <USER DOES NOT HAVE ACCESS>
   *         }
   *       }),
   *       untilDestroyed(this),
   *     ).subscribe();
   */
  public hasAccess(config: AccessControlLevel | AccessControlConfig): Observable<boolean> {
    // If `config` is empty, deny access immediately
    if (!config) {
      return of(false);
    }

    // If application name is not set, deny access immediately
    if (!this._applicationName) {
      return of(false);
    }

    // Convert config to AccessControlConfig if necessary
    const requiredAccessControlConfig: AccessControlConfig = this._getAccessControlConfig(config);
    const userAccessLevels: Record<string, AccessControlLevel> = this._userAccessControlLevels.getValue();
    const storedAccessLevel: AccessControlLevel = userAccessLevels[this._applicationName];

    // If we already have access levels stored, check them immediately
    if (storedAccessLevel !== undefined) {
      return of(this._compareAccessLevels(storedAccessLevel, requiredAccessControlConfig));
    }

    // Fetch the access level from the server and compare it with the required level
    // Otherwise, fetch access level from API and then check
    return this._getApplicationControlAccessLevel$().pipe(
      map((updatedAccessLevels: Record<string, AccessControlLevel>): boolean =>
        updatedAccessLevels[this._applicationName] !== undefined
          ? this._compareAccessLevels(updatedAccessLevels[this._applicationName], requiredAccessControlConfig)
          : false
      )
    );
  }

  /**
   * Retrieves the access control level for the application.
   * @return {Observable<void>}
   * @private
   */
  private _getApplicationControlAccessLevel$(): Observable<Record<string, AccessControlLevel>> {
    this.setUserAccessLevel(this._userAccountService.accessControlLevel);
    return this._userAccessControlLevels$;
  }

  /**
   * Sets or updates the user's access level for a specific application.
   */
  public setUserAccessLevel(level: AccessControlLevel): void {
    const updatedAccessLevels: Record<string, AccessControlLevel> = {
      ...this._userAccessControlLevels.getValue(),
      [this._applicationName]: level, // Only update this key
    };

    this._userAccessControlLevels.next(updatedAccessLevels);
  }

  /**
   * Compares access levels based on their hierarchy.
   */
  private _compareAccessLevels(
    userLevel: AccessControlLevel,
    accessControlConfig: AccessControlConfig,
  ): boolean {
    return accessControlConfig.exactMatch
      ? userLevel === accessControlConfig.level
      : this.accessControlHierarchy[userLevel] >= this.accessControlHierarchy[accessControlConfig.level as AccessControlLevel];
  }

  /**
   * Type-safe check to determine if a value is a valid AccessControlLevel.
   */
  private _isAccessControlLevel(value: unknown): value is AccessControlLevel {
    return Object.values(AccessControlLevel).includes(value as AccessControlLevel);
  }

  /**
   * Retrieves the AccessControlConfig for a specific application.
   */
  private _getAccessControlConfig(config: AccessControlLevel | AccessControlConfig): AccessControlConfig {
    // If config is an AccessControlLevel, wrap it in a default AccessControlConfig
    if (this._isAccessControlLevel(config)) {
      return {
        level: config,
        exactMatch: config === AccessControlLevel.None // Enforce exactMatch for None
      };
    }

    // If config is an AccessControlConfig, ensure correct exactMatch behavior
    // Also Ensure the level is a valid AccessControlLevel, otherwise default to None
    const level: AccessControlLevel = this._isAccessControlLevel(config.level) ? config.level : AccessControlLevel.None;

    return {
      level,
      exactMatch: level === AccessControlLevel.None ? true : !!config.exactMatch // Force true if level is None
    };
  }

}
