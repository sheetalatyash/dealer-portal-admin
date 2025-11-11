import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Sort } from '@angular/material/sort';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { PolarisButton, PolarisCheckbox, PolarisIcon, PolarisIconButton, PolarisTable, PolarisTableColumnConfig, PolarisTableConfig, PolarisTableCustomCellDirective, PolarisTableCustomHeaderRowDirective } from '@dealer-portal/polaris-ui';
import { PolarisDialogService } from '@dealer-portal/polaris-ui';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { SelectDeleteTableBaseEntity } from '../../../../_view_models/select-delete-table-base-entity';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountStatusFilter } from '@enums/account-status-filter.enum';
import { StandardDialogComponent } from '../standard-dialog/standard-dialog.component';

@UntilDestroy()
@Component({
    imports: [PolarisIcon, PolarisIconButton, CommonModule, PolarisTable, PolarisTableCustomHeaderRowDirective, MatMenuModule, TranslatePipe, PolarisTableCustomCellDirective, PolarisCheckbox, PolarisButton],
    selector: 'ca-select-delete-table',
    templateUrl: './select-delete-table.component.html',
    styleUrls: ['./select-delete-table.component.scss']
})
export class SelectDeleteTableComponent<T extends SelectDeleteTableBaseEntity> implements OnInit {
  @Input() data$: Observable<T[]> = new Observable<T[]>();
  @Input() columns: PolarisTableColumnConfig<T>[] = [];
  @Input() filters: AccountStatusFilter[] = [];
  @Output() rowsDeleted: EventEmitter<T[]> = new EventEmitter<T[]>();

