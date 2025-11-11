import { Component, EventEmitter, Input, OnInit, Optional, Output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlEvent,
  FormControl,
  FormGroup,
  FormGroupDirective,
  ValidationErrors,
  ValueChangeEvent,
} from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs';
import { PolarisUiBase } from '../polaris-ui-base';

@UntilDestroy()
@Component({
    selector: 'polaris-ui-form-base',
    imports: [CommonModule],
    template: '',
})
export class PolarisUiFormBase<T> extends PolarisUiBase implements OnInit {
  /**
   * Custom ID given to the form element.
   *
   * @type {string}
   */
  @Input('ui-id') public id: string = '';

  /**
   * Determines whether the label should be stacked above the content.
   *
   * @type {boolean}
   */
  @Input('ui-stack-label') public stackLabel: boolean = true;

  /**
   * The form group associated with the element.
   * @type {FormGroup}
   */
  @Input('ui-form-group') formGroup!: FormGroup;

  /**
   * The form group name associated with the element.
   * @type {string}
   */
  @Input('ui-form-group-name') formGroupName!: string;


  private _formControl!: FormControl;
  /**
   * The form control associated with the element.
   * @type {FormControl}
   */
  @Input({
    transform: (value: FormControl | FormGroup | null | undefined): FormControl => {
      if (value instanceof FormControl) {
        return value;
      }
      if (value instanceof FormGroup) {
        for (const child of Object.values(value.controls)) {
          if (child instanceof FormControl) {
            return child;
          }
        }
      }

      return new FormControl();
    },
    alias: 'ui-form-control',
  })
  public set formControl(value: FormControl) {
    this._formControl = value;
    this.subscribeToControlEvents();
  }
  public get formControl(): FormControl {
    return this._formControl;
  }


  /**
   * The form control name associated with the form control.
   * @type {string}
   */
  @Input('ui-form-control-name') formControlName!: string;

  /**
   * The instructions to accompany the element if necessary.
   * @type {string}
   */
  @Input('ui-instructions') instructions: string = '';

  /**
   * The tooltip to show with the instructions.
   * @type {string | undefined}
   */
  @Input('ui-instructions-tooltip') instructionsTooltip: string = '';

  /**
   * The placeholder text for an input, select, textarea, or autocomplete element.
   * @type {string}
   */
  @Input('ui-placeholder') placeholder: string = '';

  /**
   * The custom error message to display to the user, used with reactive form elements.
   * @type {string[]}
   */
  @Input('ui-errors') errors: string[] = [];

  /**
   * The type of input element to render.
   * @type {string}
   */
  @Input('ui-type') type: 'text' | 'number' | 'phone' | 'currency' | 'date' = 'text';

  /**
   * The maximum sting length for an input, select, or textarea element.
   * @type {number | null}
   */
  @Input('ui-max-length') maxLength: string | number | null = null;

  /**
   * Whether to set the element as readonly.
   * Typically, Shows values as (✔) or (✖) icons
   * @type {boolean}
   */
  @Input('ui-readonly') readonly: boolean = false;

  /**
   * The outline color for the form element.
   * @type {'default' | 'primary'}
   */
  @Input('ui-outline-color') outlineColor: 'default' | 'primary' = 'default';

  /**
   * The default error messages for form validation.
   * Can be overridden
   * @type {ValidationErrors}
   */
  @Input() public errorMessages: ValidationErrors = {
    atLeastOneSelected: 'At least one <FIELD_NAME> must be selected',
    invalidEmail: 'Please enter a valid email address',
    mismatch: '<FIELD_NAME> Values do not match',
    invalidPhone: 'Please enter a valid phone number',
    required: '<FIELD_NAME> is required',
    invalid12HourTime: 'Please enter a valid time',
    invalid24HourTime: 'Please enter a valid time',
    or: 'At least one requirement must be met',
    isNotNumeric: '<FIELD_NAME> must be a number',
    belowMin: 'Value must be greater than or equal to the min',
    aboveMax: 'Value must be less than or equal to the max',
  };

  /**
   * Outputs the new array of options with the updated selections.
   * In case you need to bind to the selected options instead of a form control
   */
  @Output() public onSelectionChange: EventEmitter<ValueChangeEvent<T>> = new EventEmitter<ValueChangeEvent<T>>();

