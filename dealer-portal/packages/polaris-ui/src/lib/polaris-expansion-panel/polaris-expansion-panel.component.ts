import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs';
import { PolarisIcon } from '../polaris-icon';
import { PolarisUiBase } from '../polaris-ui-base';

@UntilDestroy()
@Component({
  selector: 'polaris-expansion-panel',
  imports: [
    CommonModule,
    MatExpansionModule,
    PolarisIcon,
  ],
  templateUrl: './polaris-expansion-panel.component.html',
  styleUrl: './polaris-expansion-panel.component.scss'
})
export class PolarisExpansionPanel extends PolarisUiBase implements OnInit, AfterViewInit {
  @ViewChild(MatExpansionPanel) expansionPanel!: MatExpansionPanel;

  /**
   * Indicates whether the expansion panel is expanded or collapsed.
   *
   * @type {boolean}
   * @default true
   */
  private _expanded: boolean = true;

  @Input()
  public get expanded(): boolean {
    return this.expansionPanel?.expanded ?? this._expanded;
  }
  public set expanded(value: boolean) {
    this._expanded = value;
    if (this.expansionPanel) {
      value ? this.expansionPanel.open() : this.expansionPanel.close();
    }
  }

  /**
   * Determines whether the toggle button for the expansion panel is hidden.
   *
   * @type {boolean}
   * @default false
   */
  @Input() public hideToggle: boolean = false;

  /**
   * Specifies the position of the toggle button relative to the panel content.
   *
   * @type {'before' | 'after'}
   * @default 'after'
   */
  @Input() public togglePosition: 'before' | 'after' = 'after';

  /**
   * Indicates whether the header of the expansion panel is displayed.
   *
   * @type {boolean}
   * @default true
   */
  @Input() public showHeader: boolean = true;

  /**
   * Sets the background color of the header.
   *
   * @type {string}
   * @default ''
   */
  @Input() public headerBackgroundColor: string = '';

  /**
   * Specifies the height of the header. If set, it applies to both expanded and collapsed states.
   *
   * @type {string}
   */
  @Input() public headerHeight!: string;

  /**
   * Sets the height of the header when the panel is collapsed.
   *
   * @type {string}
   * @default '75px'
   */
  @Input() public headerHeightCollapsed: string = '75px';

  /**
   * Sets the height of the header when the panel is expanded.
   *
   * @type {string}
   * @default '75px'
   */
  @Input() public headerHeightExpanded: string = '75px';

  /**
   * Determines whether to use the Polaris expansion toggle.
   *
   * @type {boolean}
   * @default true
   */
  @Input() public usePolarisExpansionToggle: boolean = true;

  /**
   * Event emitted after the expansion panel has expanded.
   *
   * @type {EventEmitter<void>}
   */
  @Output() afterExpand: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Event emitted after the expansion panel has collapsed.
   *
   * @type {EventEmitter<void>}
   */
  @Output() afterCollapse: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Event emitted when the expansion panel is closed.
   *
   * @type {EventEmitter<void>}
   */
  @Output() closed: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Event emitted when the expansion panel is destroyed.
   *
   * @type {EventEmitter<boolean>}
   */
  @Output() destroyed: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Event emitted when the expansion panel is opened.
   *
   * @type {EventEmitter<void>}
   */
  @Output() opened: EventEmitter<void> = new EventEmitter<void>();

  /**
   * The CSS class applied to the expansion panel for theming purposes.
   *
   * @type {string}
   * @default 'polaris-expansion-panel-theme-primary'
   */
  public panelThemeClass: string = 'polaris-expansion-panel-theme-primary';

    /**
     * Initializes the component by setting up the panel theme class, toggle visibility,
     * header height, and test ID. This method is called once the component is initialized.
     *
     * @returns {void} This function does not return a value.
     */
  public ngOnInit(): void {
    this._setPanelThemeClass();
    this._setToggleVisibility();
    this._setHeaderHeight();
    this._setTestId();
  }

  /**
   * Lifecycle hook that is called after a component's view has been fully initialized.
   * This method subscribes to the panel state to ensure it responds to changes appropriately.
   *
   * @return {void} This method does not return any value.
   */
  public ngAfterViewInit(): void {
    this._subscribeToPanelState();
  }

