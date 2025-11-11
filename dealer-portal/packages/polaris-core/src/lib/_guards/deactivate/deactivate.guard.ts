import { Injectable } from '@angular/core';
import { CanDeactivate, Navigation, Router } from '@angular/router';
import { Observable } from 'rxjs';

/**
 * Determines if a component can be deactivated.
 *
 * @param component - The component that is being checked for deactivation.
 *                    It must implement the `CanComponentDeactivate` interface.
 * @returns A boolean or a Promise that resolves to a boolean indicating whether
 *          the component can be deactivated. Returns `true` if the component
 *          does not implement the `canDeactivate` method.
 */
export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Promise<boolean> | Observable<boolean>;
}

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {

  constructor(
    private _router: Router,
  ) {}

  public canDeactivate(
    component: CanComponentDeactivate
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check navigation state to bypass the guard
    const currentNavigation: Navigation | null = this._router.getCurrentNavigation();

    if (currentNavigation?.extras.state?.['bypassCanDeactivate']) {
      return true;
    }

    // Otherwise, call the component's canDeactivate method
    return component.canDeactivate ? component.canDeactivate() : true;
  }
}
