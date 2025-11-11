import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneNumber',
  standalone: true,
})
export class PhoneNumberPipe implements PipeTransform {
  /**
   * Transforms a given phone number into a standardized format.
   *
   * @param value - The phone number to be transformed. It can be a string or a number.
   *                If the input is a number, it will be converted to a string.
   * @returns A formatted phone number string in the format (XXX) XXX-XXXX if the input
   *          contains exactly 10 digits. If the input is not 10 digits, the original
   *          input is returned as a string.
   */
  public transform(value: string | number): string {
    // If no value is provided, return an empty string to avoid errors in template bindings or Angular expressions
    if (!value) return '';

    // Convert the input to a string in case it's passed as a number
    let phone = value.toString();

    // Remove any non-numeric characters
    phone = phone.replace(/\D/g, '');

    // Format the number as (XXX) XXX-XXXX
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    } else {
      // If the phone number doesn't have 10 digits, return the unformatted input
      return value.toString();
    }
  }
}
