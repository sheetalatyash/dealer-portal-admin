import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  PolarisDialogService,
  PolarisFilePickerError,
  PolarisFilePickerFile,
  PolarisFilePickerStatus,
  PolarisGroupOption,
  PolarisNotificationService,
  PolarisTableColumnConfig,
} from '@dealer-portal/polaris-ui';
import { BehaviorSubject, Observable } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { SelectDeleteTableBaseEntity } from '../_view_models/select-delete-table-base-entity';
import { AccountStatusFilter } from '@enums/account-status-filter.enum';
import { StandardDialogComponent } from '../_features/communication-add-edit/_components/standard-dialog/standard-dialog.component';

export class CommunicationAddEditTargetsBase {
  constructor(
    protected _polarisDialogService: PolarisDialogService,
    protected _notificationService: PolarisNotificationService,
    protected _translate: TranslateService,
  ) {}

  /**
   * Creates a table column configuration with translation support for the label.
   * @param key - The key and id for the column.
   * @param label - The translation key for the column label.
   * @param sortable - Whether the column is sortable (default: true).
   * @returns A configured PolarisTableColumnConfig instance.
   */
  protected createColumnConfig<T>(key: string, label: string, sortable: boolean = true): PolarisTableColumnConfig<T> {
    return new PolarisTableColumnConfig<T>({
      key,
      id: key,
      label: this._translate.instant(label),
      sortable,
    });
  }

  /**
   * Creates a group option for use in checkbox/radio groups, with translation and optional flag.
   * @param formControlName - The name of the form control.
   * @param label - The translation key for the label.
   * @param optional - Whether the option is optional (default: false).
   * @returns An array with a single PolarisGroupOption.
   */
  protected createGroupOption(
    formControlName: string,
    label: string,
    optional: boolean = false,
  ): PolarisGroupOption<string>[] {
    return [
      new PolarisGroupOption<string>({
        label: this._translate.instant(label),
        labelClass: 'fw-semibold font-size-sm',
        formControlName,
        optional,
      }),
    ];
  }

  /**
   * Merges two arrays of accounts, deduplicating by account id (new accounts overwrite existing).
   * @param existingAccounts - The current list of accounts.
   * @param newAccounts - The new accounts to merge in.
   * @returns The merged, deduplicated array of accounts.
   */
  protected mergeAccounts<T extends SelectDeleteTableBaseEntity>(existingAccounts: T[], newAccounts: T[]): T[] {
    const accountMap = new Map<string, T>();
    [...existingAccounts, ...newAccounts].forEach((account) => accountMap.set(account.id, account));

    return Array.from(accountMap.values());
  }

  /**
   * Filters out accounts with status Inactive or NotFound.
   * @param accounts - The array of accounts to filter.
   * @returns The filtered array of valid accounts.
   */
  protected getValidAccounts<T extends SelectDeleteTableBaseEntity>(accounts: T[]): T[] {
    return accounts.filter(
      (account) => account.status !== AccountStatusFilter.Inactive && account.status !== AccountStatusFilter.NotFound,
    );
  }

  /**
   * Removes accounts from a BehaviorSubject by id.
   * @param accounts - The accounts to remove.
   * @param allAccountsSubject - The subject holding all accounts.
   */
  protected onRowsDeleted<T extends { id: string }>(accounts: T[], allAccountsSubject: BehaviorSubject<T[]>): void {
    const allAccounts = allAccountsSubject.getValue();
    const deletedIds = new Set(accounts.map((account) => account.id));
    allAccountsSubject.next(allAccounts.filter((account) => !deletedIds.has(account.id)));
  }

  /**
   * Subscribes to an accounts observable and updates a form group with valid accounts.
   * @param formGroup - The form group to update.
   * @param allAccounts$ - Observable of all accounts.
   */
  protected initializeFormGroup<T extends SelectDeleteTableBaseEntity>(
    formGroup: FormGroup,
    allAccounts$: Observable<T[]>,
  ): void {
    allAccounts$.pipe(untilDestroyed(this)).subscribe((accounts) => {
      const validAccounts = this.getValidAccounts(accounts);
      formGroup.get('specificAccountOptions')?.setValue(validAccounts);
      formGroup.markAsDirty();
      formGroup.updateValueAndValidity();
    });
  }

  /**
   * Checks for file picker errors and displays notifications for each error found.
   * @param filePickerFormControl - The form control for the file picker.
   * @returns True if any errors were found, false otherwise.
   */
  protected handleFilePickerErrors(filePickerFormControl: FormControl): boolean {
    let hasErrors = false;
    Object.values(PolarisFilePickerError).forEach((error: PolarisFilePickerError) => {
      if (filePickerFormControl?.errors?.[error]?.length > 0) {
        this._notificationService.danger(this._translate.instant(`specific-accounts.upload-errors.${error}`));
        hasErrors = true;
      }
    });

    return hasErrors;
  }

  /**
   * Opens a tooltip dialog with a translated title and message.
   * @param translationKey - The translation key for the dialog.
   */
  protected onTooltipClicked(translationKey: string): void {
    this._polarisDialogService
      .open(StandardDialogComponent, {
        minWidth: '50dvh',
        maxWidth: '95dvh',
        data: {
          title: `dialog.${translationKey}.title`,
          htmlMessage: `dialog.${translationKey}.message`,
          primaryButtonLabel: 'close',
        },
      })
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  /**
   * Returns a file picker file object representing the uploading state.
   */
  public get filePickerUploading(): PolarisFilePickerFile {
    return { status: PolarisFilePickerStatus.Uploading, progress: 'indeterminate' } as PolarisFilePickerFile;
  }

  /**
   * Returns a file picker file object representing the success state.
   */
  public get filePickerSuccess(): PolarisFilePickerFile {
    return { status: PolarisFilePickerStatus.Success, progress: 100 } as PolarisFilePickerFile;
  }

  /**
   * Returns a file picker file object representing the error state.
   */
  public get filePickerError(): PolarisFilePickerFile {
    return { status: PolarisFilePickerStatus.Error, progress: 100 } as PolarisFilePickerFile;
  }
}