  constructor(@Optional() private _parentFormGroupDirective: FormGroupDirective) {
    super();
  }

  /**
   * Initializes the component.
   */
  public ngOnInit(): void {
    this._setFormControl();
  }

  /**
   * Initializes the form control.
   *
   * This method handles various scenarios for initializing the form control:
   * 1. If `formGroup` and `formControlName` are provided, it retrieves the `FormControl` from the `formGroup`.
   * 2. If `formGroupName` and `formControlName` are provided, it attempts to retrieve the `FormGroup` from the parent form, retrieves the sub `FormGroup` using the `formGroupName`, and then gets the `FormControl`.
   * 3. If only `formControlName` is provided, it attempts to retrieve the `FormGroup` from the parent form and then gets the `FormControl`.
   * 4. If none of the above conditions are met, it uses the inputted `FormControl` or otherwise a default blank `FormControl`.
   */
  private _setFormControl(): void {
    if (this.formControlName) {
      let parentFormGroup;
      if (this.formGroup) {
        parentFormGroup = this.formGroup;
      } else if (this._parentFormGroupDirective) {
        // If in the context of a form, retrieve the parent form from context
        const formContextGroup = this._parentFormGroupDirective.form;
        if (this.formGroupName) {
          parentFormGroup = formContextGroup.get(this.formGroupName) as FormGroup;
        } else {
          parentFormGroup = formContextGroup;
        }
      }

      // Attempt to retrieve the formControl only when a parent formGroup was found
      if (parentFormGroup) {
        this.formControl = parentFormGroup.get(this.formControlName) as FormControl;
      }
    }
  }

  /**
   * Processes form control errors and populates the `errors` array with corresponding error messages.
   *
   * @param errors - The form control errors object.
   *
   * @remarks
   * This method iterates through the provided errors object, checks if each error exists in the `errorMessages` map,
   * and replaces the `<FIELD_NAME>` placeholder with the processed label. The processed error messages are then added to the `errors` array.
   *
   * @example
   * ```typescript
   * const errors = { required: true, email: true };
   * this.label = 'First Name;
   * _getErrorMessages(errors);
   * // After execution, this.errors will contain: ['First Name is required', 'Please enter a valid email address']
   * ```
   */
  public getErrorMessages(errors: ValidationErrors | null): void {
    if (errors) {
      const newErrorMessages: string[] = [];

      for (const [key, value] of Object.entries(errors)) {
        if (value && this.errorMessages[key]) {
          newErrorMessages.push(this.errorMessages[key].replace('<FIELD_NAME>', this.label));
        }
      }

      // Only update if changed (prevents redundant emissions)
      const isChanged: boolean = JSON.stringify(newErrorMessages) !== JSON.stringify(this.errors);
      if (isChanged) {
        this.errors = newErrorMessages;
        this.emitErrors(this.errors);
      }
    } else {
      if (this.errors.length > 0) {
        this.errors = [];
        this.emitErrors([]);
      }
    }
  }

  /**
   * Formats the input value based on the specified type.
   *
   * When the input type is 'phone', it extracts the numeric characters from the input value,
   * formats the number according to the specified pattern, and updates the input value and form control.
   *
   * @param event - The event object that triggered the formatting.
   *
   * @returns {void}
   */
  public formatInput(event: Event): void {

    switch (this.type) {
      case 'phone':
        this._formatUSPhoneNumber(event);
        break;

      case 'currency':
        break;

      case 'number':
        this._formatNumberInput(event);
        break;

      case 'date':
        break;

      case 'text':
      default:
        // no formatting
        break;
    }

  }

  private _formatNumberInput(event: Event): void {
    if (this.type !== 'number') {
      return;
    }

    const input: HTMLInputElement = event.target as HTMLInputElement;
    const rawValue: string = input.value;

    // strip all non-digits
    const digits: string = rawValue.replace(/\D/g, '');

    // write it back
    input.value = digits;
    this.formControl.setValue(digits, { emitEvent: false });
    this.formControl.updateValueAndValidity({ emitEvent: true });
  }

