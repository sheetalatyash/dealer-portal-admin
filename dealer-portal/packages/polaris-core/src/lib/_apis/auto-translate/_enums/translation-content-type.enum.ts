/**
 * Enum representing the supported translation content types.
 * Used to specify the type of content being translated by the translation API.
 */
export enum TranslationContentType {
  /** File upload translation (e.g., documents). */
  File = 'upload',
  /** HTML content translation. */
  HTML = 'html',
  /** JSON content translation. */
  JSON = 'json',
  /** Plain text translation. */
  Text = 'text',
}
