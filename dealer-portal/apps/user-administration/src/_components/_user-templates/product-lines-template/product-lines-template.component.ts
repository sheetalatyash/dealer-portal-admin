import {
  Component,
  computed,
  effect,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { User } from '@classes';
import { ProductLine as BusinessUnitProductLine, ValidationService } from '@dealer-portal/polaris-core';
import { ProductLine as AccountProductLine } from '@classes';
import { ProductLineByBusinessUnit } from '@dealer-portal/polaris-core';
import {
  PolarisCheckboxGroup,
  PolarisDivider,
  PolarisError,
  PolarisGroupOption,
  PolarisIcon,
} from '@dealer-portal/polaris-ui';
import { ORVProductLine } from '@enums';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ErrorPayload, UserAdministrationService } from '@services';
import { NestedFormValues } from '@types';
import { UserTemplateBaseComponent } from 'apps/user-administration/src/_components/_user-templates/user-template-base';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs';

export interface UnitResult {
  accountProducts: AccountProductLine[];
  formGroup: FormGroup;
  hideOnReadOnly: boolean;
  name: string;
  options: PolarisGroupOption<void>[];
}

@UntilDestroy()
@Component({
    selector: 'ua-product-lines-template',
    imports: [
      CommonModule,
      PolarisCheckboxGroup,
      ReactiveFormsModule,
      TranslatePipe,
      PolarisIcon,
      PolarisDivider,
      PolarisError,
    ],
    templateUrl: './product-lines-template.component.html',
    styleUrl: './product-lines-template.component.scss',
})
export class ProductLinesTemplateComponent extends UserTemplateBaseComponent {
  public productLinesFormData: WritableSignal<UnitResult[] | null> = signal(null);
  public productLinesFormInvalid: Signal<boolean> = computed(() => this.userAdministrationService.productLinesFormInvalid());
  public selectedProductLines: WritableSignal<AccountProductLine[]> = signal<AccountProductLine[]>([]);

  public parentProductLinesForm: FormGroup = this._formBuilder.group({});
  public originalFormValues!: ReturnType<FormGroup['getRawValue']>;
  public errorMessage!: string;
  public pageName: string = 'profile';
  public formName: string = 'productLines';

  private _orvSyncInProgress: boolean = false;

  constructor(
    public override translateService: TranslateService,
    public override userAdministrationService: UserAdministrationService,
    private _formBuilder: FormBuilder,
    private _validationService: ValidationService,
  ){
    super(translateService, userAdministrationService);

    this.errorMessage = this.translateService.instant('errors.at-least-one-product-line-selected');

    this._initProductLinesEffect();
    this._initFormEffect();
  }

  private _initProductLinesEffect(): void {
    effect(() => {
      const coreBusinessUnits: ProductLineByBusinessUnit[] | undefined = this.userAdministrationService.coreData()?.productLinesByBusinessUnit;
      const dealerProductLines: AccountProductLine[] | undefined = this.userAdministrationService.dealerOptions()?.productLines;
      const userDetails: User | null = this.userAdministrationService.userDetails();

      if (!coreBusinessUnits || !dealerProductLines || !userDetails) return;

      this._buildUnitResults(coreBusinessUnits, dealerProductLines);
    });
  }

  private _initFormEffect(): void {
    effect(() => {
      const unitResults: UnitResult[] | null = this.productLinesFormData();

      if (!unitResults) return;

      for (const unitResult of unitResults) {
        this._updateCheckboxGroupForUnit(unitResult);
        unitResult.options = this._generateOptions(unitResult.formGroup);
      }

    });
  }

  private _updateCheckboxGroupForUnit(unitResult: UnitResult): void {
    const formControlName: string = this.formName;
    const userDetails: User = this.userAdministrationService.userDetails() as User;
    const options: AccountProductLine[] = unitResult.accountProducts;
    const userSelections: AccountProductLine[] = (userDetails[formControlName] || []) as AccountProductLine[];
    const key: keyof AccountProductLine = 'productDescription';


    const updateObject: Record<string, boolean> = options.reduce(
      (checkboxStates: Record<string, boolean>, option: AccountProductLine) => {
        const keyValue = option[key] as string;

        // AddView → force all ON
        if (this.isAddView) {
          checkboxStates[keyValue] = true;
        } else {
          // EditView → respect existing selections
          checkboxStates[keyValue] = userSelections.some(
            (userSelection: AccountProductLine) => userSelection[key] === keyValue
          );
        }

        return checkboxStates;
      },
      {} as Record<string, boolean>
    );

    unitResult.formGroup.patchValue(updateObject, { emitEvent: false });
  }

