import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  computed,
  effect,
  ElementRef,
  OnInit,
  Renderer2,
  signal,
  Signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { User } from '@classes';
import {
  PermissionsSelectorDialogComponent,
} from '@components/_user-templates/permissions-selector-dialog/permissions-selector-dialog.component';
import {
  PolarisButton,
  PolarisDialogService,
  PolarisGroupOption,
  PolarisRadioGroup,
  PolarisSearchBar,
  PolarisSearchBarResult,
} from '@dealer-portal/polaris-ui';
import { PermissionMode } from '@enums';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PermissionsService, UserAdministrationService } from '@services';
import { debounceTime, distinctUntilChanged, fromEvent, map, Observable, of, startWith, switchMap, tap } from 'rxjs';

/**
 * A component for selecting user permissions in the User Administration application.
 * It uses Angular Reactive Forms and Polaris' polaris-radio-groups to create a radio group for permission selection.
 */
@UntilDestroy()
@Component({
  selector: 'ua-permissions-selector',
  imports: [
    CommonModule,
    PolarisButton,
    PolarisRadioGroup,
    PolarisSearchBar,
    TranslatePipe,
  ],
  templateUrl: './permissions-selector.component.html',
  styleUrl: './permissions-selector.component.scss'
})
export class PermissionsSelectorComponent implements AfterViewChecked, OnInit {
  @ViewChild('copyPermissionsContainer', { static: false })
  copyPermissionsContainer!: ElementRef<HTMLDivElement>;

  @ViewChild(PolarisRadioGroup, { read: ElementRef })
  radioGroupElement!: ElementRef<HTMLElement>;

  public permissionOptions: WritableSignal<PolarisGroupOption<PermissionMode>[] | null> = signal(null);
  public activePermissionMode: Signal<PermissionMode | null> = computed(
    (): PermissionMode | null => this._permissionsService.activePermissionMode()
  );

  /**
   * A FormControl for handling the new permissions' selection.
   */
  public newPermissionsFormControl: FormControl<PermissionMode | null> = new FormControl<PermissionMode | null>(null);
  public userSearchResults: PolarisSearchBarResult<User>[] = [];
  public selectedUser: User | null = null;
  private _previousValue: PermissionMode | null = null;

  // This signal re-runs when the users list changes, so even if ALL users haven't loaded by the time we are on this component, it will once the call complete
  // TODO: This only used for searching user's to copy permissions from, if it only needs active users, we can speed it up using this.userAdministrationService.activeUsers()
  public readonly users: Signal<User[]> = computed(
    (): User[] => this._userAdministrationService.users()?.filter(Boolean) ?? []
  );

  private readonly _windowWidth: WritableSignal<number> = signal<number>(window.innerWidth);
  private _needsAlign: boolean = false;

  constructor(
    private _dialogService: PolarisDialogService,
    private _permissionsService: PermissionsService,
    private _renderer: Renderer2,
    private _translateService: TranslateService,
    private _userAdministrationService: UserAdministrationService,
  ) {
    this._initDefaultPermissionsEffect();
    this._initPermissionModeChangeEffect();
  }

  /**
   * Initializes the component
   */
  public ngOnInit(): void {
    this._initPermissionOptions();
    this._initResizeSignal();
    this._subscribeToFormControlChanges();
  }

  /**
   * Lifecycle hook that is called after Angular has fully checked the component's view.
   * It ensures that the copy permissions container is aligned with the radio group if needed.
   */
  public ngAfterViewChecked(): void {
    if (this._needsAlign) {
      this._alignCopyPermissionsContainer();
      this._needsAlign = false;
    }
  }

  /**
   * Aligns the copy permissions container with the radio group.
   */
  private _initPermissionModeChangeEffect(): void {
    effect(() => {
      const activePermissionMode: PermissionMode | null = this._permissionsService.activePermissionMode();

      // Aligns the copy permissions container with the radio group.
      // only run if "copy" mode is active and DOM is rendered
      if (activePermissionMode === PermissionMode.Copy &&
        this.radioGroupElement?.nativeElement &&
        this.copyPermissionsContainer) {
        this._alignCopyPermissionsContainer();
      }
    });
  }

