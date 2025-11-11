import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisIconButton } from '../polaris-icon-button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PolarisIcon } from '../polaris-icon';
import { FormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { PolarisChipList } from '../polaris-chip-list';
import { PolarisChipListItem } from '../polaris-chip-list';
import { PolarisSearchBarCategoryResult } from './polaris-search-bar-category-result.class';
import { PolarisSearchBarResult } from './polaris-search-bar-result.class';
import { PolarisUiFormBase } from '../polaris-ui-form-base';
import { TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, debounceTime, EMPTY, map, Observable, Subject } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
    selector: 'polaris-search-bar',
    imports: [
        CommonModule,
        MatInputModule,
        FormsModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        PolarisIcon,
        PolarisIconButton,
        PolarisChipList,
        TranslatePipe
    ],
    templateUrl: './polaris-search-bar.component.html',
    styleUrl: './polaris-search-bar.component.scss'
})
export class PolarisSearchBar<T> extends PolarisUiFormBase<T> implements OnInit, OnChanges {
  /**
   * Default text to display in the search bar.
   */
  @Input() defaultText: string = '';

  /**
   * Whether to hide the search icon.
   */
  @Input() hideSearchIcon: boolean = false;

  /**
   * Whether to show autocomplete suggestions when the search bar is empty.
   */
  @Input() showAutocompleteOnEmptySearch: boolean = false;

  /**
   * Whether to add a chip when an autocomplete result is selected.
   */
  @Input() addChipOnSelectResult: boolean = false;

  /**
   * The search results to display in the autocomplete dropdown.
   */
  @Input() searchResults?: PolarisSearchBarCategoryResult<T>[] | PolarisSearchBarResult<T>[] | null;

  /**
   * Filters to apply to the search results.
   */
  @Input() searchResultFilters: PolarisChipListItem<T>[] = [];

  /**
   * Text to be added as a tooltip next to the label.
   */
  @Input() labelTooltip?: string;

  /**
   * Function to filter the search results based on the search text and filters.
   */
  @Input() searchResultsFilterFn?: (
    allResults: PolarisSearchBarCategoryResult<T>[],
    searchText: string,
    resultFilters?: PolarisChipListItem<T>[]
  ) => PolarisSearchBarCategoryResult<T>[];

  /**
   * Whether the search bar is clearable.
   * @type {boolean}
   */
  @Input('ui-clearable') public clearable: boolean = true;

  /**
   * Whether to clear the search result chips when the clear button is clicked.
   * @type {boolean}
   */
  @Input() public clearChipsOnClear: boolean = false;

    /**
   * Text to display in the search bar when it is empty.
   * @type {string}
   */
  @Input() public searchText: string = '';

  /**
   * Event emitter for when a search is performed.
   */
  @Output('onSearch') searchEmitter: EventEmitter<string> = new EventEmitter<string>();

  /**
   * Event emitter for when a search result is selected.
   */
  @Output('onSelectResult') resultEmitter: EventEmitter<T> = new EventEmitter<T>();

  /**
   * Event emitter for when a filter is selected.
   */
  @Output('onSelectFilter') filterEmitter: EventEmitter<PolarisChipListItem<T>> = new EventEmitter<
    PolarisChipListItem<T>
    >();

  /**
   * Event emitter for when the scroll threshold is reached.
   */
  @Output('onScroll') scrollEmitter: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Event emitter for when Enter is pressed in the search bar.
   */
  @Output('onEnter') enterEmitter: EventEmitter<string> = new EventEmitter<string>();

  /**
   * Event emitter for when the search input is cleared.
   */
  @Output('onClear') public clearEmitter: EventEmitter<void> = new EventEmitter<void>();


  @ViewChild('searchInput') private _input!: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete!: MatAutocomplete;

  /**
   * Whether the autocomplete dropdown is open.
   */
  public autocompleteOpen: boolean = false;

  /**
   * The selected search results.
   */
  public selectedSearchResults: PolarisChipListItem<T>[] = [];

  /**
   * Subject for the search text.
   */
  public searchTextSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  /**
   * Subject for the search filters.
   */
  public searchFiltersSubject: BehaviorSubject<PolarisChipListItem<T>[]> = new BehaviorSubject<
    PolarisChipListItem<T>[]
  >([]);

  /**
   * Subject for the search results.
   */
  public searchResultsSubject: BehaviorSubject<PolarisSearchBarCategoryResult<T>[]> = new BehaviorSubject<
    PolarisSearchBarCategoryResult<T>[]
  >([]);

  /**
   * Observable for the displayed search results.
   */
  public displayedSearchResults$: Observable<PolarisSearchBarCategoryResult<T>[]> = EMPTY;

