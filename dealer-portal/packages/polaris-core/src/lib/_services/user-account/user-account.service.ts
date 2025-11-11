import { Injectable, inject, provideAppInitializer, EnvironmentProviders } from '@angular/core';
import { StandardResponse, UserAccount, UserAccountSchema, UserInfoApiService } from '../../_apis';
import { forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AccessControlLevel } from '../../_enums';

@UntilDestroy()
@Injectable({
    providedIn: 'root',
})
export class UserAccountService {
  /**
   * User account information from claims endpoint.
   */
  private _userAccount: UserAccount | null = null;

  /**
   * User account information from user info endpoint.
   */
  private _userInfoAccount: UserAccount | null = null;
  /**
   * Access control level.
   */
  private _accessControlLevel: AccessControlLevel = AccessControlLevel.None;

  /**
   * Constructor. Initializes the service with the UserInfoApiService.
   * @param {UserInfoApiService} _userInfoApiService - Instance of UserInfoApiService.
   */
  constructor(private _userInfoApiService: UserInfoApiService) {
  }

  /**
   * Fetches the user account information and stores it.
   */
  public fetchUserClaims(): Observable<UserAccount> {
      return this._userInfoApiService.getUserClaims$().pipe(
          map((response: StandardResponse<UserAccount>): UserAccount => response.data as UserAccount),
          tap((userAccount: UserAccount): void => {
              this._userAccount = new UserAccount(userAccount) ?? null;
          }),
      );
  }

  public fetchUserInfoAccount(): Observable<UserAccount> {
      return this._userInfoApiService.getUserInfo$<UserAccount>(UserAccountSchema.User).pipe(
          map((response: StandardResponse<UserAccount>): UserAccount => response.data as UserAccount),
          tap((userAccount: UserAccount): void => {
              this._userInfoAccount = new UserAccount(userAccount) ?? null;
          }),
      );
  }
  /**
   * Fetches the access control level and stores it.
   */
  public fetchAccessControlLevel(): Observable<AccessControlLevel> {
    return this._userInfoApiService.getAccessControlLevel$().pipe(
        map((response: StandardResponse<AccessControlLevel>): AccessControlLevel => response.data as AccessControlLevel),
        tap((accessControlLevel: AccessControlLevel): void => {
            this._accessControlLevel = accessControlLevel;
        })
    );
  }

  /**
   * Returns the stored user account information from claims endpoint.
   */
  public get userAccount(): UserAccount {
      return this._userAccount as UserAccount;
  }

  /**
   * Returns the stored access control level.
   */
  public get accessControlLevel(): AccessControlLevel {
      return this._accessControlLevel;
  }

  /**
   * Returns the stored user account information from user info endpoint.
   */
  public get userInfoAccount(): UserAccount {
      return this._userInfoAccount as UserAccount;
  }

}

/**
 * Provides the user account information and access control level on application initialization.
 *
 * NOTE: this function is used in the app.config.ts file to provide the user account information and access control level.
 * so that they are available before the application starts.  Do not call this function directly in your component or service.
 * ALso, do not call the fetchUserAccount or fetchAccessControlLevel methods directly in your component or service.
 * Use the userAccount and accessControlLevel getters instead and make sure you inject the UserAccountService before using them.
 */
export function provideUserAccount(): (EnvironmentProviders)[] {
  return [
    // TODO: Remove casting when Angular’s new provider registration provides a function for custom classes.
    // Temporarily casting as EnvironmentProviders because Angular does not currently provide
    // a function for custom classes, per the angular team, the cast is the simplest workaround.
    UserInfoApiService as unknown as EnvironmentProviders,
    UserAccountService as unknown as EnvironmentProviders,
    provideAppInitializer(() => {
        const initializerFn = ((userAccountService: UserAccountService) => () => {
        // We need to ensure that both the user account information and access control level are fetched before the application starts.
        return new Promise<void>((resolve, reject) => {
          forkJoin([
            userAccountService.fetchUserClaims(),
            userAccountService.fetchAccessControlLevel(),
            userAccountService.fetchUserInfoAccount()
          ]).subscribe({
            next: () => {

              // assign accounts from userAccount2 to userAccount to ensure user account has all the data needed
              // this was needed to support the removal of accounts from the claims endpoint
              userAccountService.userAccount.accounts = userAccountService.userInfoAccount.accounts ?? [];

              resolve();
            },
            error: reject
          });
        });
      })(inject(UserAccountService));

        return initializerFn();
      })
  ];
}