  /**
   * Initializes an effect that listens for changes in the default permissions.
   * When the default permissions change, it updates the newPermissionsFormControl value accordingly.
   */
  private _initDefaultPermissionsEffect(): void {
    effect(() => {
      const isDefaultPermissions: boolean = this._permissionsService.isDefaultPermissions();
      const currentMode: PermissionMode | null = this._permissionsService.activePermissionMode();
      const newMode: PermissionMode = isDefaultPermissions ? PermissionMode.Default : PermissionMode.Manual;

      // Skip if currently in Copy mode (user-driven)
      if (currentMode === PermissionMode.Copy) return;

      if (this.newPermissionsFormControl.value !== newMode) {
        this.newPermissionsFormControl.setValue(newMode, { emitEvent: false });
      }

      this._previousValue = newMode;
    });
  }

  /**
   * Initializes a signal that listens for window resize events.
   * The signal updates the _windowWidth signal with the current window width.
   */
  private _initResizeSignal(): void {
    fromEvent(window, 'resize').pipe(
      debounceTime(50),
      map(() => window.innerWidth),
      startWith(window.innerWidth),
      untilDestroyed(this),
    ).subscribe((width: number) => this._windowWidth.set(width));
  }

  /**
   * Initializes the permission options for the radio group.
   * The options are translated using the TranslateService.
   */
  private _initPermissionOptions(): void {
    const permissionOptions: PolarisGroupOption<PermissionMode>[] = [
      new PolarisGroupOption<PermissionMode>({
        value: PermissionMode.Default,
        label: this._translateService.instant('permissions-mode-label.default'),
        testId: 'polaris-option-default-permissions',
      }),
      new PolarisGroupOption({
        value: PermissionMode.Manual,
        label: this._translateService.instant('permissions-mode-label.manual'),
        testId: 'polaris-option-manual-permissions',
      }),
      new PolarisGroupOption({
        value: PermissionMode.Copy,
        label: this._translateService.instant('permissions-mode-label.copy'),
        testId: 'polaris-option-copy-permissions-from-another-user',
      }),
    ];

    this.permissionOptions.set(permissionOptions);
  }

