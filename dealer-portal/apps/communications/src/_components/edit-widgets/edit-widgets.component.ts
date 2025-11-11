import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccessControlLevel, UserAccountService, Widget } from '@dealer-portal/polaris-core';
import {
  PolarisButton,
  PolarisDivider,
  PolarisHeading,
  PolarisIcon,
  PolarisLoader,
} from '@dealer-portal/polaris-ui';
import { Route } from '@enums';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { WidgetsService } from '@services';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'comm-edit-widgets',
  providers: [WidgetsService],
  imports: [
    CommonModule,
    TranslatePipe,
    PolarisButton,
    CdkDropList,
    CdkDrag,
    PolarisHeading,
    PolarisIcon,
    CdkDragPlaceholder,
    PolarisLoader,
    PolarisDivider,
  ],
  templateUrl: './edit-widgets.component.html',
  styleUrl: './edit-widgets.component.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class EditWidgetsComponent implements OnInit {
  readonly Route: typeof Route = Route;
  public changesMade: boolean = false;
  private _originalWidgetState: Widget[] = [];
  public isDragging: boolean = false;
  public isHoveringAvailableList: boolean = false;

  private _activeWidgets: BehaviorSubject<Widget[] | null> = new BehaviorSubject<Widget[] | null>(null);
  public activeWidgets$: Observable<Widget[] | null> = this._activeWidgets.asObservable();

  private _availableWidgets: BehaviorSubject<Widget[] | null> = new BehaviorSubject<Widget[] | null>(null);
  public availableWidgets$: Observable<Widget[] | null> = this._availableWidgets.asObservable();
  /**
   * Indicates whether the logged-in user is impersonating
   * **and** has `ReadWrite` impersonation permissions.
   *
   * - If the user is impersonating, returns `true` only when their
   *   impersonation permission level is `ReadWrite`.
   * - If the user is **not impersonating**, returns `true` by default.
   */
  public get hasImpersonationWriteAccess(): boolean {
    const { isImpersonating, accountImpersonationPermission } = this._userAccountService.userAccount;

    if (isImpersonating) {
      return accountImpersonationPermission === AccessControlLevel.ReadWrite;
    }

    return true;
  }

  constructor(
    private _widgetsService: WidgetsService,
    private _router: Router,
    private _translate: TranslateService,
    private _userAccountService: UserAccountService,

  ) {}

  public ngOnInit(): void {
    this._getWidgets();
  }

  private _getWidgets(): void {
    this.changesMade = false;
    this._activeWidgets.next(null);
    this._availableWidgets.next(null);

    this._widgetsService.getWidgets$().pipe(
      tap((widgets: Widget[]): void => {
        if (!widgets) return;

        const activeWidgets: Widget[] = widgets
          .filter((widget: Widget): boolean => widget.active || widget.isPinned)
          .sort((a: Widget, b: Widget): number => a.sortOrder - b.sortOrder);

        const availableWidgets: Widget[] = widgets
          .filter((widget: Widget): boolean => !widget.active && !widget.isPinned)
          .sort((a: Widget, b: Widget): number => a.sortOrder - b.sortOrder);

        this._originalWidgetState = structuredClone(activeWidgets);

        this._activeWidgets.next(activeWidgets);
        this._availableWidgets.next(availableWidgets);
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  public drop(event: CdkDragDrop<Widget[]>): void {

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Move the widget
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      // Update its active status
      const movedWidget: Widget = event.container.data[event.currentIndex];
      movedWidget.active = (event.container.id === 'activeWidgetsList');

      // Re-emit both lists
      this._activeWidgets.next([...this._activeWidgets.getValue() ?? []]);
      this._availableWidgets.next([...this._availableWidgets.getValue() ?? []]);
    }

    // Watch for any from the original state
    this._detectChanges();
  }

  private _detectChanges(): void {
    const current: Widget[] = this._activeWidgets.getValue() ?? [];
    const original: Widget[] = this._originalWidgetState ?? [];

    if (current.length !== original.length) {
      this.changesMade = true;

      return;
    }

    this.changesMade = current.some((widget: Widget, index: number): boolean =>
      widget.id !== original[index].id ||
      widget.active !== original[index].active ||
      widget.isPinned !== original[index].isPinned ||
      widget.sortOrder !== original[index].sortOrder
    );
  }

  public saveChanges(): void {
    // clone widgets while saving
    const activeWidgets: Widget[] = structuredClone(this._activeWidgets.getValue() ?? []);
    const availableWidgets: Widget[] = structuredClone(this._availableWidgets.getValue() ?? []);

    // reset the active and available lists while saving
    this._activeWidgets.next(null);
    this._availableWidgets.next(null);

    // Set the sort order for all widgets
    const sortOrderStartIndex: number = 1;
    const sortOrderBase: number = 10;
    const allWidgets: Widget[] = [...activeWidgets, ...availableWidgets].map(
      (widget: Widget, index: number): Widget => new Widget({
        ...widget,
        sortOrder: (index + sortOrderStartIndex) * sortOrderBase
      })
    );

    // Update the widgets in the API
    this._widgetsService.updateWidgets$(allWidgets).pipe(
      tap((): void => {

        // Re-emit both lists after a successful save
        this._activeWidgets.next(activeWidgets);
        this._availableWidgets.next(availableWidgets);

        // reset the original state after a successful save
        this._originalWidgetState = structuredClone(activeWidgets);
        this.changesMade = false;

        // Navigate back to the home page
        this._router.navigate([Route.Home]);
      }),
      untilDestroyed(this),
    ).subscribe();

  }

  public resetChanges(): void {
    this._getWidgets(); // Reset the widgets to their original state
  }

  public cancelChanges(): void {
    this._router.navigate([Route.Home]); // Navigate back to the home page
  }

  public removeWidget(widgetToRemove: Widget): void {
    this.changesMade = true;

    const activeWidgets: Widget[] = this._activeWidgets.value ?? [];
    const availableWidgets: Widget[] = this._availableWidgets.value ?? [];

    const index: number = activeWidgets.findIndex((widget: Widget): boolean => widget.id === widgetToRemove.id);
    if (index > -1) {
      activeWidgets.splice(index, 1);
      widgetToRemove.active = false;
      availableWidgets.push(widgetToRemove);

      this._activeWidgets.next([...activeWidgets]);
      this._availableWidgets.next([...availableWidgets]);

      this._detectChanges();
    }
  }

  public openHelpDialog(): void {
    // stub
  }

  public getWidgetHeight(active: Widget[] | null, available: Widget[] | null): number {
    const count: number = (active?.length ?? 0) + (available?.length ?? 0);

    return Math.max(count * 50, 100); // fallback to 100px if empty
  }

  public isNotPinnedPredicate(item: CdkDrag<Widget>): boolean {
    return !item.data.isPinned;
  }

  public canDeactivate(): boolean {
    if (this.changesMade) {
      return confirm(this._translate.instant('unsaved-changes-confirmation'));
    }

    return true;
  }
}
