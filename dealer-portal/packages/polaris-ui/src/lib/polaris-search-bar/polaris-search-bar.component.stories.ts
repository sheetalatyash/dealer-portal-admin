import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { PolarisSearchBar } from './polaris-search-bar.component';
import { PolarisChipList } from '../polaris-chip-list/polaris-chip-list.component';
import { PolarisChip } from '../polaris-chip/polaris-chip.component';
import { PolarisIcon } from '../polaris-icon/polaris-icon.component';
import { PolarisIconButton } from '../polaris-icon-button/polaris-icon-button.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatLabel } from '@angular/material/form-field';
import { MatError } from '@angular/material/form-field';

import { PolarisSearchBarCategoryResult } from './polaris-search-bar-category-result.class';
import { PolarisSearchBarResult } from './polaris-search-bar-result.class';

const meta: Meta<PolarisSearchBar<any>> = {
  title: 'Polaris/Search Bar',
  component: PolarisSearchBar,
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatOptionModule,
        MatInputModule,
        PolarisChipList,
        PolarisChip,
        PolarisIcon,
        PolarisIconButton,
        MatLabel,
        MatError,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  args: {
    label: 'Search',
    placeholder: 'Search...',
    instructions: 'Begin typing to search',
    showLabel: true,
    testId: 'search-bar',
    hideSearchIcon: false,
    addChipOnSelectResult: true,
    searchText: '',
    formControl: new FormControl(),
    searchResultFilters: [],
    selectedSearchResults: [],
    showAutocompleteOnEmptySearch: true,
    displayedSearchResults$: of([
      new PolarisSearchBarCategoryResult({
        category: 'People',
        options: [
          new PolarisSearchBarResult({
            id: '1',
            label: 'John Doe',
            testId: 'person-john',
          }),
          new PolarisSearchBarResult({
            id: '2',
            label: 'Jane Smith',
            testId: 'person-jane',
          }),
        ],
      }),
      new PolarisSearchBarCategoryResult({
        category: 'Departments',
        options: [
          new PolarisSearchBarResult({
            id: '3',
            label: 'Engineering',
            testId: 'dept-engineering',
          }),
          new PolarisSearchBarResult({
            id: '4',
            label: 'Marketing',
            testId: 'dept-marketing',
          }),
        ],
      }),
    ])
  },
};

export default meta;
type Story = StoryObj<PolarisSearchBar<any>>;

export const Default: Story = {};