  public displayedDataSubject: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);
  public displayedData$: Observable<T[]> = this.displayedDataSubject.asObservable();
  public currentPageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  public currentPage$: Observable<number> = this.currentPageSubject.asObservable();
  public sortSubject: BehaviorSubject<Sort> = new BehaviorSubject<Sort>({ active: '', direction: '' });
  public sort$: Observable<Sort> = this.sortSubject.asObservable();
  public filterSubject: BehaviorSubject<AccountStatusFilter> = new BehaviorSubject<AccountStatusFilter>(AccountStatusFilter.All);
  public filter$: Observable<AccountStatusFilter> = this.filterSubject.asObservable();
  public pageSize: number = 50;
  public tableConfig!: PolarisTableConfig<T>;
  public selectAllControl: FormControl = new FormControl(false);
  public rowControls: Map<string, FormControl> = new Map();
  public statusColumn: string = 'status';

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _dialogService: PolarisDialogService
  ) { }

  public ngOnInit(): void {
    this._setTableConfig();

    combineLatest([this.data$, this.currentPage$, this.sort$, this.filter$])
      .pipe(
        map(([data, currentPage, sort, filter]) => this._processData(data, currentPage, sort, filter)),
        untilDestroyed(this)
      )
      .subscribe(displayedData => {
        this.displayedDataSubject.next(displayedData);
        this._changeDetectorRef.detectChanges();
      });
  }

  private _processData(data: T[], currentPage: number, sort: Sort, filter: AccountStatusFilter): T[] {
    return this._updateFormControls(
      this._paginate(
        this._applySort(
          this._applyFilter(data, filter),
          sort
        ),
        currentPage
      )
    );
  }

  private _applyFilter(data: T[], filter: AccountStatusFilter): T[] {
    return filter !== AccountStatusFilter.All ? data.filter(item => item.status === filter) : data;
  }

  private _applySort(data: T[], sort: Sort): T[] {
    if (sort.active && sort.direction !== '') {
      return data.slice().sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        const aValue = (a[sort.active as keyof T] ?? '') as string | number;
        const bValue = (b[sort.active as keyof T] ?? '') as string | number;

        return this._compare(aValue, bValue, isAsc);
      });
    }

    return data;
  }

  private _paginate(data: T[], currentPage: number): T[] {
    this.tableConfig.pagination.totalItems = data.length;

    return data.slice(0, this.pageSize * currentPage);
  }

  private _updateFormControls(data: T[]): T[] {
    (data ?? []).forEach(item => {
      if (!this.rowControls.has(item.id)) {
        this.rowControls.set(item.id, new FormControl(false));
      }
    });
    this.selectAllControl.setValue(this.isAnyRowSelected);

    return data;
  }

  private _setTableConfig(): void {
    const columns: PolarisTableColumnConfig<T>[] = [
      new PolarisTableColumnConfig<T>({
        key: 'select',
        id: 'select',
        label: '',
        sortable: false
      }),
      ...this.columns,
      new PolarisTableColumnConfig<T>({
        key: 'delete',
        id: 'delete',
        label: '',
        sortable: false
      })
    ];

    this.tableConfig = new PolarisTableConfig<T>({
      columns,
      customSort: (sort: Sort) => this.onSortData(sort),
      pagination: {
        uiTestId: 'generic-table-pagination',
        totalItems: 0,
      }
    });
  }

  private _compare(a: string | number, b: string | number, isAsc: boolean): number {
    if (a === b) {
      return 0;
    }
    if (!a) {
      return isAsc ? -1 : 1;
    }
    if (!b) {
      return isAsc ? 1 : -1;
    }

    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  public get isAnyRowSelected(): boolean {
    const displayedDataIds = this.displayedDataSubject.getValue().map(item => item.id);

    return Array.from(this.rowControls.entries())
      .filter(entry => displayedDataIds.includes(entry[0]))
      .some(entry => entry[1].value);
  }

  public get areMultipleRowsSelected(): boolean {
    const displayedDataIds = this.displayedDataSubject.getValue().map(item => item.id);

    return Array.from(this.rowControls.entries())
      .filter(entry => displayedDataIds.includes(entry[0]))
      .filter(entry => entry[1].value).length > 1;
  }



  public onLoadMoreData(): void {
    this.currentPageSubject.next(this.currentPageSubject.getValue() + 1);
  }

  public onSortData(sort: Sort): void {
    this.sortSubject.next(sort);
  }

  public onRowSelectChange(item: T, event: MatCheckboxChange): void {
    this.getRowControl(item.id).setValue(event.checked);
    this.selectAllControl.setValue(this.isAnyRowSelected);
  }

  public onSelectAllChange(event: MatCheckboxChange): void {
    this.displayedDataSubject.getValue()
      .forEach(item => this.getRowControl(item.id).setValue(event.checked));
    this.selectAllControl.setValue(event.checked);
  }

  public onSelectAllByStatus(status: AccountStatusFilter): void {
    this.filterSubject.next(status);
    this.displayedDataSubject.getValue()
      .forEach(item => this.getRowControl(item.id).setValue(true));
    this.selectAllControl.setValue(this.isAnyRowSelected);
  }

  public onDeleteRow(item: T): void {
    this.rowsDeleted.emit([item]);
    this.rowControls.delete(item.id);
    this.selectAllControl.setValue(this.isAnyRowSelected);
  }

  public deleteSelectedRows(): void {
    const selectedItems = this.displayedDataSubject.getValue().filter(data => this.getRowControl(data.id).value);
    this.rowsDeleted.emit(selectedItems);
    selectedItems.forEach(item => {
      this.rowControls.delete(item.id);
    });
    this.rowControls.forEach(control => control.setValue(false));
    this.selectAllControl.setValue(this.isAnyRowSelected);
    this._dialogService.closeAllDialogs();
  }

  public openDeleteDialog(item?: T): void {
    this._dialogService.open(StandardDialogComponent, {
      minWidth: '25dvh',
      maxWidth: '50dvh',
      data: {
        title: 'dialog.confirm-delete-selection.title',
        message: 'dialog.confirm-delete-selection.message',
        primaryButtonLabel: 'confirm',
        secondaryButtonLabel: 'cancel'
      }
    })
      .pipe(untilDestroyed(this))
      .subscribe(result => {
        if (result) {
          if (item) {
            this.onDeleteRow(item);
          } else {
            this.deleteSelectedRows();
          }
        }
      });
  }

  public isStatusInactiveOrNotFound(status: AccountStatusFilter): boolean {
    return status === AccountStatusFilter.Inactive || status === AccountStatusFilter.NotFound;
  }

  public transformStatusText(status: AccountStatusFilter): string {
    return status === AccountStatusFilter.NotFound ? 'Not Found' : status;
  }

  public getRowControl(id: string): FormControl {
    if (!this.rowControls.has(id)) {
      this.rowControls.set(id, new FormControl(false));
    }

    return this.rowControls.get(id) as FormControl;
  }
}