  /**
   * Used to determine when to emit the scroll event. 0.8 will emit when the user has scrolled 80% of the container.
   */
  public scrollThreshold: number = 0.8;

  /**
   * The time to wait before emitting the next scroll event (in ms).
   */
  public scrollDebounceTimeMs: number = 150;

  /**
   * Scroll subject
   */
  private _scrollSubject: Subject<void> = new Subject<void>();

  public override ngOnInit(): void {
    super.ngOnInit();

    this.searchText = this.defaultText;
    this.searchTextSubject.next(this.searchText);

    if (this.addChipOnSelectResult) {
      this.selectedSearchResults = [
        ...this.searchResultsSubject.value
          .map((category: PolarisSearchBarCategoryResult<T>) =>
            category.options
              .filter((result: PolarisSearchBarResult<T>) => result.selected)
              .map(
                (result: PolarisSearchBarResult<T>) =>
                  new PolarisChipListItem<T>({
                    id: result.id,
                    label: result.label,
                    value: result.value,
                    selected: true,
                    testId: `${result.testId}-chip`,
                  })
              )
          )
          .flat(),
      ];
    }

    this.searchFiltersSubject.next([
      ...this.searchResultFilters.filter((filter: PolarisChipListItem<T>) => filter.selected),
    ]);

    if (this.addChipOnSelectResult) {
      this.formControl?.setValue([...this.selectedSearchResults.map((result: PolarisChipListItem<T>) => result.value)]);
    } else {
      this.formControl?.setValue(this.searchText);
    }

    this.displayedSearchResults$ = combineLatest([
      this.searchResultsSubject.asObservable(),
      this.searchTextSubject.asObservable().pipe(debounceTime(200)),
      this.searchFiltersSubject.asObservable(),
    ]).pipe(
      map(([searchResults, searchText, searchFilters]) => {
        if (!this.searchResultsFilterFn) {
          return searchResults;
        }

        return this.searchResultsFilterFn(searchResults, searchText, searchFilters);
      })
    );

    this._scrollSubject
      .pipe(
        debounceTime(this.scrollDebounceTimeMs),
        untilDestroyed(this),
      ).subscribe((): void => {
        this.scrollEmitter.emit();
      });
  }

  /**
   * Handles changes to input properties.
   * @param changes The changes to the input properties.
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchResults']) {
      const inputAutoCompleteResults: PolarisSearchBarCategoryResult<T>[] | PolarisSearchBarResult<T>[] = changes[
        'searchResults'
      ].currentValue as PolarisSearchBarCategoryResult<T>[] | PolarisSearchBarResult<T>[];
      let autocompleteResults: PolarisSearchBarCategoryResult<T>[] = [];
      if (!this._isCategoryOption(inputAutoCompleteResults)) {
        autocompleteResults = [{ category: '', options: [...inputAutoCompleteResults] }];
      } else {
        autocompleteResults = [...inputAutoCompleteResults];
      }
      this.searchResultsSubject.next(autocompleteResults);
    }

    if (changes['searchText']) {
      this._updateAndEmitSearchText(changes['searchText'].currentValue);
   }

  }

  /**
   * Handles input events on the search bar.
   * @param event The input event.
   */
  public onInput(event: Event): void {
    this._updateAndEmitSearchText((event.target as HTMLInputElement).value);
  }

  /**
   * Handles the selection of a filter.
   * @param selectedFilter The selected filter.
   */
  public onFilterSelected(selectedFilter: PolarisChipListItem<T>): void {
    this.filterEmitter.emit(selectedFilter);
    if (selectedFilter.selected) {
      this.searchFiltersSubject.next([...this.searchFiltersSubject.value, selectedFilter]);
    } else {
      this.searchFiltersSubject.next(
        this.searchFiltersSubject.value.filter((filter) => filter.id !== selectedFilter.id)
      );
    }
  }

  /**
   * Handles the selection of a search result.
   * @param event The autocomplete selected event.
   */
  public onResultSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedResult: PolarisSearchBarResult<T> = event.option.value;

    if (this.addChipOnSelectResult) {
      if (
        !this.selectedSearchResults.find((result: PolarisChipListItem<T>): boolean => result.id === selectedResult.id)
      ) {
        this.selectedSearchResults.push(
          new PolarisChipListItem<T>({
            id: selectedResult.id,
            label: selectedResult.label,
            value: selectedResult.value,
            selected: true,
            testId: `${selectedResult.testId}-chip`,
          })
        );
        this._emitSelectedSearchResults();
      }
    }

