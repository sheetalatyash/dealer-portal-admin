import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import {
  BaseUserInfo,
  OrderByDirection,
  OrderByExpression,
  PagingWithQueryContinuationResponse,
  PortalUserInternalClaim,
  QueryByComparison,
  QueryByExpression,
  QueryByFilter,
  QueryByOperator,
  QueryDefinition,
  StandardResponse,
  UserInfoApiService,
  UserInfoManagementApiService,
} from '../../_apis';
import { AccessControlLevel } from '../../_enums';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger';


@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
  public defaultPageSize: number = 20;

  private _internalUserInfo: BehaviorSubject<BaseUserInfo<PortalUserInternalClaim> | null> = new BehaviorSubject<BaseUserInfo<PortalUserInternalClaim> | null>(null);
  public internalUserInfo$: Observable<BaseUserInfo<PortalUserInternalClaim> | null> = this._internalUserInfo.asObservable();


  // Default query definition for searching user information.
  public queryDefinition: QueryDefinition = new QueryDefinition({
    pageNumber: 1,
    pageSize: this.defaultPageSize,
    queryByOperator: QueryByOperator.And,
    queryBy: [
      new QueryByFilter(QueryByOperator.And, [
        new QueryByExpression('schema', 'portal.user.internal', QueryByComparison.Equals)
      ])
    ],
    orderBy: [
      new OrderByExpression('claims.userName', OrderByDirection.Descending)
    ]
  });

  constructor(
    private _userInfoManagementApiService: UserInfoManagementApiService,
    private _userInfoApiService: UserInfoApiService,
    private _loggerService: LoggerService,
  ) { }

  public getLastModifiedUserInfo$(pageSize: number): Observable<StandardResponse<PagingWithQueryContinuationResponse<BaseUserInfo<PortalUserInternalClaim>>>> {
    const copiedQueryDefinition: QueryDefinition = QueryDefinition.copy(this.queryDefinition);
    copiedQueryDefinition.pageSize = pageSize;
    copiedQueryDefinition.orderBy = [
      new OrderByExpression('updatedOn', OrderByDirection.Descending)
    ];
    return this._userInfoManagementApiService.searchUserInfo$(copiedQueryDefinition);
  }

  public getUserInfo$(id: string): Observable<BaseUserInfo<PortalUserInternalClaim> | null> {
    // Copy queryDefinition to avoid modifying the original reference
    const copiedQueryDefinition: QueryDefinition = QueryDefinition.copy(this.queryDefinition);
    copiedQueryDefinition.queryBy.push(
      new QueryByFilter(QueryByOperator.And, [
        new QueryByExpression('id', id, QueryByComparison.Equals)
      ])
    );

    return this._userInfoManagementApiService.searchUserInfo$<PortalUserInternalClaim>(copiedQueryDefinition).pipe(
      map((response: StandardResponse<PagingWithQueryContinuationResponse<BaseUserInfo<PortalUserInternalClaim>>>) => {
        const userData: BaseUserInfo<PortalUserInternalClaim> | null = response.data?.data?.[0] ?? null;
        this.setInternalUserInfo(userData);

        return userData;
      })
    );
  }

  public setInternalUserInfo(data: BaseUserInfo<PortalUserInternalClaim> | null): void {
    this._internalUserInfo.next(data);
  }

  public searchByUsernameSegment$(segment: string, pageNumber: number, pageSize: number): Observable<StandardResponse<PagingWithQueryContinuationResponse<BaseUserInfo<PortalUserInternalClaim>>>> {
    const copiedQueryDefinition: QueryDefinition = QueryDefinition.copy(this.queryDefinition);
    copiedQueryDefinition.pageNumber = pageNumber;
    copiedQueryDefinition.pageSize = pageSize;
    copiedQueryDefinition.orderBy = [new OrderByExpression('claims.userName', OrderByDirection.Ascending)];
    copiedQueryDefinition.queryBy.push(
        new QueryByFilter(QueryByOperator.Or, [
        // TODO: Make filtering case insensitive in the API so we don't need to modify the segment here
        new QueryByExpression('claims.userName', `${segment.toLowerCase()}`, QueryByComparison.Contains),
        new QueryByExpression('claims.email', `${segment.toLowerCase()}`, QueryByComparison.Contains),
        new QueryByExpression('claims.givenName', `${segment}`, QueryByComparison.Contains),
        new QueryByExpression('claims.familyName', `${segment}`, QueryByComparison.Contains),
        new QueryByExpression('claims.salesRepId', `${segment}`, QueryByComparison.Contains),
        new QueryByExpression('claims.salesRole', `${segment.toUpperCase()}`, QueryByComparison.Contains),
          ])
    );

    return this._userInfoManagementApiService.searchUserInfo$<PortalUserInternalClaim>(copiedQueryDefinition);
  }

  // Gets the Access Control Level for the current application.
  // Returns an Observable that has the AccessControlLevel or undefined if there was an error retrieving it.
  public getAccessControlLevelForApplication$(application: string): Observable< AccessControlLevel | undefined> {
    return this._userInfoApiService.getAccessControlLevelForApplication$(application)
      .pipe(
        tap((response: StandardResponse<AccessControlLevel>) => {
          if (!response.success) {
            this._loggerService.logError(`Error fetching access control level for application: ${application}`);
          }
        }),
        map((response: StandardResponse<AccessControlLevel>) =>
          response.success ? response.data : undefined
        )
    );
  }
}
