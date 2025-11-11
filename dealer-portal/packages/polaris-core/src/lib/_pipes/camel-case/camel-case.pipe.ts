import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelCase',
  standalone: true,
})
export class CamelCasePipe implements PipeTransform {
  /**
   * Transforms a given string into camelCase format.
   *
   * @param value - The string to be transformed. If no value is provided, an empty string is returned.
   * @returns The transformed string in camelCase format.
   */
  public transform(value: string): string {
    // If no value is provided, return an empty string to avoid errors in template bindings or Angular expressions
    if (!value) return '';

    return value
      .toLowerCase()
      .replace(/[^a-zA-Z]+(.)/g, (match, chr) => chr.toUpperCase());
  }
}
