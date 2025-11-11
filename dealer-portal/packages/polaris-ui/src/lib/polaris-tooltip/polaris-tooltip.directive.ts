import { Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  Directive,
  Input,
  ViewContainerRef,
  ElementRef,
  ComponentRef,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { polarisDefaultTooltipDelay } from './polaris-tooltip-constants';
import { PolarisTooltip } from './polaris-tooltip.component';


/**
 * Directive to display a tooltip on hover.
 *
 * // As a string
 * @example <button polarisTooltip="This is a tooltip"> Hover me </button>
 *
 * // As an HTML string
 * @example <button polarisTooltip="This is a <b>bold</b> tooltip"> Hover me </button>
 *
 * // As a variable reference
 * @example <button [polarisTooltip]="tooltipContent">Hover me</button>
 *
 * @note strings are sanitized by Angular to prevent potential XSS attacks.
 * @note strings will render as HTML, not as plain text.
 */
@Directive({
  selector: '[polarisTooltip]',
  standalone: true,
})
export class PolarisTooltipDirective implements OnDestroy {
  @Input('polarisTooltip') tooltipHtml: string = '';
  @Input('polarisTooltipShowDelay') tooltipShowDelay: number = polarisDefaultTooltipDelay;
  @Input('polarisTooltipHideDelay') tooltipHideDelay: number = polarisDefaultTooltipDelay;
  @Input('polarisTooltipTestId') tooltipTestId: string = 'polaris-tooltip-test-id';

  private _overlayRef: OverlayRef | null = null;
  private _showTimeout: ReturnType<typeof setTimeout> | null = null;
  private _hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private _tooltipComponentRef: ComponentRef<PolarisTooltip> | null = null;

  /**
   * Creates an instance of PolarisTooltipDirective.
   *
   * @param _viewContainer - The ViewContainerRef to insert the tooltip component into.
   * @param _elementRef - The ElementRef of the host element to which the directive is applied.
   * @param _overlay - The Overlay to create and manage tooltip overlays.
   */
  constructor(
    private _viewContainer: ViewContainerRef,
    private _elementRef: ElementRef,
    private _overlay: Overlay,
  ) {}

  /**
   * Handles the mouseenter event on the host element.
   * Cancels any scheduled hiding functionality and schedules the showing of a tooltip or associated UI component.
   *
   * @return {void} This method does not return any value.
   */
  @HostListener('mouseenter')
  public onMouseEnter(): void {
    this._cancelHide();
    this._scheduleShow();
  }

  /**
   * Handles the mouse leave event for the associated host element.
   * When triggered, it cancels any scheduled operations for showing
   * content and sets up the necessary hide behavior.
   *
   * @return {void} This method does not return a value.
   */
  @HostListener('mouseleave')
  public onMouseLeave(): void {
    this._cancelShow();
    this._scheduleHide();
  }

  // --- Keyboard Events ---

  /**
   * Handles the focus event on the host element. This method is invoked when the element receives focus.
   * It cancels any pending hiding actions and schedules the display of the required element or functionality.
   *
   * @return {void} Does not return a value.
   */
  @HostListener('focus')
  public onFocus(): void {
    this._cancelHide();
    this._scheduleShow();
  }

  /**
   * The `onBlur` method is triggered when the blur event occurs on the host element.
   * It cancels any scheduled display action and schedules the element to hide.
   *
   * @return {void} No value is returned.
   */
  @HostListener('blur')
  public onBlur(): void {
    this._cancelShow();
    this._scheduleHide();
  }

  // --- Touch Events (mobile) ---

  /**
   * Handles the `touchstart` event on the host element. This method cancels any scheduled hiding actions,
   * initiates the process to show an element, and prevents the default scrolling behavior triggered by the event.
   *
   * @param {TouchEvent} event The touch event triggered by the user interaction.
   * @return {void} Does not return a value.
   */
  @HostListener('touchstart', ['$event'])
  public onTouchStart(event: TouchEvent): void {
    this._cancelHide();
    this._scheduleShow();

    // Prevent default scrolling on 'touchstart' events
    event.preventDefault();
  }

  /**
   * Handles the 'touchend' event triggered when a touch interaction ends.
   * Cancels any pending display actions and schedules a hide action.
   *
   * @return {void} No return value.
   */
  @HostListener('touchend')
  public onTouchEnd(): void {
    this._cancelShow();
    this._scheduleHide();
  }

  // --- Timer Management ---

  /**
   * Schedules the display of the tooltip after a specified delay.
   * If a tooltip display is already scheduled, it clears the existing timeout and reschedules it.
   *
   * @return {void} This method does not return a value.
   */
  private _scheduleShow(): void {
    if (!this.tooltipHtml) return;
    if (this._showTimeout) clearTimeout(this._showTimeout);
    this._showTimeout = setTimeout(() => {
      this.showTooltip();
    }, this.tooltipShowDelay);
  }

  /**
   * Schedules the hiding of the tooltip after a specified delay.
   * If a previous hide timeout exists, it clears the timeout before scheduling a new one.
   * The delay is determined by the value of `tooltipHideDelay`.
   *
   * @return {void} Does not return a value.
   */
  private _scheduleHide(): void {
    if (this._hideTimeout) clearTimeout(this._hideTimeout);
    this._hideTimeout = setTimeout(() => {
      this.hideTooltip();
    }, this.tooltipHideDelay);
  }

  /**
   * Cancels the display timeout if it is currently active, preventing any deferred display action.
   *
   * @return {void} Does not return a value.
   */
  private _cancelShow(): void {
    if (this._showTimeout) {
      clearTimeout(this._showTimeout);
      this._showTimeout = null;
    }
  }

  /**
   * Cancels the current hide timeout if it exists, preventing the associated hide action.
   * This method clears the timeout and resets the hide timeout property to null.
   *
   * @return {void} This method does not return a value.
   */
  private _cancelHide(): void {
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = null;
    }
  }

  /**
   * Displays a tooltip overlay if the tooltip content (tooltipHtml) is defined
   * and there is no existing, attached tooltip overlay. If no overlay reference exists,
   * it creates and attaches one.
   *
   * @return {void} This method does not return a value.
   */
  public showTooltip(): void {
    if (!this.tooltipHtml) {
      return;
    }

    // Prevent duplicate overlays
    if (this._overlayRef && this._overlayRef.hasAttached()) {
      return;
    }

    if (!this._overlayRef) {
      this._overlayRef = this._createOverlay();
    }

    const tooltipPortal: ComponentPortal<PolarisTooltip> = new ComponentPortal(PolarisTooltip, this._viewContainer);
    this._tooltipComponentRef = this._overlayRef.attach(tooltipPortal);
    this._tooltipComponentRef.instance.htmlContent = this.tooltipHtml;
    this._tooltipComponentRef.instance.testId = this.tooltipTestId;
  }

  /**
   * Hides the currently displayed tooltip by detaching its overlay reference.
   *
   * @return {void} Doesn't return any value.
   */
  public hideTooltip(): void {
    if (this._overlayRef) {
      this._overlayRef.detach();
    }
  }

  /**
   * Creates and returns an instance of OverlayRef with the configured position and scroll strategies.
   *
   * @return {OverlayRef} The created overlay reference.
   */
  private _createOverlay(): OverlayRef {
    const positionStrategy: PositionStrategy = this._getPositionStrategy();

    return this._overlay.create({
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    });
  }

  /**
   * Creates and returns a position strategy used for aligning overlays connected
   * to a specific element reference with preset configuration for flexibility and offset.
   *
   * The position strategy is configured to:
   * - Center the overlay horizontally relative to the origin element.
   * - Align the overlay vertically below the origin with an offset.
   * - Enable flexible dimensions and push behavior to ensure the overlay remains visible within the viewport.
   *
   * @return {PositionStrategy} The configured position strategy for the overlay.
   */
  private _getPositionStrategy(): PositionStrategy {
    return this._overlay
      .position()
      .flexibleConnectedTo(this._elementRef)
      .withFlexibleDimensions(true)
      .withPush(true)
      .withPositions([
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetY: -8,
          offsetX: 10
        },
      ]);
  }

  /**
   * Cleanup and dispose of resources when the component is destroyed.
   * Stops any pending show or hide operations and disposes of the overlay reference if it exists.
   *
   * @return {void} No return value.
   */
  public ngOnDestroy(): void {
    this._cancelShow();
    this._cancelHide();

    if (this._overlayRef) {
      this._overlayRef.dispose();
    }
  }
}
