export class StandardResponse<T> {
  /**
   * Indicates whether the response was successful.
   */
  success: boolean;

  /**
   * The data returned in the response, if any.
   */
  data?: T;

  /**
   * The error returned in the response, if any.
   */
  error?: Error;

  constructor(response: Partial<StandardResponse<T>>) {
    this.data = response.data;
    this.success = response.success || false;
    this.error = response.error;
  }
}
