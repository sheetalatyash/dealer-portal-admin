import { AsyncPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseUserInfo, PortalUserInternalClaim, UserInfoService } from '@dealer-portal/polaris-core';
import { PolarisDialogService, PolarisHeading, PolarisSearchBar, } from '@dealer-portal/polaris-ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, debounceTime, exhaustMap, Observable, of, scan, startWith, Subject, switchMap, takeWhile, tap } from 'rxjs';
import { HelpDialogComponent } from '../help-dialog';
import { UserTableComponent } from '../user-table';

@UntilDestroy()
@Component({
    selector: 'uai-user-administration-internal',
    imports: [
        UserTableComponent,
        PolarisHeading,
        PolarisSearchBar,
        AsyncPipe,
        TranslatePipe,
    ],
    templateUrl: './user-administration-internal.component.html',
    styleUrl: './user-administration-internal.component.scss',
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ]
})
export class UserAdministrationInternalComponent implements OnInit {
  private _searchTextSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private _totalCountSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _recentlyModifiedCountSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _internalUsersSubject: BehaviorSubject<BaseUserInfo<PortalUserInternalClaim>[]> = new BehaviorSubject<BaseUserInfo<PortalUserInternalClaim>[]>([]);
  private _internalUsersRecentlyModified: BehaviorSubject<BaseUserInfo<PortalUserInternalClaim>[]> = new BehaviorSubject<BaseUserInfo<PortalUserInternalClaim>[]>([]);
  public nextPage$ = new Subject<void>();

  public searchText$: Observable<string> = this._searchTextSubject.asObservable();
  public internalUsers$: Observable<BaseUserInfo<PortalUserInternalClaim>[]> = this._internalUsersSubject.asObservable();
  public internalUsersRecentlyModified$: Observable<BaseUserInfo<PortalUserInternalClaim>[]> = this._internalUsersRecentlyModified.asObservable();
  public totalCount$: Observable<number> = this._totalCountSubject.asObservable();
  public recentlyModifiedCount$: Observable<number> = this._recentlyModifiedCountSubject.asObservable();

  public title: string = this._translate.instant('title.user-admin');
  public pageSize: number = 100;
  public loading: boolean = false;

  constructor(
    private _router: Router,
    private _dialogService: PolarisDialogService,
    private _translate: TranslateService,
    private _userInfoService: UserInfoService
  ) { }

  public ngOnInit(): void {
    this._buildSearchSubscription();
    this._getLastModifiedUsers();
  }

  private _buildSearchSubscription() {
    this.searchText$.pipe(
      tap(() => this.loading = true),
      debounceTime(300),
      untilDestroyed(this),
      switchMap(searchText => {
        if (!searchText) {
          this._totalCountSubject.next(0);

          return of([]);
        }

        let currentPage = 1;

        return this.nextPage$.pipe(
          untilDestroyed(this),
          startWith(currentPage),
          exhaustMap(() => this._userInfoService.searchByUsernameSegment$(searchText, currentPage, this.pageSize)),
          tap(res => {
            currentPage++;
            this._totalCountSubject.next(res.data?.totalCount ?? 0);
          }),
          takeWhile(res => res?.data?.data !== undefined && res.data.data.length > 0, true),
          scan((acc: BaseUserInfo<PortalUserInternalClaim>[], res) => acc.concat(res?.data?.data ?? []), []),
          tap(() => this.loading = false)
        );
      })
    ).subscribe(users => this._internalUsersSubject.next(users));
  }

  public navigateApplication(route: string): void {
    this._router.navigate([route]);
  }

  public openHelpDialog(): void {
    this._dialogService.open(HelpDialogComponent);
  }

  public onSearch(searchText: string): void {
    this._searchTextSubject.next(searchText); 
    if (searchText === "") { // if user deletes search text, get last modified users. 
      this._getLastModifiedUsers();
    }
  }

  public onTableLoadMore(): void {
    this.nextPage$.next();
  }

  private _getLastModifiedUsers(): void {
    this._userInfoService.getLastModifiedUserInfo$(this.pageSize)
      .pipe(
        tap(() => this.loading = true),
        tap(res => {
          const users = res.data?.data ?? [];
          this._internalUsersRecentlyModified.next(users);
          this._recentlyModifiedCountSubject.next(users.length);
        }),
        tap(() => this.loading = false),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