  /**
   * Subscribes to the newPermissionsFormControl value changes.
   * When a new value is selected, it updates the selectedPermissionStyle.
   */
  private _subscribeToFormControlChanges(): void {
    this.newPermissionsFormControl.valueChanges.pipe(
      distinctUntilChanged(),
      switchMap((newValue: PermissionMode | null): Observable<PermissionMode | null> => {
        const previousValue: PermissionMode | null = this._previousValue ?? this._permissionsService.activePermissionMode();
        this._previousValue = previousValue;

        // Ignore if nothing changed
        if (newValue === null || newValue === previousValue) {
          return of(null);
        }

        // Ignore clicks on Manual (derived mode)
        if (newValue === PermissionMode.Manual) {
          this.newPermissionsFormControl.setValue(previousValue);

          return of(null);
        }

        if (newValue === PermissionMode.Copy) {
          return of(PermissionMode.Copy);
        }

        return this.openConfirmSelectionDialog(PermissionMode.Default);
      }),
      tap((confirmedMode: PermissionMode | null): void => {
        if (confirmedMode) {
          this._permissionsService.activePermissionMode.set(confirmedMode);
          this.newPermissionsFormControl.setValue(confirmedMode, { emitEvent: false });

          if (confirmedMode === PermissionMode.Copy) {
            this._needsAlign = true;
          }

          this._previousValue = confirmedMode;
        } else {
          if (this.newPermissionsFormControl.value !== this._previousValue) {
            queueMicrotask(() => this.newPermissionsFormControl.setValue(this._previousValue));
          }
        }
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  public openConfirmSelectionDialog(newValue: PermissionMode): Observable<PermissionMode | null> {
    const primaryButtonLabel: string =
      newValue === PermissionMode.Default
        ? this._translateService.instant('permissions-dialog.confirm-default-permissions')
        : this._translateService.instant('permissions-dialog.confirm-copy-permissions');

    const htmlMessage: string =
      newValue === PermissionMode.Default
        ? this._translateService.instant('permissions-dialog.default-permissions-message')
        : this._translateService.instant('permissions-dialog.copy-permissions-message');

    return this._dialogService.open(PermissionsSelectorDialogComponent,
      {
        width: '600px',
        data: {
          activePermissionMode: newValue,
          htmlMessage,
          primaryButtonLabel,
          secondaryButtonLabel: this._translateService.instant('permissions-dialog.cancel'),
          title: this._translateService.instant('permissions-dialog.title'),
        },
      }
    ).pipe(
      map((result: Record<string, PermissionMode | boolean> | null) =>
        result?.['confirm'] ? (result['mode'] as PermissionMode) : null
      )
    );
  }

  /**
   * Aligns the copy permissions container with the radio group.
   * This method calculates the left offset of the "Copy Permissions from Another User" radio button
   * and applies that offset as a left margin to the copyPermissionsContainer element.
   */
  private _alignCopyPermissionsContainer(): void {
    if (!this.radioGroupElement?.nativeElement || !this.copyPermissionsContainer) return;

    const hostEl: HTMLElement = this.radioGroupElement.nativeElement;
    const containerEl: HTMLElement = this.copyPermissionsContainer.nativeElement;

    // Reset so calculations aren't recursive
    this._renderer.setStyle(containerEl, 'margin-top', '0');

    const copyRadioLabel: HTMLElement | null = hostEl.querySelector(
      '[data-test-id="polaris-option-copy-permissions-from-another-user-radio-button"] label'
    );

    if (copyRadioLabel) {
      // Horizontal offset: label’s left edge relative to the radio group
      const labelRect: DOMRect = copyRadioLabel.getBoundingClientRect();
      const groupRect: DOMRect = hostEl.getBoundingClientRect();
      const offsetLeft: number = labelRect.left - groupRect.left;

      // Vertical adjustment using offsetTop (not affected by applied margins)
      const labelBottom: number = copyRadioLabel.offsetTop + copyRadioLabel.offsetHeight;
      const containerTop: number = containerEl.offsetTop;
      const verticalGap: number = containerTop - labelBottom;
      const preferredMargin: number = 10; // Desired gap between label and container

      this._renderer.setStyle(containerEl, 'margin-left', `${offsetLeft}px`);
      this._renderer.setStyle(containerEl, 'margin-top', `${-verticalGap + preferredMargin}px`);
    }
  }

  public copyUserPermissions(): void {
    this.openConfirmSelectionDialog(PermissionMode.Copy).pipe(
      tap((confirmedMode: PermissionMode | null): void => {
        if (confirmedMode) {
          this._permissionsService.applySelectedUserPermissions(this.selectedUser as User, true);
        }
      })
    ).subscribe();
  }

  /**
   * Filters the list of users based on the provided search text and updates the search results.
   *
   * @param searchText - The text used to filter the user list. If empty or whitespace, the search results are cleared.
   *
   * @returns void
   */
  public getUserSearchResults(searchText: string): void {
    if (!searchText || searchText.trim().length === 0 || searchText === '') {
      this.userSearchResults = [];
      this.selectedUser = null;

      return;
    }

    this.userSearchResults = this.users().map((user: User): PolarisSearchBarResult<User> => {
      return new PolarisSearchBarResult({
        value: user,
        label: `${user.firstName} ${user.lastName}`,
      })
    }).filter((result: PolarisSearchBarResult<User>): boolean => {
      const isCurrentUser: boolean = (result.value as User).portalAuthenticationId === this._userAdministrationService.userDetails()?.portalAuthenticationId;
      const includesSearchText: boolean = result.label.toLowerCase().includes(searchText.toLowerCase());

      return includesSearchText && !isCurrentUser;
    });
  }
}
