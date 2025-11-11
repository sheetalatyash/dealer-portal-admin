import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  private _regexPatterns: Record<string, RegExp> = {
    digitsOnly: /^[0-9]+$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^\(\d{3}\) \d{3}-\d{4}$/,
    time12Hour: /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i,
    time24Hour: /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/,
    utcOffset: /([+-])(\d{2}):(\d{2})/g,
  };

  // Timezone Offset regex
  public get digitsOnlyRegex(): RegExp {
    return this._regexPatterns['digitsOnly'];
  }

  // Email regex
  public get emailRegex(): RegExp {
    return this._regexPatterns['email'];
  }

  // Email validator
  public emailValidator(): ValidatorFn {
    return this._regexValidator(this.emailRegex, 'invalidEmail');
  }

  // Phone regex
  public get phoneRegex(): RegExp {
    return this._regexPatterns['phone'];
  }

  // Phone validator
  public phoneValidator(): ValidatorFn {
    return this._regexValidator(this.phoneRegex, 'invalidPhone');
  }

  // 12 Hour Time regex
  public get time12HourRegex(): RegExp {
    return this._regexPatterns['time12Hour'];
  }

  // 12 Hour Time validator
  public time12HourValidator(): ValidatorFn {
    return this._regexValidator(this.time12HourRegex, 'invalid12HourTime');
  }

  // 24 Hour Time regex
  public get time24HourRegex(): RegExp {
    return this._regexPatterns['time24Hour'];
  }

  // 24 Hour Time validator
  public time24HourValidator(): ValidatorFn {
    return this._regexValidator(this.time24HourRegex, 'invalid24HourTime');
  }

  // UTC Offset regex
  public get utcOffsetRegex(): RegExp {
    return this._regexPatterns['utcOffset'];
  }

  /**
   * Validator that ensures the control's value contains only digits 0–9.
   *
   * @returns A `ValidatorFn` that checks the given `AbstractControl`.
   *
   * @example
   * ```ts
   * const form = new FormGroup({
   *   accountNumber: new FormControl('', [this.validationService.digitsOnlyValidator()]),
   * });
   * ```
   */
  public digitsOnlyValidator(): ValidatorFn {
    return this._regexValidator(this.digitsOnlyRegex, 'digitsOnly');
  }

  /**
   * A public method that creates a validator function which validates if at least one of the provided validators is valid on the input.
   * This function is useful when you want to apply multiple validation rules and consider the input valid if any one of them passes.
   *
   * @param validators - An array of validator functions to test the control value against.
   *
   * @returns A validator function that can be used with Angular's Form Validation API.
   *
   * @example
   * ```typescript
   * const requiredValidator = Validators.required;
   * const emailValidator = Validators.email;
   *
   * // Usage in a form validation
   * const form = new FormGroup({
   *   contact: new FormControl('', [this.validationService.orValidator([requiredValidator, emailValidator])]),
   * });
   * ```
   */
  public orValidator(validators: ValidatorFn[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      for (const validator of validators) {
        const result = validator(control);
        if (!result) {
          return null; // If any validator passes, the control is valid
        }
      }

      return { or: true }; // If all validators fail, return an error
    };
  }

  /**
   * A public method that creates a validator function which validates if the control's value is a number
   * and optionally checks if it falls within the specified bounds.
   * This function is useful when you want to ensure that the input is numeric and additionally within a certain range.
   *
   * @param bounds - An optional object with `min` and/or `max` properties to specify the numeric bounds.
   *
   * @returns A validator function that can be used with Angular's Form Validation API.
   *
   * @example
   * ```typescript
   * // Usage in a form validation
   * const form = new FormGroup({
   *   age: new FormControl('', [numericValidator({ min: 18, max: 65 })]),
   * });
   * ```
   */
  public numericValidator(bounds?: { min?: number; max?: number }): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === undefined || value === '') {
        return null; // Don't validate empty values to allow required validator to handle them
      }

      if (!/^\d+$/.test(value)) {
        return { isNotNumeric: true };
      }

      const numericValue = parseInt(value, 10);

      if (bounds) {
        if (bounds.min !== undefined && numericValue < bounds.min) {
          return { belowMin: true };
        }
        if (bounds.max !== undefined && numericValue > bounds.max) {
          return { aboveMax: true };
        }
      }

      return null;
    };
  }

  /**
   * A private method that creates a validator function based on a given regular expression pattern.
   * This function is used to validate form control values against the specified pattern.
   *
   * @param pattern - The regular expression pattern to test the control value against.
   * @param errorKey - The key to use in the validation errors object if the control value does not match the pattern.
   *
   * @returns A validator function that can be used with Angular's Form Validation API.
   *
   * @example
   * ```typescript
   * const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   * const phonePattern = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
   *
   * // Usage in a form validation
   * const form = new FormGroup({
   *   email: new FormControl('', [this.validationService.emailValidator()]),
   *   phone: new FormControl('', [this.validationService.phoneValidator()]),
   * });
   * ```
   */
  private _regexValidator(pattern: RegExp, errorKey: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value || pattern.test(value)) {
        return null; // Valid
      }

      return { [errorKey]: true }; // Invalid
    };
  }

  /**
   * A custom validator function that checks if two form control values match.
   * This function is intended to be used with Angular's Form Validation API.
   *
   * @remarks This validation does not run until both controls have been interacted with.
   * This means you should mark both controls as dirty AND touched to invoke this validator.
   *
   * @param controlName - The name of the form control to validate.
   * @param matchingControlName - The name of the form control to compare against.
   *
   * @returns A validator function that can be used with Angular's Form Validation API.
   *
   * @example
   * ```typescript
   * const form = new FormGroup({
   *   password: new FormControl('', [Validators.required]),
   *   confirmPassword: new FormControl('', [Validators.required]),
   * }, { validators: [this.validationService.confirmInputMatchValidator('password', 'confirmPassword')] });
   * ```
   */
  public confirmInputMatchValidator(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): null => {
      const control: AbstractControl = formGroup.get(controlName) as AbstractControl;
      const matchingControl: AbstractControl = formGroup.get(matchingControlName) as AbstractControl;

      if (!control || !matchingControl) {
        return null;
      }

      const existingErrors: ValidationErrors | null = matchingControl.errors || {};

      // If neither control has been interacted with, skip validation entirely
      const bothPristine: boolean = !control.dirty && !matchingControl.dirty && !control.touched && !matchingControl.touched;
      if (bothPristine) {
        // Remove only mismatch if previously set, keep all others
        if (existingErrors['mismatch']) {
          delete existingErrors['mismatch'];
          matchingControl.setErrors(Object.keys(existingErrors).length ? existingErrors : null);
        }

        return null;
      }

      // If one of them hasn’t been touched yet, skip mismatch check for now
      const oneUntouched: boolean = !(control.dirty || control.touched) || !(matchingControl.dirty || matchingControl.touched);
      if (oneUntouched) {
        if (existingErrors['mismatch']) {
          delete existingErrors['mismatch'];
          matchingControl.setErrors(Object.keys(existingErrors).length ? existingErrors : null);
        }

        return null;
      }

      // If they both have been touched, check if values match and set mismatch error accordingly
      const hasMismatch: boolean = control.value !== matchingControl.value;

      if (hasMismatch) {
        // Merge mismatch into existing errors
        matchingControl.setErrors({
          ...existingErrors,
          mismatch: true,
        });
      } else {
        // Remove only mismatch while preserving other errors
        if (existingErrors['mismatch']) {
          delete existingErrors['mismatch'];
        }

        const hasOtherErrors: boolean = Object.keys(existingErrors).length > 0;
        matchingControl.setErrors(hasOtherErrors ? existingErrors : null);
      }

      return null;
    };
  }

  /**
   * A custom validator that ensures at least one checkbox (boolean control)
   * is selected (`true`) within a FormGroup.
   *
   * This validator supports:
   * - **Flat FormGroup** of checkboxes (e.g., `{ option1: FormControl<boolean>, option2: FormControl<boolean> }`)
   * - **Nested FormGroup** of FormGroups (e.g., `{ ORV: FormGroup, SNOW: FormGroup }`)
   * - **FormArray** of checkboxes (optional, if used in other places)
   *
   * @returns A `ValidatorFn` that checks the given `AbstractControl`.
   *
   * @example
   * ```ts
   * // Flat group example
   * const form = new FormGroup({
   *   option1: new FormControl(false),
   *   option2: new FormControl(false),
   *   option3: new FormControl(false),
   * }, { validators: [this.validationService.atLeastOneSelectedValidator()] });
   *
   * // Nested group example
   * const parent = new FormGroup({
   *   ORV: new FormGroup({
   *     ATV: new FormControl(false),
   *     RZR: new FormControl(false),
   *   }),
   *   SNOW: new FormGroup({
   *     SNO: new FormControl(false),
   *     TSL: new FormControl(false),
   *   }),
   * }, { validators: [this.validationService.atLeastOneSelectedValidator()] });
   *
   * // FormArray example
   * const array = new FormArray([
   *   new FormControl(false),
   *   new FormControl(false),
   * ]);
   * array.setValidators([this.validationService.atLeastOneSelectedValidator()]);
   * ```
   *
   * @remarks
   * - Returns `null` if at least one value is `true`.
   * - Returns `{ atLeastOneSelected: true }` if none are selected.
   */
  public atLeastOneSelectedValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {

      // Handle FormArray of checkboxes
      if (formGroup instanceof FormArray) {
        const hasTrue: boolean = formGroup.controls.some((control: AbstractControl) => control.value === true);

        return hasTrue ? null : { atLeastOneSelected: true };
      }

      // Handle FormGroup of checkboxes
      if (formGroup instanceof FormGroup) {
        const controls: { [key: string]: AbstractControl } = formGroup.controls;

        const hasAtLeastOneTrue: boolean = Object.values(controls).some((control: AbstractControl) => {
          if (control instanceof FormGroup) {

            // Handle Nested FormGroup
            return Object.values(control.value).some(val => val === true);
          }

          return control.value === true;
        });

        return hasAtLeastOneTrue ? null : { atLeastOneSelected: true };
      }

      // Return null if no form control is found or if it's not a FormArray or FormGroup
      return null;
    };
  }
}
