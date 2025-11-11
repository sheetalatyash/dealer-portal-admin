// fuzzy-search.service.ts
import { Injectable } from '@angular/core';
import Fuse, * as Fuzzy from 'fuse.js';

/**
 * Represents a key (or weighted key) used in fuzzy searching.
 * You can specify either a property name of your record type,
 * or a weighted key configuration.
 */
export type FuzzyKey<RecordType> =
  | keyof RecordType
  | { name: keyof RecordType; weight: number };

/**
 * Represents a single search key configuration for the fuzzy search engine.
 * This may be a plain property name of the record type or a structured
 * Fuse.js option key that includes weighting information.
 */
export type FuzzySearchKeyDefinition<RecordType> =
  | keyof RecordType
  | Fuzzy.FuseOptionKey<RecordType>;

/**
 * Configuration values that control the behavior of the fuzzy search engine.
 * @template RecordType The type of the items to be searched.
 */
export interface FuzzySearchConfiguration<RecordType> {
  /**
   * The set of fields on the record that are used for searching.
   * Keys can be simple property names or weighted Fuse.js key objects.
   */
  readonly keys: ReadonlyArray<FuzzyKey<RecordType>>;

  /**
   * The minimum number of characters in the query before a fuzzy search is performed.
   * When the query is shorter than this value and extended search is disabled,
   * the service will skip Fuse.js and return the prefiltered items unchanged.
   * @default 2
   */
  readonly minMatchCharacterLength?: number;

  /**
   * The threshold for match acceptance used by Fuse.js.
   * Lower values are more strict (fewer, more precise matches).
   * Higher values are more permissive (more, looser matches).
   * Accepted range is 0.0 to 1.0.
   * @default 0.34
   */
  readonly threshold?: number;

  /**
   * If true, enables Fuse.js extended search syntax (e.g., ^prefix, 'phrase).
   * When enabled, an empty query returns the prefiltered items unchanged.
   * @default false
   */
  readonly useExtendedSearch?: boolean;

  /**
   * If true, the position of the match within a string is ignored by Fuse.js,
   * which typically improves the perceived quality of general fuzzy matching.
   * @default true
   */
  readonly ignoreLocation?: boolean;

  /**
   * An optional predicate that filters the dataset prior to running the fuzzy search.
   * This is useful for applying deterministic filters (e.g., status codes, categories)
   * before executing the fuzzy portion of the search.
   */
  readonly preFilterPredicate?: (item: RecordType) => boolean;
}

/**
 * A complete request describing a single fuzzy search operation.
 * @template RecordType The type of the items to be searched.
 */
export interface FuzzySearchRequest<RecordType> {
  /**
   * The complete set of items to be considered for searching.
   * This collection will be optionally prefiltered and then searched via Fuse.js.
   */
  readonly items: ReadonlyArray<RecordType>;

  /**
   * The user-provided search text to match against the configured keys.
   */
  readonly query: string;

  /**
   * The configuration describing keys, thresholds, and optional prefiltering.
   */
  readonly configuration: FuzzySearchConfiguration<RecordType>;

  /**
   * An optional prebuilt Fuse.js index that corresponds to the provided items and keys.
   * Supplying an index can significantly reduce search latency on large datasets.
   */
  readonly index?: Fuzzy.FuseIndex<RecordType>;
}

/**
 * The result produced by a fuzzy search operation.
 * @template RecordType The type of the items that were searched.
 */
export interface FuzzySearchResponse<RecordType> {
  /**
   * The matched items ordered from best match to worst match.
   */
  readonly results: ReadonlyArray<RecordType>;

  /**
   * The matched items paired with their corresponding Fuse.js scores.
   * Lower scores indicate stronger matches. Provided for diagnostics or ranking analysis.
   */
  readonly scored?: ReadonlyArray<{ readonly item: RecordType; readonly score: number }>;
}

/**
 * A standalone, strongly-typed Angular service that wraps Fuse.js to provide
 * configurable, reusable fuzzy search across arbitrary record types.
 *
 * The service exposes two primary entry points:
 * - {@link buildIndexForItems}: Prebuild a Fuse.js index that can be cached for performance.
 * - {@link performSearch}: Execute a one-shot search with optional prefiltering and optional index reuse.
 *
 * All parameters and return values are strictly typed. No `any` or implicit types are used.
 */
