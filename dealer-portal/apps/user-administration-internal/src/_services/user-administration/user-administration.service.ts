import { Injectable } from '@angular/core';
import { PermissionPage, Permissions } from '@dealer-portal/polaris-core';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';
import { UserAdministrationApiService } from '@services';

@Injectable({
  providedIn: 'root',
})
export class UserAdministrationService {

  private _permissions: BehaviorSubject<Permissions | null> = new BehaviorSubject<Permissions | null>(null);
  public permissions$: Observable<Permissions | null> = this._permissions.asObservable();

  constructor(
    private _userAdministrationApiService: UserAdministrationApiService,
  ) {}

  public getPermissions$(accountNumber: string, userName: string, updatePermissions: boolean = true): Observable<Permissions> {
    return this._userAdministrationApiService.getPermissions$(accountNumber, userName).pipe(
      take(1),
      tap((permissions: Permissions): Permissions => {
        // Update Permissions if requested
        if (updatePermissions) {
          this._permissions.next(permissions);
        }

        // Return Permissions as is
        return permissions;
      }),
    );
  }

  public updatePermissions$(
    userName: string,
    accountNumber: string,
    permissions: PermissionPage[],
  ): Observable<Permissions> {

    return this._userAdministrationApiService.updatePermissions$(accountNumber, userName, permissions);
  }

  public isDeepEqual<T>(object1: T, object2: T): boolean {
    return JSON.stringify(object1) === JSON.stringify(object2);
  }
}