  private _buildUnitResults(
    businessUnits: ProductLineByBusinessUnit[],
    accountProducts: AccountProductLine[],
  ): void {
    const results: UnitResult[] = [];

    const dealerNames: Set<string> = new Set(
      accountProducts.map((productLine: AccountProductLine) => productLine.productLineName)
    );

    // 1. build results for core business units
    businessUnits.forEach((unit: ProductLineByBusinessUnit) => {
      const matchedLines: BusinessUnitProductLine[] = unit.productLines.filter(
        (line: BusinessUnitProductLine) => !!line.name && dealerNames.has(line.name)
      );

      if (matchedLines.length === 0) return;

      const matchedDealerProducts: AccountProductLine[] = accountProducts.filter((accountProductLine: AccountProductLine) =>
        matchedLines.some((businessProductLine: BusinessUnitProductLine) =>
          businessProductLine.name === accountProductLine.productLineName)
      );

      if (matchedDealerProducts.length > 0) {
        results.push(
          this._buildSingleUnitResult(
            unit.salesBusinessUnit as string,
            matchedDealerProducts,
            matchedLines,
          )
        );
      }
    });

    // 2. handle "OTHER"
    const matchedDealerNames: Set<string> = new Set(
      results.flatMap((unitResult: UnitResult) =>
        unitResult.accountProducts.map((accountProductLine: AccountProductLine) => accountProductLine.productLineName)
      )
    );

    const unmatchedProducts: AccountProductLine[] = accountProducts.filter(
      (accountProductLine: AccountProductLine) => !matchedDealerNames.has(accountProductLine.productLineName)
    );

    if (unmatchedProducts.length > 0) {
      results.push(
        this._buildSingleUnitResult('OTHER', unmatchedProducts)
      );
    }

    this.productLinesFormData.set(results);

    // reset parent group
    this.parentProductLinesForm = this._formBuilder.group({});

    for (const unitResult of results) {
      this.parentProductLinesForm.addControl(unitResult.name, unitResult.formGroup);
    }

    // add validator: at least one selected product line
    this.parentProductLinesForm.setValidators([this._validationService.atLeastOneSelectedValidator()]);
    this.parentProductLinesForm.updateValueAndValidity();

    // Store the original form values for comparison
    this.originalFormValues = this.parentProductLinesForm.getRawValue();

    this._wireUpOrvMirroring();
    this._subscribeToParentFormGroupEvents()
  }

  private _buildSingleUnitResult(
    name: string,
    products: AccountProductLine[],
    businessUnitProducts?: BusinessUnitProductLine[],
  ): UnitResult {
    const formGroup: FormGroup = this._buildFormGroup(products, businessUnitProducts);
    const options: PolarisGroupOption<void>[] = this._generateOptions(formGroup);

    const result: UnitResult = {
      name,
      accountProducts: products,
      formGroup,
      options,
      hideOnReadOnly: Object.values(formGroup.value).every((val) => val === false),
    };

    // keep hideOnReadOnly in sync dynamically
    formGroup.valueChanges.pipe(
      tap((values) => {
        result.hideOnReadOnly = Object.values(values).every((val) => val === false);
      }),
      untilDestroyed(this),
    ).subscribe();

    return result;
  }

  private _buildFormGroup(
    options: AccountProductLine[],
    businessUnitProducts?: BusinessUnitProductLine[],
  ): FormGroup {
    const userDetails: User = this.userAdministrationService.userDetails() as User;
    const formGroup: FormGroup = this._formBuilder.group({});
    const userSelections: AccountProductLine[] = (userDetails.productLines || []);

    let sortedOptions: AccountProductLine[];

    if (businessUnitProducts && businessUnitProducts.length > 0) {
      // Sort by BusinessUnitProductLine.defaultSortOrder
      const sortOrderMap: Map<string | undefined, number | undefined> = new Map(
        businessUnitProducts.map((line: BusinessUnitProductLine) => [line.name, line.defaultSortOrder]),
      );

      sortedOptions = [...options].sort((a, b) => {
        const orderA: number = sortOrderMap.get(a.productLineName) ?? Number.MAX_SAFE_INTEGER;
        const orderB: number = sortOrderMap.get(b.productLineName) ?? Number.MAX_SAFE_INTEGER;

        return orderA - orderB;
      });
    } else {
      // 'OTHER' group — no sort info, keep as-is
      sortedOptions = options;
    }

    sortedOptions.forEach((option: AccountProductLine): void => {
      option = new AccountProductLine(option);

      const formControlName: string = option.productDescription;
      let formControlValue: boolean;

      if (this.isAddView) {
        // New user add view: checkboxes default ON
        formControlValue = true;
      } else {
        // Edit view: initialize from user details
        formControlValue = userSelections.some(
          (selection: AccountProductLine) => selection.productDescription === formControlName
        );
      }

      formGroup.addControl(formControlName, new FormControl(formControlValue));
    });

    return formGroup;
  }

