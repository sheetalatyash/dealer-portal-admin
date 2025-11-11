import { Component, computed, Input, Signal, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatError } from '@angular/material/form-field';
import { PolarisUiBase } from '../polaris-ui-base';


/**
 * PolarisError Component
 *
 * A reusable error display component that extends PolarisUiBase to provide
 * consistent error messaging and styling across the Polaris UI library.
 * This component is designed to show error states, validation messages,
 * or general error information to users.
 *
 * @example
 * Basic usage:
 * ```html
 * <polaris-error [visible]="condition">Error text here</polaris-error>
 *
 * <polaris-error error="Error text here"></polaris-error>
 *
 * <polaris-error [errors]="errorArray"></polaris-error>
 * ```
 *
 */
 @Component({
    selector: 'polaris-error',
   imports: [
     CommonModule,
     MatError,
   ],
    templateUrl: './polaris-error.component.html',
    styleUrl: './polaris-error.component.scss'
})
export class PolarisError extends PolarisUiBase {
  /**
   * Single error string
   */
  private _error: WritableSignal<string | null | undefined> = signal<string | null>(null);
  @Input() public set error(value: string | null | undefined) {
    this._error.set(value ?? null);
  }

  /**
   * Multiple errors
   */
  private _errors: WritableSignal<string[] | null | undefined>  = signal<string[]>([]);
  @Input() public set errors(value: string[] | null | undefined) {
    this._errors.set(value ?? []);
  }

  /**
   * Control visibility
   */
  @Input() visible: boolean = true;

  /**
   * Normalized list of errors
   */
  public readonly normalizedErrors: Signal<string[]> = computed(() => {
    const errorsSet = new Set<string>();
    const singleError: string | null | undefined = this._error();

    if (singleError) {
      errorsSet.add(singleError);
    }

    const multipleErrors: string[] | null | undefined = this._errors();
    if (multipleErrors && multipleErrors.length > 0) {
      multipleErrors.forEach(err => errorsSet.add(err));
    }

    return Array.from(errorsSet);
  });
}
