/**
 * Represents the variables object for a GraphQL request.
 * Keys are variable names, values are their values.
 */
export type GraphQLVariables = { [key: string]: any };

/**
 * Base class for a GraphQL operation (query or mutation).
 * Used for more type safe operations with GraphQL.
 * @template V - Type of variables for the operation.
 * @template R - Type of the expected response data.
 */
export abstract class GraphQLOperation<V extends GraphQLVariables | undefined = undefined, R = any> {
  /** The GraphQL query or mutation string. */
  abstract query: string;
  /** The variables for the operation, if any. */
  variables?: V;
}

/**
 * Recursively makes all File/Blob fields nullable (File | Blob | null)
 */
type NullifyFilesAndBlobs<T> = {
  // For each property K in T
  [K in keyof T]: T[K] extends File | Blob // If the property is a File or Blob, make it nullable
    ? File | Blob | null
    : // If the property is an array, recursively apply NullifyFilesAndBlobs to its element type
    T[K] extends Array<infer U>
    ? Array<NullifyFilesAndBlobs<U>>
    : // If the property is an object, recursively apply NullifyFilesAndBlobs to its type
    T[K] extends object
    ? NullifyFilesAndBlobs<T[K]>
    : // Otherwise, leave the property type unchanged
      T[K];
};

/**
 * Abstract class for GraphQL file upload operations.
 * Enforces that variables are of type NullifyFiles<T>.
 */
export abstract class GraphQLFileOperation<
  V extends GraphQLVariables | undefined = undefined,
  R = any,
> extends GraphQLOperation<NullifyFilesAndBlobs<V>, R> {
  /**
   * Processes variables for the GraphQL operation.
   * Nullifies all File/Blob values and returns a file map.
   */
  extractFilePathsAndNullifyVariables(): {
    nullified: NullifyFilesAndBlobs<V>;
    fileToPaths: Map<File | Blob, string[]>;
  } {
    // Map from files to variable object paths so we can reuse files in the form data instead of naively adding duplicates
    const fileToPaths: Map<File | Blob, string[]> = new Map();

    // Recursively walk the variables object to find File/Blob instances, set them to null, and build the fileMap and fileToPaths
    // Return type and node parameter MUST be of type 'any' since we need to be able to handle any structure of the variables object
    function walk(node: any, path: string): any {
      // If the node is a File or Blob, record its path and return null
      if (node instanceof File || node instanceof Blob) {
        if (!fileToPaths.has(node)) {
          fileToPaths.set(node, []);
        }
        fileToPaths.get(node)!.push(path);
        return null;
      }
      // If the node is an array, recurse into each item
      else if (Array.isArray(node)) {
        return node.map((item, index) => walk(item, `${path}.${index}`));
      }
      // If the node is an object, recurse into its properties
      else if (node && typeof node === 'object') {
        // Result object to hold the processed properties, with nullified files and blobs
        const result: any = {};
        for (const key of Object.keys(node)) {
          result[key] = walk(node[key], `${path}.${key}`);
        }
        return result;
      }

      // Non-file and non-blob Primitive value, return as is
      return node;
    }

    const nullified = walk(this.variables, 'variables');
    return { nullified, fileToPaths };
  }

  /**
   * Generates FormData for a multipart GraphQL file upload request.
   */
  toFormData(): FormData {
    const { nullified, fileToPaths } = this.extractFilePathsAndNullifyVariables();

    // Construct the 'operations' and 'map' fields for the multipart request
    const operations = JSON.stringify({
      query: this.query,
      variables: nullified,
    });

    const map: { [key: string]: string[] } = {};
    let index = 0;

    // Map from file/blob to its assigned field index in the form data
    const fileFieldIndexes = new Map<File | Blob, string>();
    // Assign a single field index for each unique file/blob
    for (const [file, paths] of fileToPaths.entries()) {
      map[index] = paths;
      fileFieldIndexes.set(file, String(index));
      index++;
    }

    // Construct the FormData
    const formData = new FormData();
    formData.append('operations', operations);
    formData.append('map', JSON.stringify(map));
    // Append each unique file/blob only once
    for (const [file, index] of fileFieldIndexes.entries()) {
      formData.append(index, file);
    }

    return formData;
  }
}

/**
 * Represents a standard GraphQL response.
 * @template T - Type of the expected data.
 */
export interface GraphQLResponse<T> {
  /** The data returned by the GraphQL server. */
  data?: T;
  /** Array of errors, if any occurred. */
  errors?: GraphQLErrorItem[];
}

/**
 * Represents a GraphQL error, including message and error details.
 * Can be used in place of a normal Error for logging and debugging.
 */
export class GraphQLError extends Error {
  /** Array of error details from the GraphQL response. */
  public errors: GraphQLErrorItem[];

  /**
   * Constructs a new GraphQLError.
   * @param message - The error message.
   * @param errors - Array of error details.
   */
  constructor(message: string, errors: GraphQLErrorItem[] = []) {
    super(message);
    this.name = 'GraphQLError';
    this.errors = errors;
    Object.setPrototypeOf(this, GraphQLError.prototype);
  }
}

/**
 * Represents a single error item in a GraphQL response.
 */
export interface GraphQLErrorItem {
  /** The error message. */
  message: string;
  /** Array of locations in the query where the error occurred. */
  locations?: GraphQLErrorLocation[];
  /** Path to the field in the response that caused the error. */
  path?: (string | number)[];
}

/**
 * Represents a location in a GraphQL query (line and column).
 */
export interface GraphQLErrorLocation {
  line: number;
  column: number;
}

/**
 * Pagination info for GraphQL connections (cursor-based pagination).
 */
export interface GraphQLPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

/**
 * Represents an edge in a GraphQL connection (node and cursor).
 * @template T - Type of the node.
 */
export interface GraphQLEdge<T> {
  node: T;
  cursor: string;
}

/**
 * Represents a GraphQL connection
 * Supports both cursor-based (edges) and flat (nodes) results.
 *
 * - `edges`: Array of edge objects, each containing a node and a cursor.
 * - `nodes`: Array of nodes (items) directly, for convenience.
 * - `pageInfo`: Pagination metadata.
 * - `totalCount`: Total number of items in the connection.
 *
 * @template T - Type of the node in the connection.
 */
export interface GraphQLConnection<T> {
  edges?: GraphQLEdge<T>[];
  nodes?: T[];
  pageInfo: GraphQLPageInfo;
  totalCount?: number;
}