  /**
   * Sets up subscriptions to monitor and handle the expansion panel's state changes.
   * This private method performs the following tasks:
   * 1. Initializes the panel's expanded state using the internal _expanded value
   * 2. Subscribes to the panel's opened event stream to:
   *    - Update the internal expanded state to true
   *    - Emit the opened event to notify subscribers
   * 3. Subscribes to the panel's closed event stream to:
   *    - Update the internal expanded state to false
   *    - Emit the closed event to notify subscribers
   * Both subscriptions are automatically cleaned up when the component is destroyed
   * using the untilDestroyed operator.
   *
   * @private
   * @returns {void} This method does not return a value.
   */
  private _subscribeToPanelState(): void {
    this.expanded = this._expanded;

    // Listen for changes from the panel itself
    this.expansionPanel.opened.pipe(
      tap((): void => {
        this._expanded = true;
        this.opened.emit();
      }),
      untilDestroyed(this),
    ).subscribe();

    this.expansionPanel.closed.pipe(
      tap((): void => {
        this._expanded = false;
        this.closed.emit();
      }),
      untilDestroyed(this),
    ).subscribe();
  }

    /**
     * Sets the test ID for the expansion panel component.
     * If a test ID is not already provided, it defaults to 'unknown'.
     * The test ID is formatted to be lowercase, with spaces replaced by hyphens,
     * and special characters removed.
     *
     * @returns {void} This function does not return a value.
     */
  private _setTestId(): void {
    this.testId = this.testId || 'unknown';
    this.testId = `polaris-expansion-panel-` + this.testId
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '') // Remove special characters
      .trim();
  }

    /**
     * Sets the header height for both expanded and collapsed states.
     * If a specific header height is provided, it applies the same height
     * to both the expanded and collapsed header states.
     */
  private _setHeaderHeight(): void {
    if (this.headerHeight) {
      this.headerHeightExpanded = this.headerHeight;
      this.headerHeightCollapsed = this.headerHeight;
    }
  }

  /**
   * Sets the theme class for the expansion panel.
   * This function constructs the theme class name using the current theme
   * and assigns it to the `panelThemeClass` property.
   *
   * @private
   * @returns {void} This function does not return a value.
   */
  private _setPanelThemeClass(): void {
    this.panelThemeClass = `polaris-expansion-panel-theme-${this.theme}`;
  }

  /**
   * Sets the visibility of the toggle button for the expansion panel.
   * This function determines whether the toggle button should be hidden
   * based on the current `hideToggle` input and the `usePolarisExpansionToggle` flag.
   *
   * @private
   * @returns {void} This function does not return a value.
   */
  private _setToggleVisibility(): void {
    this.hideToggle = this.hideToggle || this.usePolarisExpansionToggle;
  }

  /**
   * Emits an event indicating that the expansion panel has expanded.
   * This function triggers the `afterExpand` event emitter, which can be used
   * to perform actions after the panel has expanded.
   *
   * @returns {void} This function does not return a value.
   */
  public emitAfterExpand(): void {
    this.afterExpand.emit();
  }

  /**
   * Emits an event indicating that the expansion panel has collapsed.
   * This function triggers the `afterCollapse` event emitter, which can be used
   * to perform actions after the panel has collapsed.
   *
   * @returns {void} This function does not return a value.
   */
  public emitAfterCollapse(): void {
    this.afterCollapse.emit();
  }

  /**
   * Emits an event indicating that the expansion panel has been closed.
   * This function triggers the `closed` event emitter, which can be used
   * to perform actions when the panel is closed.
   *
   * @returns {void} This function does not return a value.
   */
  public emitClosed(): void {
    this.closed.emit();
  }

  /**
   * Emits an event indicating that the expansion panel has been destroyed.
   * This function triggers the `destroyed` event emitter, which can be used
   * to perform actions when the panel is destroyed.
   *
   * @returns {void} This function does not return a value.
   */
  public emitDestroyed(): void {
    this.destroyed.emit();
  }

  /**
   * Emits an event indicating that the expansion panel has been opened.
   * This function triggers the `opened` event emitter, which can be used
   * to perform actions when the panel is opened.
   *
   * @returns {void} This function does not return a value.
   */
  public emitOpened(): void {
    this.opened.emit();
  }

  /**
   * Opens the expansion panel by setting its expanded state to true.
   * This function does not take any parameters and does not return a value.
   *
   * @returns {void} This function does not return a value.
   */
  public open(): void {
    this.expanded = true;
  }

  /**
   * Closes the expansion panel by setting its expanded state to false.
   *
   * @returns {void} This function does not return a value.
   */
  public close(): void {
    this.expanded = false;
  }
}