    this._updateAndEmitSearchText(this.getAutocompleteReplacementText(event.option.value));
    this.resultEmitter.emit(selectedResult.value as T);
  }

  /**
   * Clears the search input.
   */
  public onClearSearch(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.autocompleteOpen = this.showAutocompleteOnEmptySearch;

    if (this.addChipOnSelectResult && this.clearChipsOnClear) {
      this.selectedSearchResults = [];
      this._emitSelectedSearchResults();
    }

    this._updateAndEmitSearchText(this.getAutocompleteReplacementText(''));

    // refocus the input after clearing
    queueMicrotask(() => this._input?.nativeElement?.focus());

    this.clearEmitter.emit();
  }

  /**
   * Handles the scroll event in the autocomplete panel.
   * Emits the `scrollEmitter` event when the scroll threshold is reached.
   *
   * @param event The scroll event from the autocomplete panel.
   */
  public onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const threshold = this.scrollThreshold * target.scrollHeight;
    const current = target.scrollTop + target.clientHeight;
    if (current >= threshold || target.scrollHeight <= target.clientHeight) {
      this._scrollSubject.next();
    }
  }

  /**
   * Handles the wheel event in the autocomplete panel.
   * Emits the `scrollEmitter` event when the scroll threshold is reached.
   *
   * @param event The wheel event from the autocomplete panel.
   */
  public onWheel(event: WheelEvent): void {
    const panel = this.matAutocomplete.panel?.nativeElement;
    if (panel) {
      const threshold = this.scrollThreshold * panel.scrollHeight;
      const current = panel.scrollTop + panel.clientHeight;
      if (current >= threshold || panel.scrollHeight <= panel.clientHeight) {
        this._scrollSubject.next();
      }
    }
  }


  /**
   * Handles changes to the autocomplete panel state, binds scroll and wheel events occurring in the autocomplete panel.
   * @param open Whether the autocomplete panel is open.
   */
  public onAutocompletePanelChange(open: boolean): void {
    this.autocompleteOpen = open;

    if (open) {
      setTimeout(() => {
        const panel = this.matAutocomplete.panel?.nativeElement;

        if (panel) {
          panel.addEventListener('scroll', this.onScroll.bind(this));
          panel.addEventListener('wheel', this.onWheel.bind(this));
        }
      });
    } else {
      const panel = this.matAutocomplete.panel?.nativeElement;
      if (panel) {
        panel.removeEventListener('scroll', this.onScroll.bind(this));
        panel.removeEventListener('wheel', this.onWheel.bind(this));
      }
    }
  }

  /**
   * Removes a selected search result.
   * @param selectedResult The selected search result to remove.
   */
  public onRemoveSelectedResult(selectedResult: PolarisChipListItem<T>): void {
    this.selectedSearchResults = this.selectedSearchResults.filter(
      (result: PolarisChipListItem<T>): boolean => result.id !== selectedResult.id
    );
    this._emitSelectedSearchResults();
  }

  /**
   * Handles keydown events in the search bar.
   * Emits the `enterEmitter` event when Enter is pressed, and clears the search when Escape is pressed.
   * @param event The keyboard event.
   */
  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.enterEmitter.emit(this.searchText);
    } else if (this.clearable && event.key === 'Escape' && this.searchText.length > 0) {
      event.stopPropagation();
      this.onClearSearch();
    }
  }

  /**
   * Gets the replacement text for the autocomplete input.
   * @param result The selected result or a string.
   * @returns The replacement text.
   */
  public getAutocompleteReplacementText = (result: PolarisSearchBarResult<T> | string): string => {
    if (this.addChipOnSelectResult) {
      return '';
    }

    return typeof result === 'string' ? result : result?.label ?? '';
  };

  /**
   * Updates and emits the search text.
   * @param searchText The search text to update and emit.
   */
  private _updateAndEmitSearchText(searchText: string, emit: boolean = true): void {
    // Update input value
    this.searchText = searchText;

    if (this._input) {
      this._input.nativeElement.value = this.searchText;
    }
    this.searchTextSubject.next(this.searchText);

    // Emit search text
    if (emit) {
      this.searchEmitter.emit(this.searchText);
    }

    if (!this.addChipOnSelectResult) {
      this.formControl?.setValue(this.searchText);
      this.formControl?.markAsDirty();
    }
  }

  /**
   * Emits the selected search results.
   */
  private _emitSelectedSearchResults(): void {
    this.formControl?.setValue(this.selectedSearchResults.map((result: PolarisChipListItem<T>) => result.value));
    if (this.addChipOnSelectResult) {
      this.formControl?.markAsDirty();
    }
  }

  /**
   * Checks if the given object is a category option.
   * @param object The object to check.
   * @returns Whether the object is a category option.
   */
  private _isCategoryOption(object: unknown): object is PolarisSearchBarCategoryResult<T>[] {
    return Array.isArray(object) && object.length > 0 && typeof object[0].category !== 'undefined';
  }

}
