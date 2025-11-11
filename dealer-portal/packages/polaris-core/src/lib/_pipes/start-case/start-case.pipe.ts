import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'startCase',
  standalone: true,
})
export class StartCasePipe implements PipeTransform {
  /**
   * A pipe that transforms a string into start case format.
   *
   * Start case is a text transformation where the first letter of each word is capitalized,
   * and all other letters are converted to lowercase.
   *
   * @example
   * // Example usage in a template
   * <div>{{ 'helloWorld' | startCase }}</div>
   * // Output: 'Hello World'
   *
   * @example
   * // Example usage in a component
   * const input = 'helloWorld';
   * const output = this.startCasePipe.transform(input);
   * console.log(output); // Output: 'Hello World'
   *
   * @param value The string to be transformed.
   * @returns The transformed string in start case format.
   */

  /**
   * Conjunctions to remain lowercase (English).
   * TODO: Verify if this list is needed for other languages. If so, move to translation service.
   * @type {Set<string>}
   * @private
   */
  private readonly _conjunctions: Set<string> = new Set([
    'and',
    'at',
    'but',
    'by',
    'for',
    'in',
    'nor',
    'of',
    'on',
    'or',
    'so',
    'to',
    'with',
    'yet',
  ]);

  public transform(value: string): string {
    if (!value) return '';

    // Replace non-alphanumeric characters with a space, then split on uppercase transitions
    const words: string[] = value
      .replace(/([a-z])([A-Z])/g, '$1 $2')  // Handle camelCase
      .replace(/[^a-zA-Z0-9]+/g, ' ')       // Handle non-alphanumeric characters
      .trim()                                                     // Trim leading/trailing spaces
      .split(' ');                                       // Split by space

    return words
      .map((word, index) => {
        const lower = word.toLowerCase();
        // Always capitalize the very first word:
        if (index === 0) {
          return lower.charAt(0).toUpperCase() + lower.slice(1);
        }
        // If it’s an exception (conjunction), keep it fully lowercase:
        if (this._conjunctions.has(lower)) {
          return lower;
        }

        // Otherwise Title Case it:
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join(' ');
  }
}