  private _formatUSPhoneNumber(event: Event): void {
    if (this.type !== 'phone') {
      return;
    }

    // 1) capture the cursor’s position in terms of how many digits are before it
    const input: HTMLInputElement = event.target as HTMLInputElement;
    const rawValue: string = input.value;
    const oldCursorPos: number = input.selectionStart ?? rawValue.length;
    const digitsBeforeCursor: number = rawValue
      .slice(0, oldCursorPos)
      .replace(/\D/g, '')  // strip non-digits
      .length;

    // 2) strip to digits and build your formatted string
    const digits: string = rawValue.replace(/\D/g, '').slice(0, 10);
    let formatted: string = digits;
    if (digits.length > 6) {
      formatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }

    // 3) write it back
    input.value = formatted;
    this.formControl.setValue(formatted, { emitEvent: false });
    this.formControl.updateValueAndValidity({ emitEvent: true });

    // 4) map the old “digit count” back into the new string
    let newCursorPos: number = formatted.length;
    let seenDigits: number = 0;
    for (let i: number = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        seenDigits++;
        if (seenDigits === digitsBeforeCursor) {
          // place the cursor right after this digit
          newCursorPos = i + 1;
          break;
        }
      }
    }

    // finally, restore the caret
    input.setSelectionRange(newCursorPos, newCursorPos);
  }

  /**
   * Trims the leading and trailing spaces from the input value.
   *
   * @param event - The event object that triggered the trimming.
   */
  public trimOuterSpace(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    input.value = input.value.trim();
    this.formControl.setValue(input.value, { emitEvent: false });
  }

  /**
   * Subscribes to the events emitted by the form control to handle error message updates.
   * This method listens to the control's event stream, processes error messages when errors occur,
   * and ensures the subscription is automatically cleaned up to prevent memory leaks.
   *
   * @return {void} No return value.
   */
  public subscribeToControlEvents(): void {
    this.formControl.events
      .pipe(
        tap((event: ControlEvent): void => {

          if (event instanceof ValueChangeEvent && this.onSelectionChange.observed) {
            this.onSelectionChange.emit(event);
          }

        }),
        tap((): void => {
          // Always check/update errors regardless of observers
          this.getErrorMessages(this.formControl.errors);
        }),
        untilDestroyed(this)
      ).subscribe();
  }

  /**
   * Type guard utility that determines whether a given value
   * is an Angular {@link TemplateRef}.
   *
   * ### Purpose
   * This helper allows template and runtime logic to safely distinguish between
   * `TemplateRef` instances (Angular templates) and other content types such as
   * strings, numbers, or plain objects. Commonly used when rendering dynamic
   * content where `customContent` may be either an `ng-template` reference or
   * a string of HTML/text.
   *
   * ### Behavior
   * - Returns `true` if the provided `value` is an instance of `TemplateRef`.
   * - Returns `false` for all other data types (including `null` and `undefined`).
   *
   * ### Example Usage
   * #### Component Logic
   * ```typescript
   * const content: TemplateRef<unknown> | string = condition
   *   ? this.templateRef
   *   : '<strong>Static text content</strong>';
   *
   * if (this.isTemplateRef(content)) {
   *   // TypeScript now knows `content` is TemplateRef<unknown>
   *   this.viewContainer.createEmbeddedView(content);
   * } else {
   *   // Otherwise, handle string/HTML case
   *   this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(content);
   * }
   * ```
   *
   * #### Angular Template
   * ```html
   * <ng-container *ngIf="isTemplateRef(option.customContent); else htmlContent">
   *   <ng-container *ngTemplateOutlet="option.customContent"></ng-container>
   * </ng-container>
   *
   * <ng-template #htmlContent>
   *   <div [innerHTML]="safeHtmlContent"></div>
   * </ng-template>
   * ```
   *
   * @param value - The value to check for `TemplateRef` type.
   * @returns {value is TemplateRef<unknown>} - Type guard returning `true` if the value is a `TemplateRef`.
   *
   * @see {@link TemplateRef} - Angular core reference type for embedded templates.
   */
  public isTemplateRef(value: unknown): value is TemplateRef<unknown> {
    return value instanceof TemplateRef;
  }
}