  private _subscribeToParentFormGroupEvents(): void {

    this.parentProductLinesForm.valueChanges.pipe(
      tap((): void => {
        // watch for changes
        const raw: NestedFormValues = this.parentProductLinesForm.getRawValue();
        const changed: boolean = this.haveObjectsChanged(this.originalFormValues, raw);
        this.userAdministrationService.productLinesFormChanged.set(changed);

        // Keep track of selected product lines
        const selected: AccountProductLine[] = [];

        // Iterate through each business unit's FormGroup
        for (const unitResult of this.productLinesFormData() ?? []) {
          for (const product of unitResult.accountProducts) {
            const controlValue: boolean = raw[unitResult.name]?.[product.productDescription];

            if (controlValue) {
              selected.push(product);
            }
          }
        }

        this.selectedProductLines.set(selected);
      }),
      untilDestroyed(this),
    ).subscribe();

    this.parentProductLinesForm.statusChanges.pipe(
      tap(() => {
        const isInvalid: boolean = this.parentProductLinesForm.invalid;

        this.userAdministrationService.productLinesFormInvalid.set(isInvalid);

        const errorPayload: ErrorPayload = {
          page: this.pageName,
          category: this.formName,
          messages: isInvalid ? [this.errorMessage] : [],
        }
        this.onError(errorPayload);
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  private _wireUpOrvMirroring(): void {
    const orvValues: ORVProductLine[] = Object.values(ORVProductLine);

    for (const unitResult of this.productLinesFormData() ?? []) {
      for (const product of unitResult.accountProducts) {
        const productLineName: ORVProductLine = product.productLineName as ORVProductLine;
        const productDescription: string = product.productDescription;

        if (!orvValues.includes(productLineName)) continue;

        const productControl: AbstractControl | null = unitResult.formGroup.get(productDescription);
        if (!productControl) continue;

        // Only react to *user* changes (skip the initial value)
        productControl.valueChanges
          .pipe(
            // important: avoid storms & reentrancy
            tap((val: boolean) => {
              if (this._orvSyncInProgress) return;

              this._orvSyncInProgress = true;
              try {
                // Mirror this ORV value to ALL ORV controls across ALL units
                for (const mirrorUnit of this.productLinesFormData() ?? []) {
                  for (const mirrorProduct of mirrorUnit.accountProducts) {
                    const mirrorProductLineName: ORVProductLine = mirrorProduct.productLineName as ORVProductLine;
                    const mirrorProductDescription: string = mirrorProduct.productDescription;
                    if (!orvValues.includes(mirrorProductLineName)) continue;

                    const target: AbstractControl | null = mirrorUnit.formGroup.get(mirrorProductDescription);
                    if (target && target.value !== val) {
                      target.setValue(val, { emitEvent: false });
                    }
                  }
                }

                // Optional: refresh derived selections immediately
                this._updateSelectedProductLines();
                const raw: NestedFormValues = this.parentProductLinesForm.getRawValue();
                const changed: boolean = this.haveObjectsChanged(this.originalFormValues, raw);
                this.userAdministrationService.productLinesFormChanged.set(changed);
              } finally {
                this._orvSyncInProgress = false;
              }
            }),
            untilDestroyed(this),
          ).subscribe();
      }
    }
  }

  private _updateSelectedProductLines(): void {
    const raw: NestedFormValues = this.parentProductLinesForm.getRawValue();
    const selected: AccountProductLine[] = [];

    for (const unitResult of this.productLinesFormData() ?? []) {
      for (const product of unitResult.accountProducts) {
        const checked: boolean = !!raw[unitResult.name]?.[product.productDescription];
        if (checked) selected.push(product);
      }
    }

    this.selectedProductLines.set(selected);
  }
}
