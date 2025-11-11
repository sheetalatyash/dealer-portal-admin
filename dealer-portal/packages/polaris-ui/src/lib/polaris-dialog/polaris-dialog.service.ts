import { ComponentType } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, Observable, of, tap } from 'rxjs';

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class PolarisDialogService {
  constructor(
    public dialog: MatDialog,
    private _router: Router,
  ) {
    /** Close all dialogs on navigation */
    this._router.events.pipe(
      filter(event => event instanceof NavigationStart),
      tap(() => this.dialog.closeAll()),
      untilDestroyed(this),
    ).subscribe();
  }

  /**
   * @function open
   * @param dialogComponent -- This can be a generic ComponentType
   * @param config -- MatDialogConfig but will default to an empty Object if not provided
   * @return -- Returns an Observable, but you do not need to subscribe to this function to
   * open a dialog, only if you need the value returned after the dialog is closed.
   */
  public open(dialogComponent: ComponentType<unknown>, config: MatDialogConfig = {}): Observable<any | undefined> {
    // set defaultConfigs here for all dialogs
    const defaultConfig: MatDialogConfig = {
      minWidth: '500px',
      maxWidth: '750px',
    };

    const mappedConfig: MatDialogConfig = this._mapDialogConfig(defaultConfig, config);
    const dialogRef: MatDialogRef<unknown, MatDialogConfig> = this.dialog.open(dialogComponent, mappedConfig);

    return dialogRef.afterClosed().pipe(
      tap((response: MatDialogConfig | undefined): Observable<any> => of(response)),
      untilDestroyed(this),
    );
  }

  /**
   * @function openSmall
   * @param dialogComponent -- This can be a generic ComponentType
   * @param config -- MatDialogConfig but will default to an empty Object if not provided
   * @return -- Returns the observable from this.open
   * @description -- This method opens a dialog in a smaller size, note: size can still be overwritten.
   */
  public openSmall(dialogComponent: ComponentType<never>, config: string | MatDialogConfig = {}): Observable<unknown | undefined> {
    const defaultConfig: MatDialogConfig = {
      width: '50%',
      data: undefined,
    };

    const mappedConfig: MatDialogConfig = this._mapDialogConfig(defaultConfig, config);

    return this.open(dialogComponent, mappedConfig);
  }

  /**
   * @function _mapDialogConfig
   * @param defaultConfig -- default config generated origin
   * @param newConfig -- new config provided by user
   * @private
   * @return -- Returns a MatDialogConfig that has been combined from defaultConfig and newConfig, newConfig values
   * will overwrite default configs.
   */
  private _mapDialogConfig(defaultConfig: MatDialogConfig, newConfig: string | MatDialogConfig): MatDialogConfig {
    /** <T> helpers */
    const isObject: boolean = typeof newConfig === 'object';
    const isString: boolean = typeof newConfig === 'string';

    /** Map the new config */
    const mappedConfig: MatDialogConfig = isObject ? structuredClone(newConfig) as MatDialogConfig : {} as MatDialogConfig;
    mappedConfig.data = isString ? newConfig : isObject ? mappedConfig.data : undefined;

    return {...defaultConfig, ...mappedConfig};
  }

  /**
   * @function closeAllDialogs
   * @description -- This method closes all currently open dialogs.
   */
  public closeAllDialogs(): void {
    this.dialog.closeAll();
  }
}
