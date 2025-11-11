import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'kebabCase',
  standalone: true,
})
export class KebabCasePipe implements PipeTransform {
  /**
   * Transforms a given string into kebabCase format.
   *
   * @param value - The string to be transformed. If no value is provided, an empty string is returned.
   * @returns The transformed string in kebabCase format.
   */
  public transform(value: string): string {
    // If no value is provided, return an empty string to avoid errors in template bindings or Angular expressions
    if (!value) return '';

    return value
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Convert camelCase to space-separated words
      .replace(/[^a-zA-Z0-9]+/g, ' ') // Replace non-alphanumeric characters (including dashes) with space
      .trim() // Remove leading/trailing spaces
      .replace(/\s+/g, '-') // Replace spaces with a single hyphen
      .toLowerCase();
  }
}
