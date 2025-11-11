import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs';
import { AccessControlLevel } from '../../_enums';
import { AccessControlService } from '../../_services';
import { AccessControlConfig } from '../../_types';

@UntilDestroy()
@Directive({
  standalone: true,
  selector: '[accessControl]',
})
export class AccessControlDirective {

  constructor(
    private _templateRef: TemplateRef<unknown>,
    private _viewContainer: ViewContainerRef,
    private _accessControlService: AccessControlService
  ) {}

  /**
   * Sets the access control for an element.
   * Will Render an element if the user has required access control level or higher.
   *
   * @param {AccessControlLevel | AccessControlConfig} config
   * The access control configuration which can be:
   * an AccessControlLevel ('-', 'r', 'rw'),
   * or
   * an AccessControlConfig object.
   *
   * @examples
   * <div *accessControl="'r'">You have at least Read access</div>
   * <div *accessControl="'-'">You have no access</div>
   * <div *accessControl="{ level: 'r', exactMatch: false }">You have at least Read access</div>
   * <div *accessControl="{ level: 'r', exactMatch: true }">You have exactly Read access</div>
   * <div *accessControl="{ level: 'rw' }">You have at least Read/Write access</div>
   *
   * @see AccessControlService For more information on access control.
   */
  @Input()
  public set accessControl(config: AccessControlLevel | AccessControlConfig) {
    this._updateView(config);
  }

  /**
   * Updates the view based on the user's access rights.
   * Subscribes to the access control service to determine if the user has the required access level.
   * If access is granted, the template is rendered; otherwise, it is cleared.
   */
  private _updateView(config: AccessControlLevel | AccessControlConfig): void {
    this._accessControlService.hasAccess(config).pipe(
      tap((hasAccess: boolean): void => {
        if (hasAccess) {
          this._viewContainer.createEmbeddedView(this._templateRef); // Show element
        } else {
          this._viewContainer.clear(); // Hide element
        }
      }),
      untilDestroyed(this),
    ).subscribe();
  }
}
