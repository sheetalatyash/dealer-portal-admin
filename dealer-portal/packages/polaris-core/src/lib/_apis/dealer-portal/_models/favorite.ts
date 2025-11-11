/**
 * Represents a base object for favorite data with page id, page name, and URL information.
 */
export interface Favorite {
  /**
   * The page id of the page
   */
  pageId?: number;
  /**
   * The page name of the page
   */
  pageName?: string;

  /**
   * The URL associated with the page
   */
  url?: string;
}
