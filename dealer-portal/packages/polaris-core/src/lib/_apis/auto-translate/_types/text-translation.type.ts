/**
 * Represents a text translation request or response.
 * Contains the text to be translated, the source language code, and the target language code.
 */
export interface TextTranslation {
  /** The text content to be translated. */
  text: string;
  /** The target language/culture code (e.g., 'fr', 'es'). */
  to: string;
}
