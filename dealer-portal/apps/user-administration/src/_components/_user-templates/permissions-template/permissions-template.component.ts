// --- Angular ---
import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  WritableSignal,
  effect,
  signal,
  Input,
  untracked,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
import { PermissionsSelectorComponent } from '@components/_user-templates';
import { ClaimsFormGroup, PermissionNodeView, PermissionsViewModel } from '@types';

// --- Third-Party Libraries ---
import { auditTime, distinctUntilChanged, map, tap } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

// --- Application: Core Models & Enums ---
import {
  AccessControlLevel,
  AdditionalClaim,
  FuzzySearchResponse,
  FuzzySearchService,
  PageAccessoryCategory,
  PermissionPage,
  Permissions,
  ValidationService,
} from '@dealer-portal/polaris-core';
import { PermissionMode } from '@enums';

// --- Application: Services ---
import { PermissionsService, UserAdministrationService } from '@services';

// --- Application: Base & Shared Components ---
import { UserTemplateBaseComponent } from '@components/_user-templates/user-template-base';

// --- Application: UI Components ---
import {
  PolarisAccordion,
  PolarisAccordionToggle,
  PolarisCheckboxGroup,
  PolarisDivider,
  PolarisExpansionPanel,
  PolarisGroupOption,
  PolarisIcon,
  PolarisLoader,
  PolarisRadioGroup,
  PolarisSearchBar,
} from '@dealer-portal/polaris-ui';

