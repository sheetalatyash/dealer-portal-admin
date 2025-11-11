import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  signal,
  SimpleChange,
  TemplateRef,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { POLARIS_BREAKPOINTS, PolarisBreakpoint } from '../_types';
import { PolarisIcon } from '../polaris-icon';
import { PolarisPaginator } from '../polaris-paginator';
import { PolarisUiBase } from '../polaris-ui-base';
import { PolarisTableColumnConfig, PolarisTableConfig } from './_classes';
import { PolarisTableBaseCell } from './polaris-table-base-cell/polaris-table-base-cell.component';
import { PolarisTableCustomCellDirective } from './polaris-table-custom-cell.directive';
import { PolarisTableCustomHeaderRowDirective } from './polaris-table-custom-header-row.directive';
import { PolarisTableTheme } from './_enums';

export type FlattenedRow<T extends { rowId?: string }> = T & {
  children?: FlattenedRow<T>[]; // Ensures recursive nesting
  level: number;                // Required for all rows
  parentRowId?: string;         // Optional (only for child rows)
};

@Component({
  selector: 'polaris-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    PolarisPaginator,
    MatIconButton,
    MatIcon,
    PolarisIcon,
  ],
  templateUrl: './polaris-table.component.html',
  styleUrls: [
    './_themes/polaris-table-base.component.scss',
    './_themes/polaris-table-default-theme.component.scss',
    './_themes/polaris-table-widget-theme.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none', opacity: 0 })),
      state('expanded', style({ height: '*', display: 'table-row', opacity: 1 })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class PolarisTable<T
  extends object & Partial<{ rowId?: string }>>
  extends PolarisUiBase
  implements OnInit, AfterViewInit, AfterContentInit, OnChanges {

  @Input() data: T[] = [];
  @Input({ required: true }) config!: PolarisTableConfig<T>;
  @Input() tableTheme: PolarisTableTheme = PolarisTableTheme.Default;
  @Input() stickyHeader: boolean = false;

  @Output('onRowClick') rowClickEmitter: EventEmitter<FlattenedRow<T>> = new EventEmitter<FlattenedRow<T>>();
  @Output('onCellClick') cellClickEmitter: EventEmitter<{ data: T; column: PolarisTableColumnConfig<T> }> = new EventEmitter<{ data: T; column: PolarisTableColumnConfig<T> }>();
  @Output('onLoadMore') paginationEmitter: EventEmitter<void> = new EventEmitter<void>();

  @ContentChildren(PolarisTableBaseCell) tableCellTemplates!: QueryList<PolarisTableBaseCell>;
  @ContentChildren(PolarisTableCustomCellDirective) customTemplates!: QueryList<PolarisTableCustomCellDirective>;
  @ContentChildren(PolarisTableCustomHeaderRowDirective) customHeaderRows!: QueryList<PolarisTableCustomHeaderRowDirective>;

  public expandedElement: WritableSignal<T | null> = signal<T | null>(null);

  @ViewChild(MatSort)
  public set matSort(sort: MatSort) {
    if (!this.config.customSort) this.dataSource.sort = sort;
  }

  public dataSource!: MatTableDataSource<FlattenedRow<T>>;
  public isCustomHeaderContentPresent: boolean = false;
  protected readonly Array: ArrayConstructor = Array;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
  }

  public ngAfterViewInit(): void {
    // Detect changes once content children are loaded
    this._changeDetectorRef.detectChanges();
  }

  public ngAfterContentInit(): void {
    this.isCustomHeaderContentPresent = this.customHeaderRows.length > 0;
  }

  public ngOnInit(): void {
    this._setDataSource();
  }

  public ngOnChanges(changes: Record<string, SimpleChange>): void {
    const dataChanges: SimpleChange = changes['data'];

    if (
      dataChanges &&
      !dataChanges.firstChange && // Ignore first change
      dataChanges.previousValue !== dataChanges.currentValue // Ensure actual change
    ) {
      this._setDataSource(dataChanges.currentValue);
    }
  }

  private _setDataSource(data?: T[]): void {
    let newData: FlattenedRow<T>[] = this._flattenData(data ?? this.data ?? []);

    // TODO: Sort data based on provided config

    // TODO: Delete this after Demo
    // This just clones the data onto the first element.children to test the table
    // This is only for testing purposes to force nested rows
    // (newData[0] as FlattenedRow<T> & { children: T[] }).children = structuredClone(newData);

    newData = this._ensureRowIds(newData);

    this.data = newData;
    this.dataSource = new MatTableDataSource<FlattenedRow<T>>(
      // Show only parents on init
      this._flattenData(newData).filter((row: FlattenedRow<T>): boolean => !row.parentRowId)
    );

    if (this.config.columnCaseInsensitive) {
      this.dataSource.sortingDataAccessor = (item: FlattenedRow<T>, property: string): string | number => {
        const value: unknown = this._getNestedProperty(item, property);

        if (typeof value === 'string') {
          return value.toLowerCase(); // Convert string values to lowercase for case-insensitive sorting
        }

        if (typeof value === 'number') {
          return value; // Return numbers as-is
        }

        if (typeof value === 'boolean') {
          return value ? 0 : 1; // Return booleans truthy first
        }

        return ''; // Default return value for other cases (avoids returning {})
      };
    }
  }

  private _flattenData(
    data: T[],
    level: number = 0,
    parentRowId?: string
  ): FlattenedRow<T>[] {
    const result: FlattenedRow<T>[] = [];

    for (const element of data) {
      const row: FlattenedRow<T> = {
        ...element,
        level,
        rowId: (element as FlattenedRow<T>).rowId,
        parentRowId,
      };

      result.push(row);

      // Check if element has children before recursion
      if (this.isParentRow(element)) {
        const children: T[] = (element as unknown as { children: T[] }).children ?? [];

        // Pass `level + 1` explicitly and track `parentRowId`
        result.push(...this._flattenData(children, level + 1, row.rowId));
      }
    }

    return result;
  }

  private _ensureRowIds(data: FlattenedRow<T>[]): (FlattenedRow<T> & { rowId: string; children: T[] })[] {
    return data.map((row: FlattenedRow<T>) => ({
      ...row,
      rowId: crypto.randomUUID(),
      children: 'children' in row && Array.isArray(row.children)
        ? this._ensureRowIds(row.children)
        : [],
    }));
  }

  /**
   * Retrieves a nested property value from an object using dot notation.
   * @param obj The object to retrieve the value from.
   * @param path The dot-notation string path (e.g., 'user.email').
   */
  private _getNestedProperty(obj: T, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object' && key in acc) {
        return (acc as Record<string, unknown>)[key];
      }

      return undefined; // Avoid runtime errors if the path doesn't exist
    }, obj);
  }

  public get displayedColumns() {
    return this.config.columns.map((column: PolarisTableColumnConfig<T>): string => column.id);
  }

  public getTableHeaderClassList(column: PolarisTableColumnConfig<T>): string[] {
    const tableHeaderClassList: string[] = [];

    // Add alignment classes dynamically
    if (column.sortable && column.alignHeader) {
      tableHeaderClassList.push(`header-${column.alignHeader}`);
    }

    // Account for icon columns dynamically
    if (column.columnType === 'icon') {
      tableHeaderClassList.push('header-icon-column');
    }

    // Add column visibility classes dynamically based on breakpoint settings
    return [...tableHeaderClassList, ...this.getBreakpointClassList(column)];
  }


  /**
   * Generates a list of CSS classes for hiding table columns based on their visibility at different breakpoints.
   *
   * @param column - The configuration object for a table column, which includes visibility settings for various breakpoints.
   * @returns An array of CSS class strings that apply Bootstrap's responsive display utilities to hide the column at specified breakpoints.
   */
  public getBreakpointClassList(column: PolarisTableColumnConfig<T>): string[] {
    // Add 'd-[breakpoint]-[displayType]' classes dynamically based on column visibility
    return POLARIS_BREAKPOINTS.map((breakpoint: PolarisBreakpoint): string  => {
      const displayType: 'table-cell' | 'none' = column.columnVisibility.includes(breakpoint) ? 'table-cell' : 'none';

      // Skip breakpoint in className for 'xs' per Bootstrap guidelines
      if (breakpoint === 'xs') {
        return `d-${displayType}`;
      } else {
        return `d-${breakpoint}-${displayType}`;
      }
    });
  }

  public getTemplateForColumn(column: PolarisTableColumnConfig<T>): TemplateRef<{ $implicit: T }> | null {
    const tableTemplate: PolarisTableBaseCell | undefined = this.tableCellTemplates.find(
      (cell: PolarisTableBaseCell): boolean => {
        return cell.columnName === column.id;
      });

    if (!tableTemplate) {
      const customTemplate: PolarisTableCustomCellDirective | undefined = this.customTemplates.find(
        (cell: PolarisTableCustomCellDirective): boolean => {
          return cell.columnName === column.id;
        });

      return customTemplate?.columnTemplate || null;
    }

    return tableTemplate?.tableColumn?.columnTemplate || null;
  }

  public onRowClicked(row: FlattenedRow<T>): void {
    this.rowClickEmitter.emit(row);
  }

  public onLoadMore(): void {
    this.paginationEmitter.emit();
  }


  /**
   * Determines if a given table row has child rows.
   *
   * @param rowOrIndex - Either the row data object or the index of the row in the table.
   * @param row - The row data object, required if the first parameter is an index.
   * @returns A type guard indicating whether the row has a 'children' property that is an array.
   */
  public isParentRow(rowOrIndex: number | T, row?: T): row is T & { children: T[] } {
    // Determine if first argument is index or row
    const actualRow: T | undefined = typeof rowOrIndex === 'number' ? row : rowOrIndex;

    if (!actualRow || typeof actualRow !== 'object') return false;

    return (
      'children' in actualRow &&
      Array.isArray((actualRow as T & { children?: unknown }).children) &&
      (actualRow as T & { children: T[] }).children.length > 0
    );
  }

  public isStandaloneRow = (index: number, row: FlattenedRow<T>): boolean => {
    return !this.isParentRow(0, row) && !this.isChildRow(0, row);
  }

  /**
   * Toggles the expansion state of a table row, allowing for the display of child rows if present.
   *
   * @param row - The data object representing the table row to be toggled.
   * @param event - The event object associated with the row click, used to stop propagation.
   *
   * @returns void - This function does not return a value.
   */
  public toggleRow(row: FlattenedRow<T>, event: Event): void {
    event.stopPropagation();

    if (!this.isParentRow(row)) return;

    const expanded: boolean = this.expandedElement()?.rowId === row.rowId;
    this.expandedElement.set(expanded ? null : row);

    queueMicrotask((): void => {
      const updatedData: FlattenedRow<T>[] = [...this.dataSource.data];

      if (expanded) {
        // Collapse: Remove child rows
        this.dataSource.data = updatedData.filter((dataRow: Partial<FlattenedRow<T>>): boolean => {
          return dataRow.parentRowId !== row.rowId;
        });
      } else {
        // Expand: Find the parent index and insert children immediately after
        const parentIndex: number = updatedData.findIndex((dataRow: Partial<FlattenedRow<T>>): boolean => {
          return dataRow.rowId === row.rowId;
        });

        if (parentIndex !== -1) {
          const children: FlattenedRow<T>[] = this._flattenData(this.data).filter((dataRow: FlattenedRow<T>): boolean => {
            return dataRow.parentRowId === row.rowId;
          });

          // Insert children right after parent
          updatedData.splice(parentIndex + 1, 0, ...children);
        }

        this.dataSource.data = updatedData;
        this._changeDetectorRef.detectChanges();

      }
    });
  }

  public isExpandedRow(parentRowId: string | undefined): boolean {
    if (!parentRowId) return false;

    return this.expandedElement()?.rowId === parentRowId;
  }

  public isChildRow = (index: number, row: FlattenedRow<T>): boolean => {
    const expandedParent: T | null = this.expandedElement();

    return expandedParent !== null && expandedParent.rowId === row.parentRowId;
  }

  public getChildLevel(child: FlattenedRow<T>): number {
    return (child as unknown as FlattenedRow<T>).level ?? 0;
  }

  public getParentRowId(child: FlattenedRow<T>): string | undefined {
    return (child as unknown as FlattenedRow<T>).parentRowId;
  }

  public getTableThemeClass(): string {
    switch (this.tableTheme) {
      case PolarisTableTheme.Widget:
        return 'polaris-table-widget-theme';
      case PolarisTableTheme.Default:
      default:
        return 'polaris-table';
    }
  }
}
