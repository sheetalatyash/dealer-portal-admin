import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PolarisDialogService, PolarisHeading, PolarisIcon, PolarisSearchBar } from '@dealer-portal/polaris-ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';

import { AccountTableComponent } from './components/account-table/account-table.component';
import { UserAccount } from '@dealer-portal/polaris-core';

@UntilDestroy()
@Component({
    selector: 'comm-toggle-account',
    imports: [
        AccountTableComponent,
        PolarisHeading,
        PolarisIcon,
        PolarisSearchBar,
        ReactiveFormsModule,
        TranslatePipe
    ],
    templateUrl: './toggle-account.component.html',
    styleUrl: './toggle-account.component.scss'
})
export class ToggleAccountComponent implements OnInit {

  private _userInfo: BehaviorSubject<UserAccount | null> = new BehaviorSubject<UserAccount | null>(null);
  private _dataSubject = new BehaviorSubject<string>('');

  public search$ = this._dataSubject.asObservable();
  public title: string = this._translate.instant('toggle-account-view.title');
  public account: string = '';
  public accountName: string = '';
  public accountCityState: string = '';
  public userInfo$: Observable<UserAccount | null> = this._userInfo.asObservable();
  public minimumCharactersMessage: string = this._translate.instant('minimum-characters-message');
  public searchForm!: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private _dialogService: PolarisDialogService,
    private _translate: TranslateService
  ) {
    this.searchForm = this._formBuilder.group({});
  }

  public ngOnInit(): void {
    this._route.queryParams.pipe(untilDestroyed(this)).subscribe(params => {
      this.account = params['account'];
      this.accountName = params['accountName'];
      this.accountCityState = params['cityState'];
    });
  }

  public applySearch(searchTerm: string): void {
    this._dataSubject.next(searchTerm);
  }

  public navigateApplication(route: string): void {
    this._router.navigate([route]);
  }

  public openHelpDialog(): void {
    this._dialogService.open(HelpDialogComponent);
  }
}
