import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisThemeLevel } from './polaris-ui-theme-level.enum';

@Component({
    selector: 'polaris-ui-base',
    imports: [CommonModule],
    template: '',
})
export class PolarisUiBase {

  /**
   * Which theme to use for the element
   * @type {PolarisThemeLevel}
   */
  @Input('ui-theme') theme: PolarisThemeLevel | string = PolarisThemeLevel.Primary as PolarisThemeLevel;

  /**
   * A variable representing a custom CSS class name for an element.
   * @type {string}
   */
  @Input('ui-class') customClass: string = '';

  /**
   * The testId represents the unique test ID for an element.
   * @type {string}
   * @default 'polaris-ui-element-test-id'
   */
  @Input('ui-test-id') testId: string = 'polaris-ui-element-test-id';

  /**
   * Whether to disable the element.
   * @type {boolean}
   *
   * @note Do not use this for reactive form elements.
   * Instead, use the 'disabled' property on the FormControl directly.
   */
  @Input('ui-disabled') disabled: boolean = false;

  /**
   * The tooltip text to display.
   * @type {string}
   */
  @Input('ui-tooltip') tooltip: string = '';

  /**
   * Enables subscribing to tooltip events, overriding the default hover behavior
   * @type {boolean}
   */
  @Input('ui-tooltip-action') tooltipAction: boolean = false;

  /**
   * The label to display next to the element.
   * @type {string}
   */
  @Input('ui-label') label: string = '';

  /**
   * Whether to show the label next to the element.
   * @type {boolean}
   * @Default true
   */
  @Input('ui-show-label') showLabel: boolean = true;

  /**
   * The orientation of the element.
   * @type {'horizontal' |'vertical'}
   * @default 'horizontal'
   */
  @Input('ui-orientation') orientation: 'horizontal' | 'vertical' = 'horizontal';

  /**
   * Event Emitters
   * EventEmitters used to emit a string value when various mouse events occur.
   * @type EventEmitter<MouseEvent>
   */
  @Output() onClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output() onMouseEnter: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output() onMouseLeave: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output() onError: EventEmitter<string[]> = new EventEmitter<string[]>();

  /**
   * Emits the click event by calling the `onClick` event emitter.
   * @param {MouseEvent} event - The mouse event object.
   */
  public emitClickEvent(event: MouseEvent): void {
    this.onClick.emit(event);
  }

  /**
   * Emits a mouse enter event by calling the `onMouseEnter` event emitter.
   * @param {MouseEvent} event - The mouse event object.
   */
  public emitMouseEnterEvent(event: MouseEvent): void {
    this.onMouseEnter.emit(event);
  }


  /**
   * Emits a mouse leave event by calling the `onMouseLeave` event emitter.
   * @param {MouseEvent} event - The mouse leave event object.
   */
  public emitMouseLeaveEvent(event: MouseEvent): void {
    this.onMouseLeave.emit(event);
  }

  /**
   * Emits an event when errors are added, changed, or cleared.
   * @param {string[]} errorMessages - An array of strings.
   */
  public emitErrors(errorMessages: string[]): void {
    this.onError.emit(errorMessages);
  }
}
