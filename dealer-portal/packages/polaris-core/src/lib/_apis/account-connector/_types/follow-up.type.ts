/**
 * Represents a base object for follow-up data with display name, count, and URL information.
 */
export interface FollowUp {
  /**
   * The display name for the follow-up data.
   */
  displayName?: string;

  /**
   * The count associated with the follow-up data.
   */
  count: number;

  /**
   * The URL associated with the follow-up data.
   */
  url?: string;
}
