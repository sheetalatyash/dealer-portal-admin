import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, NO_ERRORS_SCHEMA, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { BaseFilterOptions, ProductFamilyFilterOptions } from '@classes';
import { ProductLinesByFamilyFilterOptions } from '@classes/product-lines-by-family-filter-option.class';
import { ProductLineByFamily } from '@dealer-portal/polaris-core';
import { PolarisCheckbox, PolarisCheckboxGroup, PolarisExpansionPanel, PolarisGroupOption, PolarisSearchBar, PolarisSearchBarCategoryResult, PolarisSearchBarResult } from '@dealer-portal/polaris-ui';
import { ExpansionPanelDataFormat } from '@enums';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
    selector: 'as-filter-expansion-panel',
    imports: [
        CommonModule,
        PolarisCheckbox,
        PolarisCheckboxGroup,
        PolarisExpansionPanel,
        PolarisSearchBar,
        ReactiveFormsModule,
    ],
    templateUrl: './filter-expansion-panel.component.html',
    styleUrl: './filter-expansion-panel.component.scss',
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
    ]
})

export class FilterExpansionPanelComponent<T>  implements OnInit, OnChanges {
  @Input() filterTitle!: string;
  @Input() filterOptions!: BaseFilterOptions<T>;
  @Input() filterGroup!: FormGroup;
  @Input() optionsNested: boolean = false;
  @Input() optionsChipped: boolean = false;
  @Input() dataFormat: ExpansionPanelDataFormat = ExpansionPanelDataFormat.CheckboxGroup;
  @Input() searchBarPlaceholder: string = '';
  @Input() filterPanelExpanded: boolean = false;

  public selectAllControl: FormControl = new FormControl(false);
  public ExpansionPanelDataFormat: typeof ExpansionPanelDataFormat = ExpansionPanelDataFormat;
  public options?: BaseFilterOptions<T>;
  public selectAllOption: PolarisGroupOption<T>[] = [];
  public nestedOptions?: ProductLinesByFamilyFilterOptions[] = [];
  private _nestedOptionsFull?: ProductLinesByFamilyFilterOptions[] = [];

  public searchBarFormGroup: FormGroup = new FormGroup({
    options: new FormControl([])
  });

  public filtersForm!: FormGroup;
  public title: string = '';

  public ngOnInit(): void {
    this.title = this.filterTitle;
    this.options = this.filterOptions;
    this.filtersForm = this.filterGroup;

    if (this.optionsNested) {
      const selectAll: string = 'selectAll';
      this.filtersForm?.addControl(selectAll, new FormControl(false));
      this.selectAllControl = this.filtersForm.controls[selectAll] as FormControl;
    }

    if (this.dataFormat === ExpansionPanelDataFormat.SearchBar) {
      this.searchBarFormGroup.valueChanges.pipe(untilDestroyed(this))
        .subscribe(({ options }: { options: string[] }) => {
          this.filterOptions.options?.forEach((option: PolarisGroupOption<T>) => {
            this.filterGroup.controls[option.value]?.setValue(options?.includes(option.value.toString()));
          });
        });
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {

    if (changes['filterOptions'] && changes['filterOptions'].currentValue &&
      (changes['filterOptions'].currentValue instanceof ProductFamilyFilterOptions &&
      changes['filterOptions'].currentValue?.options && changes['filterOptions'].currentValue?.options.length > 0)) {

      changes['filterOptions'].currentValue.options.forEach((option: PolarisGroupOption<ProductLineByFamily>) => {
        if (option.data && option.data.productFamily && option.data?.productLines && option.data?.productLines.length > 0) {
          this._nestedOptionsFull?.push(
            new ProductLinesByFamilyFilterOptions(option.data.productFamily, option.data.productLines, this.filtersForm)
          );
        }
      });

      this.nestedOptions = this._nestedOptionsFull;
    }
  }

  public onCheckboxChange(event: MatCheckboxChange): void {

    Object.keys(this.filtersForm.controls).forEach((controlName: string) => {
      const control = this.filtersForm.controls[controlName] as FormControl;
      if (controlName !== event.source.name) {
        control.setValue(event.checked, { emitEvent: false });
      }
    });
  }

  public genericSearchResultFilter(
    allResults: PolarisSearchBarCategoryResult<string>[],
    searchText: string): PolarisSearchBarCategoryResult<string>[] {
    const searchTextLowered: string = searchText.toLowerCase();

    return allResults
      .map((categoryResult: PolarisSearchBarCategoryResult<string>) => ({
        ...categoryResult,
        options: categoryResult.options.filter((option: PolarisSearchBarResult<string>) =>
          option.value.toLowerCase().includes(searchTextLowered) ||
          categoryResult.category.toLowerCase().includes(searchTextLowered))
      }))
      .filter((categoryResult: PolarisSearchBarCategoryResult<string>) => categoryResult.options.length > 0);
  }
}
