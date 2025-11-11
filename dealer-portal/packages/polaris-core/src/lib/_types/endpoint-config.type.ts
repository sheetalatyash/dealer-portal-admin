/**
 * Configuration for an API endpoint.
 */
export type EndpointConfig = {
  /**
   * The base URL of the API endpoint.
   */
  baseUrl: string;
  /**
   * Optional subscription key for Azure API Management (APIM).
   */
  apimSubscriptionKey?: string;
};
