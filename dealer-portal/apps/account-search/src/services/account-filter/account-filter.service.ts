import { Injectable } from '@angular/core';
import { AccountFilterArguments } from '@dealer-portal/polaris-core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, debounceTime, Observable, tap, } from 'rxjs';

@Injectable()
export class AccountFilterService {

  private _filteredBy: string = this._translate.instant('filtered-by');
  private _filteredByNote: string = this._translate.instant('filtered-by-note');
  private _defaultFilters: AccountFilterArguments = new AccountFilterArguments();

  public filterSubject: BehaviorSubject<AccountFilterArguments> =
    new BehaviorSubject<AccountFilterArguments>(new AccountFilterArguments());

  constructor(private readonly _translate: TranslateService) {}

  public get searchTerm(): string {

    return this.filterSubject.value.accountNameOrNumber;
  }

  public get filters(): AccountFilterArguments {

    return this.filterSubject.value;
  }

  public get filteredBy(): string {
    const customerClasses: string[] = this.filterSubject.value.customerClasses ?? [];

    return  customerClasses && customerClasses.length > 0
      ? `${this._filteredBy}${customerClasses.filter(customerClass => customerClass !== ',').join(', ')}${this._filteredByNote}`
      : '';
  }

  public applyDefaultFilters(classFilters: string[]) {
    this._defaultFilters.customerClasses = classFilters;
  }

  public updateFilters(filters: AccountFilterArguments) {
    filters.accountNameOrNumber = this.filterSubject.value.accountNameOrNumber;
    this.filterSubject.next(filters);
  }

  public updateSearchTerm(searchTerm: string, firstSearch: boolean = false) {
    if (searchTerm === this.filterSubject.value.accountNameOrNumber) {
      // No change so do not emit
      return;
    }

    // On first search, apply default filters with searchTerm, otherwise keep existing filters
    const filters: AccountFilterArguments = firstSearch ? this._defaultFilters : this.filterSubject.value;

    filters.accountNameOrNumber = searchTerm;
    this.filterSubject.next(filters);
  }

  public clearMessages() {
    this.filterSubject.next(new AccountFilterArguments());
  }

  public hasChanged$(): Observable<AccountFilterArguments> {
    return this.filterSubject.asObservable().pipe(
      debounceTime(700),
      tap((filters: AccountFilterArguments) => {
        // Remove leading and trailing spaces from the delayed search term (e.g. cut and paste with whitespace)
        filters.accountNameOrNumber = filters.accountNameOrNumber.trimStart().trimEnd();
      })
    );
  }
}
