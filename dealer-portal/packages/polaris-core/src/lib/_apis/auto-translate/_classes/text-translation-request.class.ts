import { TranslationContentType } from "../_enums";

/**
 * Represents a text translation request or response.
 * Contains the text to be translated, the source language code, and the target language code.
 */
export class TextTranslationRequest {
  /** The text content to be translated. */
  public text: string;
  /** The target language/culture code (e.g., 'fr', 'es'). */
  public to: string;
  /** The source language/culture code (e.g., 'en', 'de'). */
  public from: string;
  /** The type of content to translate. */
  public contentType: TranslationContentType

  /**
   * Constructs a new TextTranslation instance.
   * @param content The text content to translate.
   * @param contentType The type of content to translate
   * @param fromCultureCode The source language/culture code.
   * @param toCultureCode The target language/culture code.
   */
  constructor(content: string, contentType: TranslationContentType, fromCultureCode: string, toCultureCode: string) {
    this.text = content;
    this.contentType = contentType;
    this.to = toCultureCode;
    this.from = fromCultureCode;
  }
}
