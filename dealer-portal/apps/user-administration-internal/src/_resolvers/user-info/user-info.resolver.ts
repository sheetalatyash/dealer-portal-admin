import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { BaseUserInfo, PortalUserInternalClaim, UserInfoService } from '@dealer-portal/polaris-core';
import { catchError, Observable, of, switchMap, take } from 'rxjs';

export const internalUserInfoResolver: ResolveFn<BaseUserInfo<PortalUserInternalClaim> | null> = (
  route: ActivatedRouteSnapshot,
): Observable<BaseUserInfo<PortalUserInternalClaim> | null> => {
  const id: string | null = route.paramMap.get('id');
  const userInfoService: UserInfoService = inject(UserInfoService);

  if (!id) {
    return of(null); // Ensure an observable is returned
  }

  // Check if user info is already available
  return userInfoService.internalUserInfo$.pipe(
    take(1), // Get the latest value and complete
    switchMap((cachedUserInfo: BaseUserInfo<PortalUserInternalClaim> | null): Observable<BaseUserInfo<PortalUserInternalClaim> | null> => {
      if (cachedUserInfo && cachedUserInfo.id === id) {
        return of(cachedUserInfo); // Return cached user info if it matches
      }

      // If no match, fetch from API
      return userInfoService.getUserInfo$(id).pipe(
        catchError(() => of(null)) // Handle errors gracefully
      );
    })
  );
};
