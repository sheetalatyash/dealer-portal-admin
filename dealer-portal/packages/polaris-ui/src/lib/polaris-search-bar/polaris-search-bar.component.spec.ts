import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisSearchBarResult } from './polaris-search-bar-result.class';
import { PolarisSearchBarCategoryResult } from './polaris-search-bar-category-result.class';
import { PolarisSearchBar } from './polaris-search-bar.component';
import { By } from '@angular/platform-browser';
import { PolarisChipListItem } from '../polaris-chip-list';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement, SimpleChange } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';

describe('PolarisSearchBar', () => {
  let component: PolarisSearchBar<string>;
  let fixture: ComponentFixture<PolarisSearchBar<string>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ReactiveFormsModule, PolarisSearchBar],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolarisSearchBar<string>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default text', async () => {
    const expected = 'default search text';

    // Set the default text and initialize the component
    component.defaultText = expected;
    component.ngOnInit();

    // Trigger change detection and wait for the next change detection cycle
    fixture.detectChanges();
    await fixture.whenStable();

    // Check the component's search text directly
    expect(component.searchText).toBe(expected);

    // Check the value of the input element
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputElement.value).toBe(expected);
  });

  it('should emit search text on input', () => {
    const expected = 'test search';
    const searchEmitterSpy = jest.spyOn(component.searchEmitter, 'emit');

    // Add search text to the input
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    inputElement.value = expected;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Check that the search text was emitted
    expect(searchEmitterSpy).toHaveBeenCalledWith(expected);
  });

  it('should have no clear button with no search text', () => {
    const expected = null;

    // Remove search text
    component.searchText = '';
    fixture.detectChanges();

    // Query the clear button and check if it exists
    const clearButton = fixture.debugElement.query(By.css('.polaris-search-bar-clear-button'));
    expect(clearButton).toBe(expected);
  });

  it('should have a clear button with search text', () => {
    // Add search text
    component.searchText = 'test';
    fixture.detectChanges();

    // Query the clear button and check if it exists
    const clearButton = fixture.debugElement.query(By.css('.polaris-search-bar-clear-button'));
    expect(clearButton).toBeDefined();
  });

  it('should clear search text when the clear button is clicked', async () => {
    const initialSearchText = 'test';
    const expectedSearchText = '';

    // Add search text and wait for changes to settle
    component.searchText = initialSearchText;
    fixture.detectChanges();
    await fixture.whenStable();

    // Check the component's property directly prior to clearing
    expect(component.searchText).toBe(initialSearchText);

    // Check the value of the input element directly prior to clearing
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputElement.value).toBe(initialSearchText);

    // Query the clear button and click it
    const clearButton = fixture.debugElement.query(By.css('.polaris-search-bar-clear-button'));
    clearButton.nativeElement.click();

    // Check the component's property directly
    expect(component.searchText).toBe(expectedSearchText);

    // Check the value of the input element
    expect(inputElement.value).toBe(expectedSearchText);
  });

  it('should display search results', async () => {
    const searchResults: PolarisSearchBarResult<string>[] = [
      new PolarisSearchBarResult<string>({ label: 'result1', value: 'result1', testId: 'result1', id: '1' }),
      new PolarisSearchBarResult<string>({ label: 'result2', value: 'result2', testId: 'result2', id: '2' }),
      new PolarisSearchBarResult<string>({ label: 'result3', value: 'result3', testId: 'result3', id: '3' }),
    ];
    const expectedCategoryCount = 1;
    const expectedOptionCount = searchResults.length;

    // Input search results
    component.searchResults = searchResults;
    component.ngOnChanges({
      searchResults: new SimpleChange(undefined, searchResults, false),
    });

    // Allow search results observable to run and settle
    await fixture.whenStable();

    // Input some text to trigger the display of the search results
    const inputElement = fixture.debugElement.query(By.css('input'));
    inputElement.nativeElement.dispatchEvent(new Event('focusin'));
    inputElement.nativeElement.value = 'test';
    inputElement.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Check the component's property directly
    expect(component.searchResultsSubject.value.length).toBe(expectedCategoryCount);

    // Query the options of the search results list and check the right number are rendered
    // Use document because search results list is rendered outside the component template
    const matOptions = document.querySelectorAll('mat-option');
    expect(matOptions.length).toBe(expectedOptionCount);

    // Check by id that each option in searchResults is rendered
    searchResults.forEach((option) => {
      const optionElement = document.querySelector(`[data-test-id="${option.testId}"]`);
      expect(optionElement).not.toBeNull();
    });
  });

  it('should display categorized search results', async () => {
    const searchResults: PolarisSearchBarCategoryResult<string>[] = [
      {
        category: 'category1',
        options: [
          new PolarisSearchBarResult<string>({ label: 'result1', value: 'result1', testId: 'result1', id: '1' }),
          new PolarisSearchBarResult<string>({ label: 'result2', value: 'result2', testId: 'result2', id: '2' }),
          new PolarisSearchBarResult<string>({ label: 'result3', value: 'result3', testId: 'result3', id: '3' }),
        ],
      },
      {
        category: 'category2',
        options: [
          new PolarisSearchBarResult<string>({ label: 'result4', value: 'result4', testId: 'result4', id: '4' }),
          new PolarisSearchBarResult<string>({ label: 'result5', value: 'result5', testId: 'result5', id: '5' }),
          new PolarisSearchBarResult<string>({ label: 'result6', value: 'result6', testId: 'result6', id: '6' }),
        ],
      },
    ];
    const expectedCategoryCount = searchResults.length;
    const expectedOptionCount = searchResults
      .map((category) => category.options.length)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Input search results
    component.searchResults = searchResults;
    component.ngOnChanges({
      searchResults: new SimpleChange(undefined, searchResults, false),
    });

    // Allow search results observable to run and settle
    await fixture.whenStable();

    // Input some text to trigger the display of the search results
    const inputElement = fixture.debugElement.query(By.css('input'));
    inputElement.nativeElement.dispatchEvent(new Event('focusin'));
    inputElement.nativeElement.value = 'test';
    inputElement.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Check the component's property directly
    expect(component.searchResultsSubject.value.length).toBe(expectedCategoryCount);

    // Query the options of the search results list and check the right number are rendered
    // Use document because search results list is rendered outside of the component template
    const matOptions = document.querySelectorAll('mat-option');
    expect(matOptions.length).toBe(expectedOptionCount);

    // Check by id that each option in  searchResults is rendered
    searchResults.forEach((category) => {
      category.options.forEach((option) => {
        const optionElement = document.querySelector(`[data-test-id="${option.testId}"]`);
        expect(optionElement).not.toBeNull();
      });
    });
  });

  it('should emit the selected result when an search result is clicked', async () => {
    const expected = 'result value';

    // Setup search results and emitter spy
    const searchResults: PolarisSearchBarResult<string>[] = [
      new PolarisSearchBarResult<string>({ label: 'result1', value: expected, testId: 'result1' }),
    ];
    const resultEmitterSpy = jest.spyOn(component.resultEmitter, 'emit');

    // Input search results
    component.searchResults = searchResults;
    component.ngOnChanges({
      searchResults: new SimpleChange(undefined, searchResults, false),
    });

    // Allow search results observable to run and settle
    await fixture.whenStable();

    // Input some text to trigger the display of the search results
    const inputElement = fixture.debugElement.query(By.css('input'));
    inputElement.nativeElement.dispatchEvent(new Event('focusin'));
    inputElement.nativeElement.value = 'test';
    inputElement.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Query the options of the search results list and click the first option
    // Use document because search results list is rendered outside the component template
    const matOptions = document.querySelectorAll('mat-option');
    expect(matOptions.length).toBe(searchResults.length);
    const optionToClick: HTMLElement = matOptions[0] as HTMLElement;
    optionToClick.click();

    // Check that the result value was emitted
    expect(resultEmitterSpy).toHaveBeenCalledWith(expected);
  });

  it('should display result filters', () => {
    const filters: PolarisChipListItem<string>[] = [
      new PolarisChipListItem<string>({ id: '1', label: 'filter1', testId: 'filter1', selected: false, value: '' }),
      new PolarisChipListItem<string>({ id: '2', label: 'filter2', testId: 'filter2', selected: true, value: '' }),
    ];

    const expectedFilterLength = filters.length;

    // Input filters results
    component.searchResultFilters = filters;
    component.ngOnInit();

    // Input some text to trigger the display of the search results
    const inputElement = fixture.debugElement.query(By.css('input'));
    inputElement.nativeElement.dispatchEvent(new Event('focusin'));
    inputElement.nativeElement.value = 'test';
    inputElement.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Query the filters of the search results list and check the right number are rendered
    // Use document because search results list is rendered outside of the component template
    const polarisChips = document.querySelectorAll('polaris-chip');
    expect(polarisChips.length).toBe(expectedFilterLength);

    // Check by id that each filter in filters is rendered
    filters.forEach((filter) => {
      const chipElement: Element | null = document.querySelector(`[data-test-id="${filter.testId}"]`);
      expect(chipElement).not.toBeNull();
    });
  });

  it('should emit the selected filter when a filter is selected', () => {
    // Setup filters results and emitter spy
    const filters: PolarisChipListItem<string>[] = [
      new PolarisChipListItem<string>({ id: '1', label: 'filter1', testId: 'filter1', selected: false, value: '' }),
      new PolarisChipListItem<string>({ id: '2', label: 'filter2', testId: 'filter2', selected: false, value: '' }),
    ];
    const filterEmitterSpy = jest.spyOn(component.filterEmitter, 'emit');

    // Input filters results
    component.searchResultFilters = filters;

    // Input some text to trigger the display of the search results
    const inputElement = fixture.debugElement.query(By.css('input'));
    inputElement.nativeElement.dispatchEvent(new Event('focusin'));
    inputElement.nativeElement.value = 'test';
    inputElement.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Query the filter of the search results list and click the first one
    // Use document because search results list is rendered outside of the component template
    const polarisChips = document.querySelectorAll('polaris-chip');
    expect(polarisChips.length).toBe(filters.length);
    const filterToClick = polarisChips[0] as HTMLElement;
    (filterToClick.firstChild as HTMLButtonElement).click();

    expect(filterEmitterSpy).toHaveBeenCalledWith(filters[0]);
  });

  it('should emit the selected filter when a filter is unselected', () => {
    // Setup filters results and emitter spy
    const filters: PolarisChipListItem<string>[] = [
      new PolarisChipListItem<string>({ id: '1', label: 'filter1', testId: 'filter1', selected: true, value: '' }),
      new PolarisChipListItem<string>({ id: '2', label: 'filter2', testId: 'filter2', selected: false, value: '' }),
    ];
    const filterEmitterSpy = jest.spyOn(component.filterEmitter, 'emit');

    // Input filters results
    component.searchResultFilters = filters;
    component.ngOnInit();

    // Input some text to trigger the display of the search results
    const inputElement = fixture.debugElement.query(By.css('input'));
    inputElement.nativeElement.dispatchEvent(new Event('focusin'));
    inputElement.nativeElement.value = 'test';
    inputElement.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Query the filter of the search results list and click the first one
    // Use document because search results list is rendered outside of the component template
    const polarisChips = document.querySelectorAll('polaris-chip');
    expect(polarisChips.length).toBe(filters.length);
    const filterToClick = polarisChips[0] as HTMLElement;
    (filterToClick.querySelector('polaris-icon') as HTMLButtonElement).click();

    expect(filterEmitterSpy).toHaveBeenCalledWith(filters[0]);
  });

  it('should display the selected result when an search result is clicked', async () => {
    // Setup search results and emitter spy
    const searchResults: PolarisSearchBarResult<string>[] = [
      new PolarisSearchBarResult<string>({ label: 'result1', value: 'result1', testId: 'result1', id: 'result1' }),
    ];

    // Input search results
    component.addChipOnSelectResult = true;
    component.showAutocompleteOnEmptySearch = true;
    component.searchResults = searchResults;
    component.ngOnChanges({
      searchResults: new SimpleChange(undefined, searchResults, false),
    });
    component.ngOnInit();

    // Allow search results observable to run and settle
    await fixture.whenStable();

    // Input some text to trigger the display of the search results
    const inputElement = fixture.debugElement.query(By.css('input'));
    inputElement.nativeElement.dispatchEvent(new Event('focusin'));

    await fixture.whenStable();
    fixture.detectChanges();

    // Query the options of the search results list and click the first option
    // Use document because search results list is rendered outside the component template
    const matOptions = document.querySelectorAll('mat-option');
    const optionToClick: HTMLElement = matOptions[0] as HTMLElement;
    optionToClick.click();

    await fixture.whenStable();
    fixture.detectChanges();

    // Query the selected search results list and ensure it is rendered
    const polarisChip = fixture.debugElement.query(By.css('polaris-chip'));
    expect(polarisChip).not.toBeNull();

    // Check by id that each selected search result is rendered as a chip
    searchResults.forEach((option) => {
      const optionElement = fixture.debugElement.query(By.css(`[data-test-id="${option.testId}-chip"]`));
      expect(optionElement).not.toBeNull();
    });
  });

  it('should display initial inputted selected search results', async () => {
    const searchResults: PolarisSearchBarResult<string>[] = [
      new PolarisSearchBarResult<string>({
        label: 'result1',
        value: 'result1',
        testId: 'result1',
        id: '1',
        selected: true,
      }),
      new PolarisSearchBarResult<string>({ label: 'result2', value: 'result2', testId: 'result2', id: '2' }),
      new PolarisSearchBarResult<string>({
        label: 'result3',
        value: 'result3',
        testId: 'result3',
        id: '3',
        selected: true,
      }),
    ];
    const expectedSelectedCount = searchResults.filter((result) => result.selected).length;

    // Input search results
    component.addChipOnSelectResult = true;
    component.searchResults = searchResults;
    component.ngOnChanges({
      searchResults: new SimpleChange(undefined, searchResults, false),
    });
    component.ngOnInit();

    // Allow search results observable to run and settle
    await fixture.whenStable();
    fixture.detectChanges();

    // Check the component's property directly
    expect(component.selectedSearchResults.length).toBe(expectedSelectedCount);

    // Query the selected search results list and check the right number are rendered
    const polarisChips = document.querySelectorAll('polaris-chip');
    expect(polarisChips.length).toBe(expectedSelectedCount);

    // Check by id that each selected search result is rendered as a chip
    searchResults
      .filter((result) => result.selected)
      .forEach((option) => {
        const optionElement = fixture.debugElement.query(By.css(`[data-test-id="${option.testId}-chip"]`));
        expect(optionElement).not.toBeNull();
      });
  });

  it('should remove the selected result when the selected search result is clicked', async () => {
    // Setup search results and emitter spy
    const searchResults: PolarisSearchBarResult<string>[] = [
      new PolarisSearchBarResult<string>({
        label: 'result1',
        value: 'result1',
        testId: 'result1',
        id: 'result1',
        selected: true,
      }),
    ];

    // Input search results
    component.addChipOnSelectResult = true;
    component.searchResults = searchResults;
    component.ngOnChanges({
      searchResults: new SimpleChange(undefined, searchResults, false),
    });
    component.ngOnInit();

    // Allow search results observable to run and settle
    await fixture.whenStable();
    fixture.detectChanges();

    // Query the selected search results list and ensure it is rendered
    let polarisChip = fixture.debugElement.query(By.css('polaris-chip'));
    expect(polarisChip).not.toBeNull();
    const polarisChipClose = polarisChip.query(By.css('polaris-icon'));
    polarisChipClose.nativeElement.click();

    // Allow search results observable to run and settle
    await fixture.whenStable();
    fixture.detectChanges();

    // Check the component's property directly
    expect(component.selectedSearchResults.length).toBe(0);

    // Query the selected search results list and ensure it is rendered
    polarisChip = fixture.debugElement.query(By.css('polaris-chip'));
    expect(polarisChip).toBeNull();
  });

  it('should not display a duplicate selected result when an already selected search result is clicked', async () => {
    // Setup search results and emitter spy
    const searchResults: PolarisSearchBarResult<string>[] = [
      new PolarisSearchBarResult<string>({
        label: 'result1',
        value: 'result1',
        testId: 'result1',
        id: 'result1',
        selected: true,
      }),
    ];
    const expectedLength = searchResults.length;

    // Input search results
    component.addChipOnSelectResult = true;
    component.showAutocompleteOnEmptySearch = true;
    component.searchResults = searchResults;
    component.ngOnChanges({
      searchResults: new SimpleChange(undefined, searchResults, false),
    });
    component.ngOnInit();

    // Allow search results observable to run and settle
    await fixture.whenStable();
    fixture.detectChanges();

    // Query the selected search results list it there's only one chip
    let polarisChips = fixture.debugElement.queryAll(By.css('polaris-chip'));
    expect(polarisChips.length).toBe(expectedLength);

    // Input some text to trigger the display of the search results
    const inputElement = fixture.debugElement.query(By.css('input'));
    inputElement.nativeElement.dispatchEvent(new Event('focusin'));

    await fixture.whenStable();
    fixture.detectChanges();

    // Query the options of the search results list and click the first option
    // Use document because search results list is rendered outside the component template
    const matOptions = document.querySelectorAll('mat-option');
    const optionToClick: HTMLElement = matOptions[0] as HTMLElement;
    optionToClick.click();

    await fixture.whenStable();
    fixture.detectChanges();

    // Query the selected search results list and ensure it is rendered
    polarisChips = fixture.debugElement.queryAll(By.css('polaris-chip'));
    expect(polarisChips.length).toBe(expectedLength);
  });

  it('should apply a filter function to the search results', async () => {
    // Setup search results and emitter spy
    const mockSearchResults: PolarisSearchBarResult<string>[] = [
      new PolarisSearchBarResult<string>({ label: 'A', value: 'result1', testId: 'result1', id: '1' }),
      new PolarisSearchBarResult<string>({ label: 'AB', value: 'result2', testId: 'result2', id: '2' }),
      new PolarisSearchBarResult<string>({ label: 'C', value: 'result2', testId: 'result3', id: '3' }),
    ];

    // Input search results
    component.searchResults = mockSearchResults;
    component.searchResultsFilterFn = (searchResults: PolarisSearchBarCategoryResult<string>[], searchText: string) => {
      const displayResults = [];
      for (const category of searchResults) {
        const resultsPerCategory = category.options.filter((result: PolarisSearchBarResult<string>) =>
          result.label.toLowerCase().includes(searchText.toLowerCase())
        );
        if (resultsPerCategory.length > 0) {
          displayResults.push({ category: category.category, options: resultsPerCategory });
        }
      }

      return displayResults;
    };

    component.ngOnChanges({
      searchResults: new SimpleChange(undefined, mockSearchResults, false),
    });

    // Allow search results observable to run and settle
    await fixture.whenStable();

    // Input some text to trigger the display of the search results
    const inputElement = fixture.debugElement.query(By.css('input'));
    inputElement.nativeElement.dispatchEvent(new Event('focusin'));
    inputElement.nativeElement.value = 'A';
    inputElement.nativeElement.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    // Query the options of the search results list and click the first option
    // Use document because search results list is rendered outside the component template
    const matOptions = document.querySelectorAll('mat-option');
    expect(matOptions.length).toBe(2);
  });

  it('should update form control value with search text', async (): Promise<void> => {
    component.addChipOnSelectResult = false;
    component.defaultText = 'test search';
    component.ngOnInit();

    fixture.detectChanges();

    // Test that the form control value is updated with the default text on initial load
    expect(component.formControl.value).toBe('test search');

    // Input some text to the search bar
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    inputElement.value = 'new search';
    inputElement.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    // Test that the form control value is updated when text is added to the search bar
    expect(component.formControl.value).toBe('new search');

    // Query the clear button and click it
    const clearButton = fixture.debugElement.query(By.css('.polaris-search-bar-clear-button'));
    clearButton.nativeElement.click();

    // Test that the form control value is updated when the clear button is clicked
    expect(component.formControl.value).toBe('');
  });

  it('should update form control value with selected search results', async (): Promise<void> => {
    const searchResults: PolarisSearchBarResult<string>[] = [
      new PolarisSearchBarResult<string>({
        label: 'result1',
        value: 'result1',
        testId: 'result1',
        id: 'result1',
        selected: false,
      }),
      new PolarisSearchBarResult<string>({
        label: 'result2',
        value: 'result2',
        testId: 'result2',
        id: 'result2',
        selected: true,
      }),
    ];
    component.addChipOnSelectResult = true;
    component.searchResults = searchResults;
    component.showAutocompleteOnEmptySearch = true;
    component.ngOnChanges({
      searchResults: new SimpleChange(undefined, searchResults, false),
    });
    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();

    // Test that the form control value is updated with the selected search results on initial load
    expect(component.formControl.value).toEqual(['result2']);

    // Input some text to trigger the display of the search results
    const inputElement: DebugElement = fixture.debugElement.query(By.css('input'));
    inputElement.nativeElement.dispatchEvent(new Event('focusin'));
    await fixture.whenStable();
    fixture.detectChanges();

    // Query the options of the search results list and click the first option
    // Use document because search results list is rendered outside the component template
    const matOptions = document.querySelectorAll('mat-option');
    const optionToClick: HTMLElement = matOptions[0] as HTMLElement;
    optionToClick.click();

    await fixture.whenStable();
    fixture.detectChanges();

    // Test that the form control value is updated when a new search result is selected
    expect(component.formControl.value).toEqual(['result2', 'result1']);

    // Query the selected search results list to remove the first selected search result
    const polarisChipClose = fixture.debugElement.query(By.css('polaris-chip')).query(By.css('polaris-icon'));
    polarisChipClose.nativeElement.click();
    await fixture.whenStable();
    fixture.detectChanges();

    // Test that the form control value is updated when a selected search result is removed
    expect(component.formControl.value).toEqual(['result1']);
  });

  it('should display error messages when form control is invalid', async (): Promise<void> => {
    // Set validators to make the form control invalid
    component.formControl.setValidators([Validators.required]);
    component.formControl.updateValueAndValidity();
    component.ngOnInit();
    fixture.detectChanges();

    // Trigger form control validation
    component.formControl.markAsTouched();
    await fixture.whenStable();
    fixture.detectChanges();

    // Check that the form control is invalid
    expect(component.formControl.invalid).toBe(true);

    // Check that error messages are displayed
    const errorMessages: DebugElement[] = fixture.debugElement.queryAll(By.css('mat-error'));
    expect(errorMessages.length).toBeGreaterThan(0);
    expect(errorMessages[0].nativeElement.textContent).toContain('required');
  });
});