@UntilDestroy()
@Component({
  selector: 'ua-permissions-template',
  imports: [
    CommonModule,
    PermissionsSelectorComponent,
    PolarisAccordion,
    PolarisAccordionToggle,
    PolarisCheckboxGroup,
    PolarisDivider,
    PolarisExpansionPanel,
    PolarisIcon,
    PolarisLoader,
    PolarisRadioGroup,
    PolarisSearchBar,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './permissions-template.component.html',
  styleUrl: './permissions-template.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

/**
 * Represents the permissions management template component.
 *
 * Provides a fully reactive, signal-driven UI for configuring hierarchical access controls
 * and claim-based permissions. Integrates with {@link PermissionsService} for data flow,
 * {@link FuzzySearchService} for filtering, and supports cascading and validation rules
 * for access and claims.
 */
export class PermissionsTemplateComponent extends UserTemplateBaseComponent {
  @Input() cascadeToNextAvailableOnSelectAll: boolean = true;

  // --- State Signals ---
  public permissions: WritableSignal<Permissions | null> = signal<Permissions | null>(null);
  public permissionsViewModel: WritableSignal<PermissionsViewModel | null> = signal<PermissionsViewModel | null>(null);
  public loadingPermissionsForm: WritableSignal<boolean> = signal(false);

  // --- UI Configuration ---
  public radioMinWidth: string = '95px';

  // --- Search ---
  public searchControl: FormControl<string | null> = new FormControl<string | null>(null);
  public readonly searchTerm: WritableSignal<string> = signal<string>('');

  // --- Derived ViewModel ---
  public readonly filteredPermissionsViewModel: WritableSignal<PermissionsViewModel | null> = signal<PermissionsViewModel | null>(null);

  // --- Derived Permissions Claims Form Group ---
  public permissionsWithClaims: WritableSignal<FormGroup> = signal(new FormGroup({}));

  public pageName: string = 'permissions';

  constructor(
    public override translateService: TranslateService,
    public override userAdministrationService: UserAdministrationService,
    private _formBuilder: FormBuilder,
    private _permissionsService: PermissionsService,
    private _validationService: ValidationService,
    private _fuzzySearchService: FuzzySearchService,
  ) {
    super(translateService, userAdministrationService);

    // effects
    this._initUpdatePermissionsEffect();
    this._initPermissionsFormEffect();
    this._initSaveWorkingPermissionsEffect();
    this._initSearchEffect();

    // subscriptions
    this._subscribeToSearchControlChanges();
  }

  /**
   * Initializes a reactive effect that updates the `permissions` signal based on the current {@link PermissionMode}.
   *
   * The resolution order is:
   * 1. When mode is {@link PermissionMode.Copy}: use `copiedPermissions` if available.
   * 2. When mode is {@link PermissionMode.Default}: use `defaultPermissions` if available.
   * 3. When mode is {@link PermissionMode.Manual} or any other/unknown mode: fall back to `originalPermissions` if available.
   *
   * If the selected source is `null`, the effect does not mutate `permissions` during that run.
   *
   * @remarks
   * - This effect is automatically re-run when any of the following reactive sources change within the injected service:
   *   `defaultPermissions()`, `copiedPermissions()`, `originalPermissions()`, or `activePermissionMode()`.
   * - The function does not throw. It performs early returns after a successful `permissions.set(...)` to avoid unnecessary checks.
   *
   * @private
   * @returns {void}
   */
  private _initUpdatePermissionsEffect(): void {
    effect(() => {
      const defaultPermissions: Permissions | null = this._permissionsService.defaultPermissions();
      const copiedPermissions: Permissions | null = this._permissionsService.copiedPermissions();
      const originalPermissions: Permissions | null = this._permissionsService.originalPermissions();
      const activePermissionMode: PermissionMode | null = this._permissionsService.activePermissionMode();

      switch (activePermissionMode) {
        case PermissionMode.Copy:
          if (copiedPermissions) {
            this.permissions.set(copiedPermissions);

            return;
          }
          break;

        case PermissionMode.Default:
          if (defaultPermissions) {
            this.permissions.set(defaultPermissions);

            return;
          }
          break;

        case PermissionMode.Manual:
        default:
          // Always fall back to original if nothing else
          if (originalPermissions) {
            this.permissions.set(originalPermissions);

            return;
          }
          break;
      }
    });
  }

  /**
   * Initializes a reactive effect that rebuilds the {@link PermissionsViewModel}
   * and resets the claims form state whenever the `permissions` signal changes.
   *
   * ### Behavior Overview
   * 1. **Trigger Source**
   *    - Runs automatically whenever the reactive signal `permissions()` emits a new value.
   *    - This occurs whenever `PermissionsService` updates its active permissions (e.g., via `_initUpdatePermissionsEffect`).
   *
   * 2. **Error Reset (Untracked)**
   *    - Executes within an `untracked` block to prevent creating reactive dependencies.
   *    - Clears all existing claim-related error messages by invoking `onError` with an empty message array for each control key.
   *
   * 3. **Guard Clause**
   *    - If `permissions` is `null`, no work is done; the effect terminates early.
   *
   * 4. **View Model Construction**
   *    - Calls `_buildViewModel(permissions)` to convert the domain model into a UI-ready {@link PermissionsViewModel}.
   *    - Calls `_normalizeAllPagesOnInit` to align page-level and leaf-level access selections.
   *
   * 5. **State Synchronization**
   *    - Sets `permissionsViewModel` to the newly built model.
   *    - Marks `loadingPermissionsForm` as `false` to signal UI readiness.
   *    - Calls `_updateWorkingPermissions()` to synchronize with `PermissionsService.workingPermissions`.
   *
   * 6. **Post-Initialization Validation**
   *    - Uses `queueMicrotask` to schedule `_triggerClaimsValidation()` after the microtask queue,
   *      ensuring that form controls and signals are fully updated before validation runs.
   *
   * @remarks
   * - This effect does not return a value; it performs reactive side effects.
   * - Executed automatically by Angular’s reactive signal system.
   *
   * @private
   * @returns {void}
   */
  private _initPermissionsFormEffect(): void {
    effect(() => {
      const permissions: Permissions | null = this.permissions();

      // Clear error messages for all claims without tracking dependencies.
      untracked((): void => {
        if (this.permissionsWithClaims().controls) {
          Object.keys(this.permissionsWithClaims().controls).forEach((permissionName: string) => {
            this.onError({
              page: 'permissions',
              category: permissionName,
              messages: [],
            });
          });
        }
      });

      // Guard: nothing to do if permissions are not available.
      if (permissions === null) {
        return;
      }

      const permissionsViewModel: PermissionsViewModel = this._buildViewModel(permissions);

      this._normalizeAllPagesOnInit(permissionsViewModel, permissions);
      this.permissionsViewModel.set(permissionsViewModel);
      this.loadingPermissionsForm.set(false);
      this._updateWorkingPermissions();

      queueMicrotask(() => this._triggerClaimsValidation());
    });
  }

  /**
   * Performs a full normalization pass across all top-level permission pages during initialization.
   *
   * ### Purpose
   * Ensures the UI-level {@link PermissionNodeView} tree and the domain-level {@link PermissionPage} model
   * are synchronized with respect to:
   * - Supported access control levels
   * - Default access values
   * - Parent-child uniformity
   * - Claim enablement and downgrade rules
   *
   * ### Processing Steps
   * 1. Extracts:
   *    - `pageAccessCategories` — defines the available access levels (e.g., None, Read, ReadWrite).
   *    - `permissions.pages` — the authoritative domain permission structure.
   *    - `viewModel.pages` — the UI-facing representation to be normalized.
   *
   * 2. For each page view in `viewModel.pages`:
   *    - Finds the corresponding domain page node by `contentId`.
   *    - If found, invokes `_normalizeNodeOnInit` to recursively apply access-level normalization,
   *      downgrade unsupported values, and enforce parent–child uniformity.
   *
   * 3. Nodes without a domain counterpart (mismatched `contentId`) are safely skipped.
   *
   * ### Side Effects
   * - Modifies the provided `viewModel` in place (mutating its nodes and controls).
   * - Does not emit any Angular `FormControl` events (`emitEvent: false` is enforced at lower levels).
   *
   * @param {PermissionsViewModel} viewModel - The UI-level permissions view model to normalize.
   * @param {Permissions} permissions - The domain-level permissions object used for authoritative data.
   *
   * @remarks
   * - This method is intended to be invoked once during initialization, typically after building a new view model.
   *
   * @private
   * @returns {void}
   */
  private _normalizeAllPagesOnInit(viewModel: PermissionsViewModel, permissions: Permissions): void {
    const categories: ReadonlyArray<PageAccessoryCategory> = permissions.pageAccessCategories;
    const domainPages: ReadonlyArray<PermissionPage> = permissions.pages ?? [];
    const pageViews: ReadonlyArray<PermissionNodeView> = viewModel.pages;

    for (const pageView of pageViews) {
      const pageNode: PermissionPage | undefined = domainPages.find(
        (page: PermissionPage): boolean => page.contentId === pageView.contentId,
      );

      if (pageNode) {
        this._normalizeNodeOnInit(pageView, pageNode, categories);
      }
    }
  }

  /**
   * Performs a recursive, depth-first normalization of a single permission node and its descendants.
   *
   * ### Purpose
   * Aligns the UI-level {@link PermissionNodeView} state with the domain-level {@link PermissionPage} definition,
   * ensuring all access control and claim settings are valid, supported, and consistent with hierarchy rules.
   *
   * ### Processing Steps
   * 1. **Leaf Node Handling**
   *    - Determines whether the current access control value is supported by the node’s `availablePageAccessTypes`.
   *    - If unsupported:
   *      - When `cascadeToNextAvailableOnSelectAll = true`, attempts to downgrade the level to the next
   *        supported value via {@link _pickCascadedAccessControlLevel}.
   *      - Otherwise, downgrades directly to `AccessControlLevel.None`.
   *    - Applies the normalized level to the node’s `accessFormControl` without emitting change events.
   *    - If the node has a `claimsFormGroup`, calls {@link _applyClaimsForLevel} to update claim enablement and validation.
   *
   * 2. **Parent Node Handling**
   *    - Recursively normalizes all descendant nodes first (depth-first traversal).
   *    - After normalization, recalculates the parent node’s access control value using
   *      {@link _recalculateParentUniformity} to reflect child uniformity or mixed states.
   *
   * ### Side Effects
   * - Mutates the form control state of `view.accessFormControl` and `view.claimsFormGroup` as needed.
   * - Does not emit Angular form events (`emitEvent: false`).
   * - Updates claims validation and enablement inline.
   *
   * @param {PermissionNodeView} view - The UI representation of the current permission node.
   * @param {PermissionPage} node - The corresponding domain model node providing the authoritative structure and access options.
   * @param {ReadonlyArray<PageAccessoryCategory>} categories - The full list of supported access categories for normalization.
   *
   * @remarks
   * - This method is invoked internally by {@link _normalizeAllPagesOnInit} during initialization.
   * - It is idempotent; re-running normalization yields the same result.
   *
   * @private
   * @returns {void}
   */
  private _normalizeNodeOnInit(
    view: PermissionNodeView,
    node: PermissionPage,
    categories: ReadonlyArray<PageAccessoryCategory>,
  ): void {
    const hasChildren: boolean =
      Array.isArray(view.children) && view.children.length > 0 &&
      Array.isArray(node.children) && node.children.length > 0;

    if (!hasChildren) {
      // Leaf: ensure its current value is supported; if not, downgrade.
      const current: AccessControlLevel =
        view.accessFormControl.value ?? AccessControlLevel.None;

      const availableTypes: ReadonlyArray<PageAccessoryCategory> =
        node.availablePageAccessTypes ?? [];

      const supportsCurrent: boolean = availableTypes.some(
        (category: PageAccessoryCategory): boolean => category.value === current,
      );

      const normalized: AccessControlLevel = supportsCurrent
        ? current
        : (this.cascadeToNextAvailableOnSelectAll
          ? this._pickCascadedAccessControlLevel(current, node, categories)
          : AccessControlLevel.None);

      if (normalized !== current) {
        view.accessFormControl.setValue(normalized, { emitEvent: false });
      }

      if (view.claimsFormGroup) {
        this._applyClaimsForLevel(view.claimsFormGroup, normalized);
      }

      return;
    }

    // Parent: normalize descendants first (depth-first).
    const childViews: ReadonlyArray<PermissionNodeView> = view.children ?? [];
    const childNodes: ReadonlyArray<PermissionPage> = node.children ?? [];

    for (const childView of childViews) {
      const childNode: PermissionPage | undefined = childNodes.find(
        (candidate: PermissionPage): boolean => candidate.contentId === childView.contentId,
      );

      if (!childNode) {
        continue;
      }

      this._normalizeNodeOnInit(childView, childNode, categories);
    }

    // Then compute this parent's radio from children (uniformity rule).
    this._recalculateParentUniformity(view, node, categories);
  }

  /**
   * Forces an immediate validation cycle for all claim form groups
   * managed under the root `permissionsWithClaims` form group.
   *
   * ### Purpose
   * This function ensures that all validators are executed and any
   * validation messages appear right after initialization — rather than
   * waiting for user interaction — providing immediate feedback on
   * invalid claim states.
   *
   * ### Processing Steps
   * 1. **Retrieve Root Form Group**
   *    - Accesses the top-level form group returned by `permissionsWithClaims()`,
   *      which contains all claim-related child form groups.
   *
   * 2. **Iterate Through Each Control**
   *    - For every control (typically a nested `FormGroup<ClaimsFormGroup>`):
   *      1. **Clear Validators** — Removes all existing validators so Angular resets the control’s status to `VALID`.
   *      2. **Reapply Validators** — Reinstates the original validator function and forces a revalidation cycle.
   *      3. **Mark as Touched & Dirty** — Marks controls as “touched” and “dirty” to immediately surface
   *         any validation messages bound in the UI.
   *
   * ### Side Effects
   * - Emits `statusChanges` and `valueChanges` events for each revalidated control.
   * - Marks all nested claim controls as “touched” and “dirty,” ensuring validation
   *   indicators and error messages appear on page load.
   *
   * @remarks
   * - Intended to be invoked once during component initialization (via `queueMicrotask` in `_initPermissionsFormEffect`).
   * - Safe to re-run; the validation cycle is idempotent and restores previous validator state.
   *
   * @private
   * @returns {void}
   */
  private _triggerClaimsValidation(): void {
    const root: FormGroup = this.permissionsWithClaims();

    Object.values(root.controls).forEach((control: AbstractControl): void => {
      // --- Force Angular to emit statusChanges on init ---

      // 1. Force all validators back to the VALID state
      const currentValidators: ValidatorFn | null = control.validator;
      control.clearValidators();
      control.updateValueAndValidity();

      // 2. Reapply original validators
      if (currentValidators) {
        control.setValidators(currentValidators);
        control.updateValueAndValidity();
      }

      // 3. Mark TOUCHED and DIRTY so errors show immediately
      control.markAsTouched();
      control.markAsDirty();
    });
  }

  /**
   * Initializes a reactive effect that keeps the service’s working permissions
   * synchronized with the most recent UI-level {@link PermissionsViewModel}.
   *
   * ### Purpose
   * Ensures that any changes made in the UI (via signal-driven updates,
   * form interactions, or search filtering) are reflected in the underlying
   * `PermissionsService.workingPermissions` signal in real time.
   *
   * ### Processing Steps
   * 1. **Reactive Trigger**
   *    - Subscribes to the `permissionsViewModel` signal.
   *    - Executes automatically whenever the view model changes.
   *
   * 2. **Guard Clause**
   *    - Returns early if `permissionsViewModel` is `null`
   *      (for example, before the permissions form has been built).
   *
   * 3. **Mapping and Synchronization**
   *    - Calls `_mapViewModelToPermissions` to transform the UI model
   *      back into a domain-level {@link Permissions} instance.
   *    - Uses the current `permissions()` value to preserve
   *      non-view-related metadata and properties.
   *    - Updates the `workingPermissions` writable signal within
   *      {@link PermissionsService} to keep both layers aligned.
   *
   * ### Side Effects
   * - Mutates `PermissionsService.workingPermissions` on every valid update.
   * - Does not emit Angular form events; operates entirely on signals.
   *
   * @remarks
   * - This effect should be initialized once from the component constructor.
   * - The mapping is one-way; it does not commit changes to the persisted or saved state.
   *
   * @private
   * @returns {void}
   */
  private _initSaveWorkingPermissionsEffect(): void {
    effect(() => {
      const permissionsViewModel: PermissionsViewModel | null = this.permissionsViewModel();
      if (!permissionsViewModel) return;

      const mappedPermissions: Permissions = this._mapViewModelToPermissions(
        permissionsViewModel,
        this.permissions(),
      );

      this._permissionsService.workingPermissions.set(mappedPermissions);
    });
  }

  /**
   * Initializes a reactive effect that filters the active {@link PermissionsViewModel}
   * in real time based on the current search term signal.
   *
   * ### Purpose
   * Keeps the displayed permissions tree dynamically filtered to match
   * the user’s search input, ensuring that the UI remains synchronized
   * with both `permissionsViewModel` and `searchTerm`.
   *
   * ### Processing Steps
   * 1. **Reactive Trigger**
   *    - Reacts whenever either `permissionsViewModel()` or `searchTerm()` emits a new value.
   *    - Automatically re-runs when the user types or when a new permissions set is loaded.
   *
   * 2. **Guard Clause**
   *    - If no `permissionsViewModel` exists (e.g., data not yet loaded),
   *      the effect exits early without performing any filtering.
   *
   * 3. **Filtering**
   *    - Calls `_filterViewModelPages(viewModel, term)` to apply a fuzzy
   *      match on `menuName` fields of all permission nodes.
   *    - Updates the `filteredPermissionsViewModel` signal internally.
   *
   * ### Side Effects
   * - Mutates the `filteredPermissionsViewModel` signal via `_filterViewModelPages`.
   * - Triggers downstream reactive updates in any UI elements bound to the filtered view.
   *
   * @remarks
   * - This effect runs automatically after component initialization.
   * - Designed to be lightweight; it performs no API calls and relies solely on in-memory filtering.
   *
   * @private
   * @returns {void}
   */
  private _initSearchEffect(): void {
    effect(() => {
      const viewModel: PermissionsViewModel | null = this.permissionsViewModel();
      const term: string = this.searchTerm();

      if (viewModel) {
        this._filterViewModelPages(viewModel, term);
      }
    });
  }

  /**
   * Builds a new {@link PermissionsViewModel} from the provided domain-level {@link Permissions} object.
   *
   * ### Purpose
   * Converts raw permission data from the backend or service layer into a
   * reactive, UI-ready view model used for rendering and user interaction.
   *
   * ### Processing Steps
   * 1. **Loading State**
   *    - Sets `loadingPermissionsForm` to `true` to indicate that the permissions
   *      view model and form controls are being (re)built.
   *
   * 2. **Reset Form Structure**
   *    - Clears the existing root claims form group by setting
   *      `permissionsWithClaims` to a new, empty `FormGroup`.
   *    - This ensures that all child claim form groups will be freshly registered
   *      during the subsequent `_buildNodeView` calls.
   *
   * 3. **Filter Renderable Pages**
   *    - Filters out pages that have no children to avoid rendering empty nodes.
   *    - Ensures that only pages with at least one sub-permission or category are processed.
   *
   * 4. **Recursive Node Construction**
   *    - For each renderable `PermissionPage`, calls `_buildNodeView` to construct
   *      its corresponding `PermissionNodeView`, including its children and form controls.
   *
   * 5. **Return Composed View Model**
   *    - Returns a new {@link PermissionsViewModel} object containing:
   *      - `pages`: the top-level list of `PermissionNodeView` instances.
   *      - `pageAccessoryCategories`: the access control categories copied
   *        directly from the source `Permissions` model.
   *
   * ### Side Effects
   * - Resets `permissionsWithClaims` (erasing any prior form state).
   * - Triggers a downstream reactive update when the view model is later set via `permissionsViewModel.set(...)`.
   *
   * @param {Permissions} permissions - The domain permissions object used as the source of truth.
   * @returns {PermissionsViewModel} - A fully constructed UI-level view model representing all permission pages and access categories.
   *
   * @remarks
   * - The `PermissionsViewModel` generated here is purely in-memory and not persisted.
   *
   * @private
   */
  private _buildViewModel(permissions: Permissions): PermissionsViewModel {
    this.loadingPermissionsForm.set(true);

    // reset master form group
    this.permissionsWithClaims.set(new FormGroup({}));

    const renderablePages: PermissionPage[] = (permissions.pages ?? []).filter((page: PermissionPage) => (page.children?.length ?? 0) > 0);

    return {
      pages: renderablePages.map((page: PermissionPage) => this._buildNodeView(page)),
      pageAccessoryCategories: permissions.pageAccessCategories,
    };
  }

  /**
   * Recursively constructs a {@link PermissionNodeView}—the UI-facing representation
   * of a {@link PermissionPage} domain model node—complete with form controls,
   * access options, and claim bindings.
   *
   * ### Purpose
   * Converts each node in the domain permission hierarchy into a reactive,
   * strongly typed UI structure with bidirectional data binding to form controls.
   *
   * ### Processing Steps
   * 1. **Determine Node Type**
   *    - `Leaf`: A node with no children — has a concrete access value.
   *    - `Page-level`: A top-level node in `Permissions.pages` — may aggregate children.
   *    - `Category-level`: A mid-level aggregate node within a page.
   *
   * 2. **Initialize Access Control**
   *    - Creates a `FormControl<AccessControlLevel | null>` appropriate for the node type:
   *      - Leaf → non-nullable (`AccessControlLevel`)
   *      - Page-level → nullable, starts as `null`
   *      - Category-level → nullable, starts as `null`
   *
   * 3. **Build Access Options**
   *    - Maps `pageAccessCategories` into `PolarisGroupOption<AccessControlLevel>` instances,
   *      binding each to the node’s `accessFormControl`.
   *
   * 4. **Claims Setup (if applicable)**
   *    - For nodes with `additionalClaims`:
   *      - Creates a `FormGroup<ClaimsFormGroup>` containing one control per claim.
   *      - Builds `PolarisGroupOption<AdditionalClaim>` entries for UI rendering.
   *      - Registers the group in the root `permissionsWithClaims` form group keyed by `contentId`.
   *
   * 5. **Children Recursion**
   *    - Recursively builds each child node by calling `_buildNodeView(child)`.
   *
   * 6. **Subscriptions**
   *    - Subscribes to `valueChanges` on both access and claims form controls,
   *      ensuring real-time propagation of user changes via `_updateWorkingPermissions()`.
   *
   * 7. **Rule Application**
   *    - Invokes `_applyAccessRules` and `_applyClaimsRules` to apply validation,
   *      cascading, and exclusivity rules.
   *
   * ### Returns
   * A fully initialized {@link PermissionNodeView} tree node with
   * reactive form controls and configured access/claim rules.
   *
   * ### Side Effects
   * - Registers child `FormGroup`s in the global `permissionsWithClaims` form group.
   * - Subscribes to reactive streams (automatically cleaned up via `untilDestroyed`).
   *
   * @param {PermissionPage} node - The source domain node used to build the UI representation.
   * @returns {PermissionNodeView} - The constructed and bound view model node.
   *
   * @remarks
   * - Safe to call recursively; supports arbitrary tree depth.
   * - Does not emit value change events during initialization (`emitEvent: false` used where necessary).
   *
   * @private
   */
  private _buildNodeView(node: PermissionPage): PermissionNodeView {
    const hasChildren: boolean = !!node.children?.length;
    const isPageLevel: boolean =
      hasChildren &&
      (this.permissions() as Permissions).pages.some(
        (page: PermissionPage) => page.contentId === node.contentId
      );

    let accessControl!: FormControl<AccessControlLevel | null>;

    // --- Branches ---
    if (!hasChildren) {
      // --- Leaf ---
      accessControl = new FormControl<AccessControlLevel>(
        node.access ?? AccessControlLevel.None,
        { nonNullable: true }
      );
    } else if (isPageLevel) {
      // --- Page-level ---
      // Must always reflect its own access on init
      accessControl = new FormControl<AccessControlLevel | null>(
        null,
        { nonNullable: false }
      );
    } else {
      // --- Category-level ---
      // Start as mixed (null) unless all children share the same access
      accessControl = new FormControl<AccessControlLevel | null>(
        null,
        { nonNullable: false }
      );
    }

    // --- Access options ---
    const accessOptions: PolarisGroupOption<AccessControlLevel>[] =
      (this.permissions() as Permissions).pageAccessCategories.map(
        (pageAccessoryCategory: PageAccessoryCategory): PolarisGroupOption<AccessControlLevel> => {
          return new PolarisGroupOption<AccessControlLevel>({
            value: pageAccessoryCategory.value,
            selected: accessControl.value === pageAccessoryCategory.value,
            formControlName: 'accessFormControl',
            minWidth: this.radioMinWidth,
          });
        }
      );

    // --- Claims setup (if any) ---
    let claimsGroup: FormGroup<ClaimsFormGroup> | undefined;
    let claimOptions: PolarisGroupOption<AdditionalClaim>[] | undefined;

    if (node.additionalClaims?.length) {
      const claimsAcc: ClaimsFormGroup = {};

      claimOptions = node.additionalClaims.map(
        (claim: AdditionalClaim) =>
          new PolarisGroupOption<AdditionalClaim>({
            label: claim.name,
            selected: claim.isSelected,
            formControlName: claim.name,
            data: claim,
          })
      );

      node.additionalClaims.forEach((claim: AdditionalClaim) => {
        claimsAcc[claim.name] = new FormControl<boolean>(
          claim.isSelected ?? false,
          { nonNullable: true }
        );
      });

      claimsGroup = this._formBuilder.group<ClaimsFormGroup>(claimsAcc);

      if (claimsGroup) {
        const key: string = String(node.contentId);
        const root: FormGroup = this.permissionsWithClaims();
        if (root.contains(key)) {
          root.removeControl(key);
        }
        root.addControl(key, claimsGroup);
      }
    }

    // --- Children (recursive) ---
    const children: PermissionNodeView[] | undefined = node.children?.map(
      (child: PermissionPage): PermissionNodeView => this._buildNodeView(child)
    );

    // --- Construct view model ---
    const view: PermissionNodeView = {
      contentId: node.contentId,
      menuName: node.menuName,
      accessFormControl: accessControl,
      accessOptions,
      claimsFormGroup: claimsGroup,
      claimOptions,
      children,
    };

    // --- Subscriptions ---
    view.accessFormControl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this._updateWorkingPermissions());

    if (view.claimsFormGroup) {
      view.claimsFormGroup.valueChanges
        .pipe(untilDestroyed(this))
        .subscribe(() => this._updateWorkingPermissions());
    }

    // --- Apply rules ---
    this._applyAccessRules(view, node);
    this._applyClaimsRules(view);

    return view;
  }

  /**
   * Applies all access-related business rules to a given {@link PermissionNodeView}.
   *
   * ### Purpose
   * Ensures that every node’s access control behavior aligns with business logic and hierarchy consistency,
   * by composing multiple rule handlers in a deterministic order.
   *
   * ### Processing Steps
   * 1. **Access Options Rule**
   *    - Rebuilds the node’s available access options (e.g., None, Read, ReadWrite),
   *      applying enablement or disablement logic based on what the node or its descendants support.
   *    - Implemented via {@link _applyAccessOptionsRule}.
   *
   * 2. **Parent → Children Propagation Rule**
   *    - Ensures that selecting an access level at a category or page-level node
   *      propagates that selection down to all of its children.
   *    - Implemented via {@link _applyParentToChildrenRule}.
   *
   * 3. **Children → Parent Uniformity Rule**
   *    - Recalculates the parent node’s access level based on whether all children share
   *      a uniform value (otherwise, parent remains in a “mixed” null state).
   *    - Implemented via {@link _applyChildrenToParentUniformityRule}.
   *
   * ### Execution Order
   * These rules are intentionally applied in the following sequence:
   * 1. `_applyAccessOptionsRule` — defines valid options.
   * 2. `_applyParentToChildrenRule` — handles downward propagation.
   * 3. `_applyChildrenToParentUniformityRule` — ensures hierarchical consistency upward.
   *
   * ### Side Effects
   * - Mutates the `PermissionNodeView` instance directly.
   * - May subscribe to reactive form control changes (cleaned up via `untilDestroyed`).
   *
   * @param {PermissionNodeView} view - The UI-level node whose access state and behavior are being normalized.
   * @param {PermissionPage} node - The corresponding domain model node defining valid access levels.
   * @returns {PermissionNodeView} The updated node view after all access-related rules are applied.
   *
   * @remarks
   * - This method acts as a rule aggregator; individual logic resides in the referenced helper methods.
   *
   * @private
   */
  private _applyAccessRules(
    view: PermissionNodeView,
    node: PermissionPage
  ): PermissionNodeView {
    view = this._applyAccessOptionsRule(view, node);
    view = this._applyParentToChildrenRule(view, node);
    view = this._applyChildrenToParentUniformityRule(view, node);

    return view;
  }

  /**
   * Applies all claim-related business rules to a given {@link PermissionNodeView}.
   *
   * ### Purpose
   * Enforces the hierarchical and logical constraints for additional claims
   * (fine-grained permission checkboxes) within a single permission node.
   *
   * ### Processing Steps
   * 1. **Guard Clause**
   *    - If the node has no `claimsFormGroup`, the function exits immediately.
   *      This prevents unnecessary rule execution for nodes without claims.
   *
   * 2. **Disable Rule**
   *    - Implemented by {@link _applyClaimsDisableRule}.
   *    - Disables all claim controls when the access level is `AccessControlLevel.None`
   *      and re-enables them otherwise.
   *
   * 3. **Validation Rule**
   *    - Implemented by {@link _applyClaimsValidationRule}.
   *    - Adds or removes validators dynamically based on access level
   *      (e.g., at least one claim required for `Read` or `ReadWrite`).
   *
   * 4. **Exclusivity Rule**
   *    - Implemented by {@link _applyClaimsExclusivityRule}.
   *    - Enforces mutually exclusive claim selections such as “Dealer Principal”
   *      being incompatible with any other claims in the same group.
   *
   * ### Rule Execution Order
   * Rules are intentionally applied in the above order:
   * 1. Disable Rule → ensures valid enablement state.
   * 2. Validation Rule → ensures correct validation logic for active claims.
   * 3. Exclusivity Rule → final logical enforcement layer for mutually exclusive claims.
   *
   * ### Side Effects
   * - Mutates the `FormGroup<ClaimsFormGroup>` within the node.
   * - Subscribes to reactive value change streams to maintain synchronization.
   * - May trigger revalidation and UI updates.
   *
   * @param {PermissionNodeView} permissionNodeView - The permission node view whose claims form group and rules are being applied.
   * @returns {void}
   *
   * @remarks
   * - Called automatically from `_buildNodeView` when constructing each node.
   * - Safe to re-run; idempotent with respect to existing subscriptions and validators.
   *
   * @private
   */
  private _applyClaimsRules(permissionNodeView: PermissionNodeView): void {
    if (!permissionNodeView.claimsFormGroup) {
      return;
    }

    // Run rules in sequence
    this._applyClaimsDisableRule(permissionNodeView);
    this._applyClaimsValidationRule(permissionNodeView);
    this._applyClaimsExclusivityRule(permissionNodeView);
  }

  /**
   * Applies the "Access Options" rule for a given {@link PermissionNodeView}.
   *
   * ### Purpose
   * Determines which access levels (e.g., None, Read, ReadWrite) should be
   * enabled, disabled, or hidden for a specific permission node based on the node’s
   * own capabilities and those of its descendants.
   *
   * ### Processing Steps
   * 1. **Retrieve Access Categories**
   *    - Loads `pageAccessCategories` from the current `Permissions` object.
   *    - Each category defines an available `AccessControlLevel` and associated UI label.
   *
   * 2. **Compute Node Context**
   *    - Identifies whether the node is:
   *      - A **page-level node** (top-level permission page),
   *      - A **category-level node** (nested container of permissions),
   *      - Or a **leaf node** (no children).
   *
   * 3. **Evaluate Support Conditions**
   *    - For each access category:
   *      - `supportsLevel` → whether this node itself supports the level.
   *      - `allChildrenSupport` → whether *all* descendants support the level.
   *      - `someChildSupports` → whether *at least one* descendant supports it.
   *
   * 4. **Determine Option Enablement**
   *    - For leaf nodes → disabled if unsupported.
   *    - For aggregate (page or category) nodes:
   *      - If `hideCategoryIfNoSupport = true` → option disabled unless *all* children support it.
   *      - If `false` (default, loose mode) → option disabled only if *no* children support it.
   *
   * 5. **Build Access Options**
   *    - Constructs a `PolarisGroupOption<AccessControlLevel>` for each access category,
   *      embedding enablement/disablement state, translated label, and UI metadata.
   *
   * ### Side Effects
   * - Mutates the `accessOptions` array within the provided `PermissionNodeView`.
   * - Used during initialization and subsequent re-normalization phases.
   *
   * @param {PermissionNodeView} view - The UI representation of the permission node being processed.
   * @param {PermissionPage} node - The corresponding domain permission model node.
   * @returns {PermissionNodeView} - The updated view with recalculated access options.
   *
   * @remarks
   * - This rule is typically invoked within {@link _applyAccessRules}.
   * - It does not trigger form control events or reactive updates.
   *
   * @private
   */
  private _applyAccessOptionsRule(
    view: PermissionNodeView,
    node: PermissionPage
  ): PermissionNodeView {
    const pageAccessCategories: PageAccessoryCategory[] = (this.permissions() as Permissions).pageAccessCategories;

    const hideCategoryIfNoSupport: boolean = false;

    view.accessOptions = pageAccessCategories.map((pageAccessCategory: PageAccessoryCategory): PolarisGroupOption<AccessControlLevel> => {
      const supportsLevel: boolean =
        node.availablePageAccessTypes?.some((available: PageAccessoryCategory) => available.value === pageAccessCategory.value) ?? false;

      // Node type flags
      const hasChildren: boolean = !!node.children?.length;
      const isPageLevel: boolean =
        hasChildren &&
        (this.permissions() as Permissions).pages.some(
          (page: PermissionPage) => page.contentId === node.contentId
        );
      const isCategoryLevel: boolean = hasChildren && !isPageLevel;

      const childLevels: AccessControlLevel[][] = (node.children ?? []).map(
        (child: PermissionPage) => (child.availablePageAccessTypes ?? []).map((category: PageAccessoryCategory) => category.value)
      );
      const allChildrenSupport: boolean = childLevels.every((level: AccessControlLevel[]) => level.includes(pageAccessCategory.value));
      const someChildSupports: boolean = childLevels.some((level: AccessControlLevel[]) => level.includes(pageAccessCategory.value));

      const isAggregateParent: boolean = isPageLevel || isCategoryLevel;

      const disabled: boolean = isAggregateParent
        ? (hideCategoryIfNoSupport ? !allChildrenSupport : !someChildSupports)
        : !supportsLevel;

      return new PolarisGroupOption<AccessControlLevel>({
        value: pageAccessCategory.value,
        label: isCategoryLevel
          ? this.translateService.instant('form.instructions.select-all')
          : '',
        selected: view.accessFormControl.value === pageAccessCategory.value,
        formControlName: 'accessFormControl',
        minWidth: this.radioMinWidth,
        disabled,
      });
    });

    return view;
  }

  /**
   * Applies the **Parent → Children propagation rule** for a given {@link PermissionNodeView}.
   *
   * ### Purpose
   * Ensures that when a parent category or page-level node’s access level changes,
   * the selected level automatically cascades down to all its descendants.
   * This maintains hierarchical consistency between category selections and child permissions.
   *
   * ### Processing Steps
   * 1. **Guard Clause**
   *    - If the provided `node` has no children, no propagation is required and the method returns immediately.
   *
   * 2. **Subscribe to Parent Access Changes**
   *    - Observes `view.accessFormControl.valueChanges`.
   *    - For each emitted `newLevel` (except `null` mixed state):
   *      - Invokes `_applyCategorySelection(view, node, newLevel)` to propagate the selected access level
   *        to all descendant nodes, adjusting for unsupported access levels as needed.
   *
   * 3. **Automatic Cleanup**
   *    - Uses `untilDestroyed(this)` to ensure the subscription is disposed when the component is destroyed,
   *      preventing memory leaks.
   *
   * ### Side Effects
   * - Mutates the access form controls of all child and descendant nodes.
   * - Updates claims form groups where applicable.
   * - May trigger downstream recalculations of parent uniformity.
   *
   * @param {PermissionNodeView} view - The parent permission node view being observed.
   * @param {PermissionPage} node - The corresponding domain model node defining structure and available access types.
   * @returns {PermissionNodeView} - The same view instance, after registering the propagation rule.
   *
   * @remarks
   * - This rule only attaches a reactive subscription; it does not perform any immediate updates.
   *
   * @private
   */
  private _applyParentToChildrenRule(view: PermissionNodeView, node: PermissionPage): PermissionNodeView {
    if (!node.children?.length) return view;

    view.accessFormControl.valueChanges.pipe(
      tap((newLevel: AccessControlLevel | null) => {
        if (newLevel !== null) {
          this._applyCategorySelection(view, node, newLevel);
        }
      }),
      untilDestroyed(this),
    ).subscribe();

    return view;
  }

  /**
   * Applies the **Children → Parent uniformity rule** to synchronize
   * a parent node’s access level with its child nodes.
   *
   * ### Purpose
   * Ensures that a parent node’s access control value accurately reflects the
   * collective state of its children:
   * - If all children share the same access level → parent adopts that level.
   * - If children differ in access levels → parent remains `null` (mixed state).
   *
   * ### Processing Steps
   * 1. **Guard Clause**
   *    - Returns immediately if either the domain node or view node has no children.
   *
   * 2. **Initial Uniformity Pass**
   *    - Calls {@link _recalculateParentUniformity} once to establish the parent’s
   *      correct access state based on the current children’s access levels.
   *
   * 3. **Reactive Subscription Setup**
   *    - For each child node, subscribes to its `accessFormControl.valueChanges`.
   *    - On any change, triggers a recalculation of the parent uniformity state.
   *    - Uses defensive recomputation with ID-based mapping to handle dynamic tree updates.
   *
   * 4. **Automatic Cleanup**
   *    - Subscriptions are automatically disposed using `untilDestroyed(this)` to prevent leaks.
   *
   * ### Side Effects
   * - Mutates the parent node’s access control value (`accessFormControl`).
   * - May indirectly trigger uniformity recomputations higher in the hierarchy.
   *
   * @param {PermissionNodeView} view - The parent UI node whose uniformity is being maintained.
   * @param {PermissionPage} node - The corresponding domain model node that defines children structure.
   * @returns {PermissionNodeView} - The same view instance, now synchronized with its children.
   *
   * @remarks
   * - This method ensures bidirectional consistency between parent and child access states.
   * - It is typically called inside {@link _applyAccessRules}.
   *
   * @private
   */
  private _applyChildrenToParentUniformityRule(
    view: PermissionNodeView,
    node: PermissionPage
  ): PermissionNodeView {
    const categories: PageAccessoryCategory[] = (this.permissions() as Permissions).pageAccessCategories;
    if (!node.children?.length || !view.children?.length) return view;

    // Initial pass
    this._recalculateParentUniformity(view, node, categories);

    // Subscribe to child changes (defensively)
    for (const childView of view.children) {
      childView.accessFormControl.valueChanges
        .pipe(
          tap(() => {
            // If the tree mutated, just recompute with id-mapping; it’s safe
            this._recalculateParentUniformity(view, node, categories);
          }),
          untilDestroyed(this)
        )
        .subscribe();
    }

    return view;
  }

  /**
   * Recalculates and synchronizes a parent node’s access control value
   * based on the uniformity of its child nodes’ access states.
   *
   * ### Purpose
   * Ensures that a parent’s `accessFormControl` reflects a consistent
   * access level only when **all** of its children share the same level.
   * If children differ, the parent remains in a `null` (mixed) state.
   *
   * ### Processing Steps
   * 1. **Map Children for Lookup**
   *    - Builds a lookup map of `contentId → PermissionNodeView` for efficient pairing
   *      between domain (`PermissionPage`) and UI (`PermissionNodeView`) representations.
   *
   * 2. **Iterate Through Access Levels**
   *    - For each `AccessControlLevel` in `pageAccessoryCategories`:
   *      - Computes the `expected` access level for each child using
   *        `_pickCascadedAccessControlLevel(level, childNode, pageAccessoryCategories)`.
   *      - Compares it to the child’s **actual** form control value.
   *      - If every child matches the same expected level, that level is considered uniform.
   *
   * 3. **Determine Parent Uniformity**
   *    - If a uniform level is found (`everyChildMatches === true`), the parent’s access value
   *      is updated to that level.
   *    - If no uniformity is found, the parent remains `null` (mixed).
   *
   * 4. **Prevent Event Emission**
   *    - Updates the parent’s `accessFormControl` silently (`emitEvent: false`)
   *      to avoid reactive loops or unintended side effects.
   *
   * ### Side Effects
   * - Mutates the parent node’s `accessFormControl` value.
   * - Does not emit reactive form change events.
   *
   * @param {PermissionNodeView} parentView - The parent node’s UI representation whose uniformity is recalculated.
   * @param {PermissionPage} parentNode - The corresponding domain model node providing authoritative structure.
   * @param {ReadonlyArray<PageAccessoryCategory>} pageAccessoryCategories - The list of defined access levels used for comparison.
   * @returns {void}
   *
   * @remarks
   * - This method is invoked by {@link _applyChildrenToParentUniformityRule} and during initialization.
   * - The algorithm supports variable access hierarchies and flexible category definitions.
   *
   * @private
   */
  private _recalculateParentUniformity(
    parentView: PermissionNodeView,
    parentNode: PermissionPage,
    pageAccessoryCategories: ReadonlyArray<PageAccessoryCategory>,
  ): void {
    // Map children by id for safe lookup
    const viewById = new Map<number, PermissionNodeView>(
      (parentView.children ?? []).map((node: PermissionNodeView) => [node.contentId, node])
    );

    let matched: AccessControlLevel | null = null;

    // Try each level (you can iterate strongest→weakest if you prefer)
    for (const level of pageAccessoryCategories.map(c => c.value)) {
      const everyChildMatches: boolean = (parentNode.children ?? []).every((childNode: PermissionPage) => {
        const childView: PermissionNodeView | undefined = viewById.get(childNode.contentId);
        if (!childView) return false; // treat missing view as mismatch

        // what the child *should* be if parent were `level`, per cascading
        const expected: AccessControlLevel = this._pickCascadedAccessControlLevel(
          level,
          childNode,
          pageAccessoryCategories
        );

        // actual current child value (after leaf normalization)
        const actual: AccessControlLevel =
          childView.accessFormControl.value ?? AccessControlLevel.None;

        return actual === expected;
      });

      if (everyChildMatches) {
        matched = level;
        break;
      }
    }

    if (parentView.accessFormControl.value !== matched) {
      parentView.accessFormControl.setValue(matched, { emitEvent: false });
    }
  }

  /**
   * Applies the **Claims Disable Rule** to a given {@link PermissionNodeView}.
   *
   * ### Purpose
   * Controls the enabled or disabled state of all claim controls within a node’s
   * `claimsFormGroup` based on the node’s current access level.
   *
   * ### Behavior
   * - **When `AccessControlLevel.None`:**
   *   - All claim checkboxes are deselected and disabled.
   *   - Prevents users from selecting claims when the parent permission is inactive.
   * - **When any other access level (`Read`, `ReadWrite`, etc.):**
   *   - All claim checkboxes are enabled for interaction.
   *
   * ### Processing Steps
   * 1. Defines an internal `apply` function that adjusts the state of each claim control.
   * 2. Executes `apply` immediately for the node’s current access level.
   * 3. Subscribes to the node’s `accessFormControl.valueChanges` observable
   *    so that any future access-level changes re-trigger the same rule.
   *
   * ### Side Effects
   * - Mutates form control states (enabling/disabling, resetting values).
   * - Subscribes to value changes for continuous enforcement.
   *
   * @param {PermissionNodeView} permissionNodeView - The permission node whose claim enablement rules should be applied.
   * @returns {void}
   *
   * @private
   */
  private _applyClaimsDisableRule(permissionNodeView: PermissionNodeView): void {
    const claimsFormGroup: FormGroup<ClaimsFormGroup> = permissionNodeView.claimsFormGroup as FormGroup<ClaimsFormGroup>;

    const apply = (accessLevel: AccessControlLevel | null): void => {
      if (accessLevel === AccessControlLevel.None) {
        Object.values(claimsFormGroup.controls).forEach((claimControl: FormControl<boolean>) => {
          claimControl.setValue(false, { emitEvent: false });
          claimControl.disable({ emitEvent: false });
        });
      } else {
        Object.values(claimsFormGroup.controls).forEach((claimControl: FormControl<boolean>) =>
          claimControl.enable({ emitEvent: false })
        );
      }
    };

    // Apply once on initialization
    apply(permissionNodeView.accessFormControl.value);

    // Apply again whenever access level changes
    permissionNodeView.accessFormControl.valueChanges.subscribe(apply);
  }

  /**
   * Applies the **Claims Validation Rule** to a {@link PermissionNodeView}.
   *
   * ### Purpose
   * Dynamically enforces validation logic for a node’s `claimsFormGroup`
   * based on the node’s current access level.
   *
   * ### Behavior
   * - **When `AccessControlLevel.ReadWrite` or `AccessControlLevel.Read`:**
   *   - Applies the `atLeastOneSelectedValidator` to ensure that
   *     at least one claim checkbox is selected.
   * - **For all other access levels:**
   *   - Clears validators and errors, effectively disabling validation.
   *
   * ### Processing Steps
   * 1. Retrieves the node’s `claimsFormGroup` from the root `permissionsWithClaims` form group.
   * 2. Defines an internal `apply` function that adjusts validators depending on access level.
   * 3. Executes `apply` once during initialization to sync the current access state.
   * 4. Marks the claims group as touched so validation messages are immediately visible.
   * 5. Subscribes to:
   *    - `accessFormControl.valueChanges`: reapply rules when the node’s access level changes.
   *    - `claimsFormGroup.valueChanges`: revalidate the form when individual claims toggle.
   *
   * ### Side Effects
   * - Adds or removes validators on the claims form group.
   * - Updates validation state reactively as user input changes.
   * - Mutates form validation metadata (errors, touched, dirty flags).
   *
   * @param {PermissionNodeView} permissionNodeView - The node whose claim validation behavior should be enforced.
   * @returns {void}
   *
   * @private
   */
  private _applyClaimsValidationRule(permissionNodeView: PermissionNodeView): void {
    const debounceTime: number = 50; // 50ms debounce time for valueChanges
    const claimsFormGroup : FormGroup<ClaimsFormGroup> | undefined =
      this.permissionsWithClaims().get(String(permissionNodeView.contentId)) as FormGroup<ClaimsFormGroup>;

    if (!claimsFormGroup) {
      return;
    }

    const apply = (accessLevel: AccessControlLevel | null): void => {
      if (accessLevel === AccessControlLevel.ReadWrite || accessLevel === AccessControlLevel.Read) {
        claimsFormGroup.setValidators([this._validationService.atLeastOneSelectedValidator()]);
      } else {
        claimsFormGroup.clearValidators();
        claimsFormGroup.setErrors(null);
      }
      claimsFormGroup.updateValueAndValidity({ emitEvent: true });
    };

    // Apply once on initialization
    apply(permissionNodeView.accessFormControl.value);

    // Mark touched so errors are visible immediately
    claimsFormGroup.markAllAsTouched();

    // Re-apply when access level changes
    permissionNodeView.accessFormControl.valueChanges
      .pipe(
        auditTime(debounceTime),
        tap(apply),
        untilDestroyed(this))
      .subscribe();

    // Also re-validate when any claim toggles
    claimsFormGroup.valueChanges
      .pipe(
        auditTime(debounceTime),
        tap(() => claimsFormGroup.updateValueAndValidity({ emitEvent: true })),
        untilDestroyed(this),
      ).subscribe();

    // Clears errors for claims when claims form is not INVALID
    claimsFormGroup.statusChanges
      .pipe(
        distinctUntilChanged((previous: string, current: string): boolean => previous === current),
        auditTime(debounceTime),
        tap((status: string) => {
          if (status !== 'INVALID') {
            this.onError({
              page: this.pageName,
              category: permissionNodeView.menuName,
              messages: [],
            });
          }
        }),
        untilDestroyed(this),
      ).subscribe();
  }

  /**
   * Applies the **Claims Exclusivity Rule** for a given {@link PermissionNodeView}.
   *
   * ### Purpose
   * Enforces mutual exclusivity between the `"Dealer Principal"` claim and
   * all other claims within the same `claimsFormGroup`.
   *
   * ### Behavior
   * - **When `"Dealer Principal"` is selected:**
   *   - Automatically deselects all other claims in the same group.
   * - **When any other claim is selected:**
   *   - Automatically deselects `"Dealer Principal"`, ensuring it cannot coexist.
   *
   * ### Processing Steps
   * 1. Retrieves the `"Dealer Principal"` form control.
   * 2. Subscribes to its `valueChanges`:
   *    - If selected, iterates over all other claim controls and clears them.
   * 3. Subscribes to each non–Dealer Principal claim’s `valueChanges`:
   *    - If any are selected while `"Dealer Principal"` is active, it is deselected.
   *
   * ### Side Effects
   * - Mutates form control values silently (`emitEvent: false`).
   * - Keeps form state logically consistent at all times.
   *
   * @param {PermissionNodeView} permissionNodeView - The permission node containing the claim form group to which exclusivity applies.
   * @returns {void}
   *
   * @private
   */
  private _applyClaimsExclusivityRule(permissionNodeView: PermissionNodeView): void {
    const claimsFormGroup: FormGroup<ClaimsFormGroup> =
      permissionNodeView.claimsFormGroup as FormGroup<ClaimsFormGroup>;

    const dealerPrincipalControl: FormControl<boolean> | null =
      claimsFormGroup.get('Dealer Principal') as FormControl<boolean> | null;

    if (!dealerPrincipalControl) return;

    // If Dealer Principal is selected → deselect all other claims
    dealerPrincipalControl.valueChanges.subscribe((isSelected: boolean) => {
      if (isSelected) {
        for (const [claimName, control] of Object.entries(claimsFormGroup.controls)) {
          if (claimName !== 'Dealer Principal') {
            control.setValue(false, { emitEvent: false });
          }
        }
      }
    });

    // If any other claim is selected → deselect Dealer Principal
    for (const [claimName, control] of Object.entries(claimsFormGroup.controls)) {
      if (claimName === 'Dealer Principal') continue;

      control.valueChanges.subscribe((isSelected: boolean) => {
        if (isSelected && dealerPrincipalControl.value) {
          dealerPrincipalControl.setValue(false, { emitEvent: false });
        }
      });
    }
  }

  /**
   * Applies a **category-level access selection** to all descendant permission nodes.
   *
   * ### Purpose
   * Ensures that when a user selects an access level at a category or page-level node,
   * all child nodes inherit that level (or the closest supported level) in a consistent,
   * cascading manner.
   *
   * ### Behavior
   * - Propagates the parent’s selected access level (`selectedLevel`) to all child nodes.
   * - If a child does **not** support the selected level:
   *   - Falls back to the next available supported level (if `cascadeToNextAvailableOnSelectAll` is enabled).
   *   - Otherwise, sets the access level to `AccessControlLevel.None`.
   * - For each updated child node:
   *   - Updates its `accessFormControl` without emitting change events.
   *   - Applies corresponding claim enable/disable and validation rules via `_applyClaimsForLevel()`.
   *   - Recursively applies cascading behavior to grandchildren (nested categories).
   *
   * ### Processing Steps
   * 1. Guard clause: skips processing if the node has no children.
   * 2. Iterates over each child node:
   *    - Determines the appropriate level to apply (`levelToApply`).
   *    - Updates its access control and claims group.
   *    - Recursively cascades if it has its own descendants.
   * 3. Recalculates parent uniformity to ensure consistent state.
   * 4. Updates the working permissions model to reflect the new hierarchy state.
   *
   * ### Side Effects
   * - Mutates child form control values silently (`emitEvent: false`).
   * - Triggers updates to the global `workingPermissions` signal.
   *
   * @param {PermissionNodeView} permissionNodeView - The parent node whose access selection is being applied.
   * @param {PermissionPage} permissionPageNode - The corresponding domain model node representing the same hierarchy branch.
   * @param {AccessControlLevel} selectedLevel - The access level selected by the user at the category level.
   * @returns {void}
   *
   * @private
   */
  private _applyCategorySelection(
    permissionNodeView: PermissionNodeView,
    permissionPageNode: PermissionPage,
    selectedLevel: AccessControlLevel
  ): void {
    if (!permissionNodeView.children?.length) return;

    const pageAccessCategories: PageAccessoryCategory[] =
      (this.permissions() as Permissions).pageAccessCategories;

    for (const childView of permissionNodeView.children) {
      const childNode: PermissionPage | undefined =
        (permissionPageNode.children ?? []).find(
          (child: PermissionPage) => child.contentId === childView.contentId
        );

      const levelToApply: AccessControlLevel = this.cascadeToNextAvailableOnSelectAll
        ? this._pickCascadedAccessControlLevel(selectedLevel, childNode, pageAccessCategories)
        : ((childNode?.availablePageAccessTypes ?? []).some((category: PageAccessoryCategory) => category.value === selectedLevel)
          ? selectedLevel
          : AccessControlLevel.None);

      // Assign selected level if supported, otherwise force None
      childView.accessFormControl.setValue(levelToApply, { emitEvent: false });

      // Apply claim rules if the child has a claims form group
      if (childView.claimsFormGroup) {
        this._applyClaimsForLevel(
          childView.claimsFormGroup,
          levelToApply
        );
      }

      // Recurse: if this child is an aggregate (category), push to its descendants too
      if (childView.children?.length && childNode?.children?.length) {
        this._cascadeAccessDown(childView, childNode, levelToApply, pageAccessCategories);
      }
    }

    // After the batch update, run a single uniformity recompute
    this._recalculateParentUniformity(
      permissionNodeView,
      permissionPageNode,
      pageAccessCategories
    );

    this._updateWorkingPermissions();

    queueMicrotask(() => this._triggerClaimsValidation());
  }

  /**
   * Recursively cascades an inherited access level to all descendant nodes
   * in the permission tree hierarchy.
   *
   * ### Purpose
   * Ensures that when an access level is applied at a parent node, it correctly
   * propagates to all nested child nodes — respecting each child’s supported
   * access types and claim configuration.
   *
   * ### Behavior
   * - For each child node:
   *   - Determines the appropriate `AccessControlLevel` to apply based on:
   *     - Whether `cascadeToNextAvailableOnSelectAll` is enabled.
   *     - The child node’s list of supported `availablePageAccessTypes`.
   *   - Sets the child’s `accessFormControl` value silently (`emitEvent: false`).
   *   - Updates the child’s claim state through `_applyClaimsForLevel()`.
   *   - Recursively cascades to deeper descendants.
   *
   * ### Processing Steps
   * 1. Iterates through all children of the given parent node.
   * 2. Matches each `PermissionNodeView` to its corresponding `PermissionPage` by `contentId`.
   * 3. Computes the most appropriate level (`levelToApply`).
   * 4. Updates the access control and claims group for that child.
   * 5. Repeats recursively for all sub-branches.
   *
   * ### Side Effects
   * - Mutates form control values across multiple levels of the hierarchy.
   * - Updates claim enablement and validation state for each affected node.
   *
   * @param {PermissionNodeView} parentView - The parent UI node initiating the cascade.
   * @param {PermissionPage} parentNode - The corresponding domain node representing the same branch.
   * @param {AccessControlLevel} inheritedLevel - The access level inherited from the parent node.
   * @param {PageAccessoryCategory[]} categories - The list of defined access level categories.
   * @returns {void}
   *
   * @private
   */
  private _cascadeAccessDown(
    parentView: PermissionNodeView,
    parentNode: PermissionPage,
    inheritedLevel: AccessControlLevel,
    categories: PageAccessoryCategory[]
  ): void {
    for (const childView of parentView.children ?? []) {
      const childNode: PermissionPage | undefined =
        (parentNode.children ?? []).find((page: PermissionPage) => page.contentId === childView.contentId);

      const levelToApply: AccessControlLevel = this.cascadeToNextAvailableOnSelectAll
        ? this._pickCascadedAccessControlLevel(inheritedLevel, childNode, categories)
        : ((childNode?.availablePageAccessTypes ?? []).some((category: PageAccessoryCategory) => category.value === inheritedLevel)
          ? inheritedLevel
          : AccessControlLevel.None);

      childView.accessFormControl.setValue(levelToApply, { emitEvent: false });

      if (childView.claimsFormGroup) {
        this._applyClaimsForLevel(childView.claimsFormGroup, levelToApply);
      }

      if (childView.children?.length && childNode?.children?.length) {
        this._cascadeAccessDown(childView, childNode, levelToApply, categories);
      }
    }
  }

  /**
   * Applies the appropriate **claims enablement and validation rules**
   * for a given access control level.
   *
   * ### Purpose
   * Ensures the state of all claim controls within a `claimsFormGroup`
   * reflects the selected access level of their associated permission node.
   *
   * ### Behavior
   * - **When `AccessControlLevel.None`:**
   *   - Deselects and disables all claim checkboxes.
   *   - Clears all validators to prevent validation errors.
   * - **When any higher access level (e.g., `Read`, `ReadWrite`):**
   *   - Enables all claim controls for interaction.
   *   - Applies the `atLeastOneSelectedValidator` to require at least one claim.
   *
   * ### Processing Steps
   * 1. Evaluates the access level.
   * 2. Iterates over all claim controls to enable or disable them accordingly.
   * 3. Applies or clears form-level validators.
   * 4. Updates the form group’s validity to reflect the new state.
   *
   * ### Side Effects
   * - Mutates form control values and states silently (`emitEvent: false`).
   * - Modifies validation configuration and state on the provided `FormGroup`.
   *
   * @param {FormGroup<ClaimsFormGroup>} claimsFormGroup - The form group containing individual claim checkboxes.
   * @param {AccessControlLevel} level - The current access level determining claim availability.
   * @returns {void}
   *
   * @private
   */
  private _applyClaimsForLevel(
    claimsFormGroup: FormGroup<ClaimsFormGroup>,
    level: AccessControlLevel
  ): void {
    if (level === AccessControlLevel.None) {
      // Deselect and disable all claims
      Object.values(claimsFormGroup.controls).forEach((control: FormControl<boolean>) => {
        control.setValue(false, { emitEvent: false });
        control.disable({ emitEvent: false });
      });
      claimsFormGroup.clearValidators();
    } else {
      // Enable all claims
      Object.values(claimsFormGroup.controls).forEach((control: FormControl<boolean>) =>
        control.enable({ emitEvent: false })
      );
      claimsFormGroup.setValidators([this._validationService.atLeastOneSelectedValidator(),]);
    }

    // Always update validity after modifications
    claimsFormGroup.updateValueAndValidity();
  }

  /**
   * Filters the pages within a {@link PermissionsViewModel} using a fuzzy search term.
   *
   * ### Purpose
   * Provides responsive, fuzzy search functionality for the permissions UI,
   * allowing users to quickly locate specific permission pages or subpages by name.
   *
   * ### Behavior
   * - When the search term is empty or whitespace-only:
   *   - Restores the full, unfiltered view model (`filteredPermissionsViewModel` = `viewModel`).
   * - When a valid search term is provided:
   *   - Performs a fuzzy search on all flattened permission nodes (across all hierarchy levels)
   *     matching the node’s `menuName`.
   *   - Filters and reconstructs only the subset of nodes that match or contain matching descendants.
   *
   * ### Processing Steps
   * 1. Guard clause — exits early if `term` is empty or whitespace.
   * 2. Flattens all nodes in `viewModel.pages` into a single array via `_flattenNodes`.
   * 3. Executes a fuzzy search using `_fuzzySearchService.performSearch`, configured with:
   *    - key: `"menuName"`
   *    - threshold: `0.2` (fairly strict match)
   *    - ignores location bias
   * 4. Builds a `Set<number>` of matching node IDs for quick lookup.
   * 5. Maps each top-level page through `_filterNode` to retain matching nodes or those containing matches.
   * 6. Updates `filteredPermissionsViewModel` with the resulting filtered hierarchy.
   *
   * ### Side Effects
   * - Mutates the `filteredPermissionsViewModel` signal with the filtered data.
   * - Triggers reactivity updates in the view layer.
   *
   * @param {PermissionsViewModel} viewModel - The source permissions view model to filter.
   * @param {string} term - The current search query entered by the user.
   * @returns {void}
   *
   * @private
   */
  private _filterViewModelPages(viewModel: PermissionsViewModel, term: string): void {
    if (!term || term.trim().length === 0) {
      this.filteredPermissionsViewModel.set(viewModel);

      return;
    }

    const flatNodes: PermissionNodeView[] = this._flattenNodes(viewModel.pages);

    const { results }: FuzzySearchResponse<PermissionNodeView> =
      this._fuzzySearchService.performSearch<PermissionNodeView>({
        items: flatNodes,
        query: term,
        configuration: {
          keys: ['menuName'],
          threshold: 0.2,
          minMatchCharacterLength: 1,
          ignoreLocation: true,
        },
      });

    const matchingIds: Set<number> = new Set<number>(
      results.map((node: PermissionNodeView) => node.contentId)
    );

    const filteredPages: PermissionNodeView[] = viewModel.pages
      .map((page: PermissionNodeView) => this._filterNode(page, matchingIds))
      .filter((page: PermissionNodeView | null): page is PermissionNodeView => page !== null);

    this.filteredPermissionsViewModel.set({
      ...viewModel,
      pages: filteredPages,
    });
  }

  /**
   * Recursively filters a {@link PermissionNodeView} tree based on a set of matching content IDs.
   *
   * ### Purpose
   * Retains only those permission nodes (and their hierarchical parents) that
   * either match the provided `matchingIds` or contain descendants that do.
   *
   * ### Behavior
   * - If the node itself matches (`contentId` is in `matchingIds`), it is preserved.
   * - If the node has children:
   *   - Recursively filters each child node.
   *   - Keeps only those with a match or matching descendants.
   * - If neither the node nor any descendants match, the node is pruned (returns `null`).
   *
   * ### Processing Steps
   * 1. Check if the current node matches (`selfMatches`).
   * 2. If no children exist, return the node only if `selfMatches` is `true`.
   * 3. If the node has children, recursively filter them.
   * 4. If all children are removed and the node itself doesn’t match, return `null`.
   * 5. Otherwise, return a shallow clone of the node with filtered children.
   *
   * ### Side Effects
   * - None; this function is pure and does not mutate the input nodes.
   *
   * @param {PermissionNodeView} node - The current permission node being evaluated.
   * @param {Set<number>} matchingIds - The set of `contentId` values representing matches from fuzzy search.
   * @returns {PermissionNodeView | null} A filtered copy of the node tree containing only matching or relevant descendants, or `null` if no match exists.
   *
   * @private
   */
  private _filterNode(
    node: PermissionNodeView,
    matchingIds: Set<number>
  ): PermissionNodeView | null {
    const selfMatches: boolean = matchingIds.has(node.contentId);

    if (!node.children?.length) {
      return selfMatches ? node : null;
    }

    const filteredChildren: PermissionNodeView[] = node.children
      .map((child: PermissionNodeView) => this._filterNode(child, matchingIds))
      .filter((child: PermissionNodeView | null): child is PermissionNodeView => child !== null);

    if (filteredChildren.length === 0 && !selfMatches) {
      return null;
    }

    return { ...node, children: filteredChildren };
  }

  /**
   * Flattens a hierarchical tree of {@link PermissionNodeView} objects
   * into a single linear array containing all nodes at every depth.
   *
   * ### Purpose
   * Converts the nested permissions structure into a flat collection
   * to simplify operations like fuzzy searching or batch traversal.
   *
   * ### Behavior
   * - Performs a **depth-first traversal** of the input node hierarchy.
   * - Pushes each node (including children and grandchildren) into a
   *   shared accumulator array (`allNodes`).
   * - Returns a new array containing every node in the original hierarchy.
   *
   * ### Processing Steps
   * 1. Iterate through each node in the provided array.
   * 2. Add the current node to the accumulator.
   * 3. If the node has children, recursively flatten those children and
   *    append the result.
   * 4. Return the final flattened array.
   *
   * ### Side Effects
   * - None; this function is pure and does not mutate the input.
   *
   * @param {PermissionNodeView[]} nodes - The list of root-level permission nodes to flatten.
   * @returns {PermissionNodeView[]} A flat array containing all permission nodes in depth-first order.
   *
   * @private
   */
  private _flattenNodes(nodes: PermissionNodeView[]): PermissionNodeView[] {
    const allNodes: PermissionNodeView[] = [];
    for (const node of nodes) {
      allNodes.push(node);
      if (node.children?.length) {
        allNodes.push(...this._flattenNodes(node.children));
      }
    }

    return allNodes;
  }

  /**
   * Subscribes to value changes from the `searchControl` form control and updates
   * the reactive `searchTerm` signal accordingly.
   *
   * ### Purpose
   * Synchronizes the search input field with the internal reactive state (`searchTerm`),
   * ensuring that downstream reactive effects (such as `_initSearchEffect`) respond
   * automatically to user input changes.
   *
   * ### Behavior
   * - Maps `null` form values to an empty string (`''`) for consistency.
   * - Updates the `searchTerm` signal on each emission.
   * - Uses `untilDestroyed(this)` to automatically clean up the subscription
   *   when the component is destroyed.
   *
   * ### Processing Steps
   * 1. Listen to `valueChanges` on the `FormControl<string | null>`.
   * 2. Transform `null` → `''` using `map()`.
   * 3. Update the reactive `searchTerm` via `tap()`.
   * 4. Automatically unsubscribe on destroy.
   *
   * ### Side Effects
   * - Mutates the `searchTerm` signal, triggering dependent reactive effects.
   *
   * @returns {void}
   *
   * @private
   */
  private _subscribeToSearchControlChanges(): void {
    this.searchControl.valueChanges.pipe(
      map((value: string | null) => value ?? ''),
      tap((value: string) => this.searchTerm.set(value)),
      untilDestroyed(this)
    ).subscribe();
  }

  /**
   * Maps a {@link PermissionsViewModel} (UI representation) back into a
   * {@link Permissions} domain model.
   *
   * ### Purpose
   * Converts the UI-facing view model into a complete `Permissions` object
   * that can be persisted or transmitted, while preserving any data
   * not directly represented in the UI.
   *
   * ### Behavior
   * - Creates a new `Permissions` instance using the original model as a base.
   * - Transforms each `PermissionNodeView` in the view model into its
   *   corresponding `PermissionPage` domain object via `_mapNodeToPermissionPage`.
   * - Retains all properties from the original permissions model that
   *   are not overridden by the view model.
   * - Copies `pageAccessoryCategories` directly from the view model.
   *
   * ### Processing Steps
   * 1. Spread all fields from the original `Permissions` (if provided).
   * 2. Replace the `pages` collection with a recursively mapped version.
   * 3. Preserve `pageAccessCategories` as provided by the view model.
   *
   * ### Side Effects
   * - None; this method produces a new `Permissions` instance and does not mutate state.
   *
   * @param {PermissionsViewModel} viewModel - The view model containing the updated UI representation.
   * @param {Permissions | null} original - The original permissions domain object used to merge non-UI data.
   * @returns {Permissions} A fully hydrated `Permissions` domain model representing the current UI state.
   *
   * @private
   */
  private _mapViewModelToPermissions(
    viewModel: PermissionsViewModel,
    original: Permissions | null
  ): Permissions {
    return new Permissions({
      ...original, // preserve everything not represented in the view model
      pages: viewModel.pages.map((page: PermissionNodeView): PermissionPage =>
        this._mapNodeToPermissionPage(
          page,
          original?.pages.find((permissionPage: PermissionPage) => permissionPage.contentId === page.contentId)
        )
      ),
      pageAccessCategories: viewModel.pageAccessoryCategories,
    });
  }

  /**
   * Maps a {@link PermissionNodeView} (UI node) into a {@link PermissionPage} domain model node.
   *
   * ### Purpose
   * Converts a single node from the UI representation back into its domain model form,
   * preserving original data and merging UI-driven state such as access levels
   * and claim selections.
   *
   * ### Behavior
   * - Determines whether the node is a **page-level**, **category-level**, or **leaf** node.
   * - Uses the UI form control value for access level (`accessFormControl`), defaulting to `None`
   *   when no value is provided.
   * - Merges claim selections by mapping each `FormControl<boolean>` into an `AdditionalClaim`.
   * - Recursively maps all child nodes to maintain full tree fidelity.
   * - Retains original node metadata and unrepresented properties.
   *
   * ### Processing Steps
   * 1. Determine node type (page-level or child-level).
   * 2. Resolve the appropriate access level, prioritizing UI control values.
   * 3. Rebuild the `additionalClaims` collection from the current claim form controls.
   * 4. Recursively map children using `_mapNodeToPermissionPage`.
   * 5. Construct and return a new `PermissionPage` domain object.
   *
   * ### Side Effects
   * - None; returns a new instance without mutating either argument.
   *
   * @param {PermissionNodeView} permissionNodeView - The UI node containing form state and nested children.
   * @param {PermissionPage | undefined} originalPermissionPage - The corresponding domain node to merge preserved data from.
   * @returns {PermissionPage} A reconstructed domain node reflecting the UI state.
   *
   * @private
   */
  private _mapNodeToPermissionPage(
    permissionNodeView: PermissionNodeView,
    originalPermissionPage: PermissionPage | undefined
  ): PermissionPage {
    const hasChildren: boolean = !!permissionNodeView.children?.length;
    const isPageLevel: boolean =
      hasChildren &&
      // page-level means it's one of the top-level pages in the Permissions object
      (this.permissions()?.pages ?? []).some(
        (page: PermissionPage) => page.contentId === permissionNodeView.contentId
      );

    const access: AccessControlLevel | undefined = hasChildren
      ? isPageLevel
        ? permissionNodeView.accessFormControl.value ?? AccessControlLevel.None
        : originalPermissionPage?.access
      : permissionNodeView.accessFormControl.value ?? AccessControlLevel.None;

    return new PermissionPage({
      ...originalPermissionPage,
      contentId: permissionNodeView.contentId,
      menuName: permissionNodeView.menuName,
      access,
      additionalClaims: permissionNodeView.claimsFormGroup
        ? Object.entries(permissionNodeView.claimsFormGroup.controls).map(
          ([claimName, claimControl]: [string, FormControl<boolean>]) => {
            const originalClaim: AdditionalClaim | undefined =
              originalPermissionPage?.additionalClaims.find(
                (claim: AdditionalClaim) => claim.name === claimName
              );

            return new AdditionalClaim({
              name: claimName,
              isSelected: claimControl.value,
              value: originalClaim?.value ?? '',
            });
          }
        )
        : [],
      children: permissionNodeView.children?.map((childPermissionNodeView: PermissionNodeView) =>
        this._mapNodeToPermissionPage(
          childPermissionNodeView,
          this._findOriginalNode(
            childPermissionNodeView.contentId,
            originalPermissionPage?.children ?? []
          )
        )
      ),
    });
  }

  /**
   * Finds the original {@link PermissionPage} node within a list of domain nodes
   * by matching its `contentId` to the specified target ID.
   *
   * ### Purpose
   * Supports recursive mapping operations (such as in `_mapNodeToPermissionPage`)
   * by retrieving the corresponding original domain node for a given UI node.
   *
   * ### Behavior
   * - Searches the provided array of `PermissionPage` nodes.
   * - Returns the first node whose `contentId` equals the given `targetContentId`.
   * - Returns `undefined` if no matching node is found.
   *
   * ### Processing Steps
   * 1. Iterate over all nodes in the `permissionPageNodes` array.
   * 2. Compare each node’s `contentId` to the provided target.
   * 3. Return the first match found, or `undefined` otherwise.
   *
   * ### Side Effects
   * - None; this function is pure.
   *
   * @param {number} targetContentId - The unique identifier (`contentId`) of the desired permission node.
   * @param {PermissionPage[]} permissionPageNodes - The list of domain permission nodes to search within.
   * @returns {PermissionPage | undefined} The matched node, or `undefined` if no match exists.
   *
   * @private
   */
  private _findOriginalNode(
    targetContentId: number,
    permissionPageNodes: PermissionPage[]
  ): PermissionPage | undefined {
    return permissionPageNodes.find(
      (permissionPageNode: PermissionPage) => permissionPageNode.contentId === targetContentId
    );
  }

  /**
   * Updates the `workingPermissions` signal within the {@link PermissionsService}
   * to reflect the latest state of the current {@link PermissionsViewModel}.
   *
   * ### Purpose
   * Keeps the domain-level working permissions model in sync with user interactions
   * in the UI, ensuring that any changes to form controls or signals are persisted
   * in the service layer’s reactive state.
   *
   * ### Behavior
   * - Retrieves the latest `permissionsViewModel` and base `permissions` signals.
   * - If either signal is missing, the update is skipped.
   * - Maps the view model back into a complete `Permissions` object using
   *   `_mapViewModelToPermissions`, merging any non-UI fields from the existing model.
   * - Updates the `workingPermissions` signal in `PermissionsService` with the mapped object.
   *
   * ### Processing Steps
   * 1. Read `permissionsViewModel()` and `permissions()` signals.
   * 2. Guard clause: exit early if either is `null`.
   * 3. Generate a mapped `Permissions` object via `_mapViewModelToPermissions`.
   * 4. Write the mapped result to `this._permissionsService.workingPermissions`.
   *
   * ### Side Effects
   * - Mutates the reactive signal `workingPermissions` in the service layer.
   * - May trigger downstream effects that depend on the working permissions state.
   *
   * @returns {void}
   *
   * @private
   */
  private _updateWorkingPermissions(): void {
    const permissionsViewModel: PermissionsViewModel | null = this.permissionsViewModel();
    const currentPermissions: Permissions | null = this.permissions();

    if (!permissionsViewModel || !currentPermissions) {
      return;
    }

    const mappedPermissions: Permissions = this._mapViewModelToPermissions(
      permissionsViewModel,
      currentPermissions
    );

    this._permissionsService.workingPermissions.set(mappedPermissions);
  }

  /**
   * Determines the most appropriate {@link AccessControlLevel} to apply to a child node
   * during cascading permission propagation.
   *
   * ### Purpose
   * Ensures that when access levels are cascaded from a parent node down the permission tree,
   * the applied level does not exceed what the child node supports while maintaining the
   * strongest valid level possible within configuration limits.
   *
   * ### Behavior
   * - Prevents **escalation**: never assigns a higher access level to a child than the parent’s selected level.
   * - Selects the **highest supported** level (strongest possible) within or below the parent’s selected level.
   * - Falls back to `AccessControlLevel.None` if no supported level is found.
   *
   * ### Processing Steps
   * 1. Return `None` immediately if `childNode` is undefined.
   * 2. Build an ordered map of access control strength:
   *    - `None` → 0
   *    - `Read` → 1
   *    - `ReadWrite` → 2
   * 3. Normalize available access levels from `pageAccessCategories` to prevent duplicates.
   * 4. Sort levels in descending order of strength (strongest → weakest).
   * 5. Filter levels to only those at or below the selected parent level.
   * 6. Return the first level supported by the child node.
   * 7. If none are supported, return `AccessControlLevel.None`.
   *
   * ### Side Effects
   * - None; this function is pure.
   *
   * @param {AccessControlLevel} selectedLevel - The access level selected at the parent node.
   * @param {PermissionPage | undefined} childNode - The child permission node being evaluated.
   * @param {ReadonlyArray<PageAccessoryCategory>} pageAccessCategories - The list of all available access level categories.
   * @returns {AccessControlLevel} The most suitable cascaded access level for the child node.
   *
   * @private
   */
  private _pickCascadedAccessControlLevel(
    selectedLevel: AccessControlLevel,
    childNode: PermissionPage | undefined,
    pageAccessCategories: ReadonlyArray<PageAccessoryCategory>,
  ): AccessControlLevel {
    if (!childNode) return AccessControlLevel.None;

    const accessControlLevelOrderMap: Map<AccessControlLevel, number> = new Map<AccessControlLevel, number>([
      [AccessControlLevel.None, 0],
      [AccessControlLevel.Read, 1],
      [AccessControlLevel.ReadWrite, 2],
    ]);

    // Normalize available levels from categories (defensive against duplicates)
    const allLevels: AccessControlLevel[] = Array.from(
      new Set<AccessControlLevel>(
        (pageAccessCategories ?? []).map(
          (category: PageAccessoryCategory): AccessControlLevel => category.value
        )
      )
    );

    // Strongest → weakest
    const levelsDescending: AccessControlLevel[] = allLevels.sort(
      (left: AccessControlLevel, right: AccessControlLevel): number => {
        const leftIndex: number = accessControlLevelOrderMap.get(left) ?? -1;
        const rightIndex: number = accessControlLevelOrderMap.get(right) ?? -1;

        return rightIndex - leftIndex;
      }
    );

    // Never escalate beyond selected
    const selectedOrderIndex: number = accessControlLevelOrderMap.get(selectedLevel) ?? 0;
    const candidateLevels: AccessControlLevel[] = levelsDescending.filter(
      (level: AccessControlLevel): boolean =>
        (accessControlLevelOrderMap.get(level) ?? -1) <= selectedOrderIndex
    );

    // Walk downward until we find a level the child supports
    for (const candidateLevel of candidateLevels) {
      const childSupportsCandidate: boolean = (childNode.availablePageAccessTypes ?? [])
        .some((available: PageAccessoryCategory): boolean => available.value === candidateLevel);

      if (childSupportsCandidate) {
        return candidateLevel;
      }
    }

    // Nothing matched → None
    return AccessControlLevel.None;
  }
}