@Injectable({ providedIn: 'root' })
export class FuzzySearchService {
  /**
   * Builds a Fuse.js index for the provided items and keys. The resulting index
   * can be cached by the caller and reused across multiple searches to improve
   * performance, especially for large datasets where the set of items changes
   * infrequently relative to the search query.
   *
   * @typeParam RecordType - The type of the items to be indexed and searched.
   * @param items - The dataset for which to build the index.
   * @param keys - The set of record keys used by the fuzzy search engine.
   * @returns A Fuse.js index that can be supplied to {@link performSearch}.
   *
   * @example
   * ```ts
   * const index = fuzzySearchService.buildIndexForItems<User>(allUsers, [
   *   { name: 'firstName', weight: 0.4 },
   *   { name: 'lastName',  weight: 0.4 },
   *   'emailAddress'
   * ]);
   * ```
   */
  public buildIndexForItems<RecordType>(
    items: ReadonlyArray<RecordType>,
    keys: ReadonlyArray<FuzzyKey<RecordType>>,
  ): Fuzzy.FuseIndex<RecordType> {
    const fuzzyKeys = keys as ReadonlyArray<Fuzzy.FuseOptionKey<RecordType>>;

    return Fuse.createIndex([...fuzzyKeys], items);
  }

  /**
   * Performs a fuzzy search over the provided dataset using the supplied configuration
   * and optional prebuilt index. If a prefilter predicate is provided, items are first
   * filtered deterministically before applying the fuzzy matching. If the query is too
   * short (as determined by `minMatchCharacterLength`) and extended search is disabled,
   * the prefiltered items are returned unchanged.
   *
   * @typeParam RecordType - The type of the items to be searched.
   * @param request - The full search request including items, query, configuration, and optional index.
   * @returns A response containing ordered results and optional scores.
   *
   * @example
   * ```ts
   * const response = fuzzySearchService.performSearch<User>({
   *   items: allUsers,
   *   query: searchTerm,
   *   index: cachedIndex,
   *   configuration: {
   *     keys: [
   *       { name: 'firstName', weight: 0.35 },
   *       { name: 'lastName',  weight: 0.35 },
   *       { name: 'emailAddress', weight: 0.25 },
   *     ],
   *     threshold: 0.3,
   *     minMatchCharacterLength: 2,
   *     ignoreLocation: true,
   *     useExtendedSearch: false,
   *     preFilterPredicate: (user) => user.employeeStatusCode === 'ACTIVE',
   *   },
   * });
   *
   * console.log(response.results);
   * ```
   */
  public performSearch<RecordType>(request: FuzzySearchRequest<RecordType>): FuzzySearchResponse<RecordType> {
    const {
      items,
      query,
      index,
      configuration,
    }: FuzzySearchRequest<RecordType> = request;

    const {
      keys,
      minMatchCharacterLength = 2,
      threshold = 0.34,
      useExtendedSearch = false,
      ignoreLocation = true,
      preFilterPredicate,
    }: FuzzySearchConfiguration<RecordType> = configuration;

    const prefilteredItems: ReadonlyArray<RecordType> =
      preFilterPredicate ? (items.filter(preFilterPredicate) as ReadonlyArray<RecordType>) : items;

    const normalizedQuery: string = (query ?? '').trim();

    // When extended search is not used and the query is shorter than the minimum length,
    // return the prefiltered items unchanged to avoid noisy results.
    if (!useExtendedSearch && normalizedQuery.length < minMatchCharacterLength) {
      return { results: prefilteredItems };
    }

    // When extended search is used, an empty query should also return the prefiltered items.
    if (useExtendedSearch && normalizedQuery.length === 0) {
      return { results: prefilteredItems };
    }

    const fuseOptions: Fuzzy.IFuseOptions<RecordType> = {
      keys: keys as unknown as Fuzzy.FuseOptionKey<RecordType>[],
      includeScore: true,
      isCaseSensitive: false,
      shouldSort: true,
      threshold,
      ignoreLocation,
      minMatchCharLength: minMatchCharacterLength,
      useExtendedSearch,
    };

    // Create a fuzzy instance using either the provided reusable index or a fresh index.
    const fuzzyInstance: Fuse<RecordType> = new Fuse<RecordType>(
      prefilteredItems,
      fuseOptions,
      index,
    );

    const fuzzyResults: readonly Fuzzy.FuseResult<RecordType>[] = fuzzyInstance.search(normalizedQuery);

    const orderedItems: ReadonlyArray<RecordType> = fuzzyResults.map(
      (result: Fuzzy.FuseResult<RecordType>): RecordType => result.item,
    );

    const orderedItemsWithScores: ReadonlyArray<{ readonly item: RecordType; readonly score: number }> =
      fuzzyResults.map(
        (result: Fuzzy.FuseResult<RecordType>): { readonly item: RecordType; readonly score: number } => ({
          item: result.item,
          score: result.score ?? 0,
        }),
      );

    return {
      results: orderedItems,
      scored: orderedItemsWithScores,
    };
  }
}
