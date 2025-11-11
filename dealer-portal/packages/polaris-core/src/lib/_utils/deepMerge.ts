/**
 * Merges two plain objects deeply, combining their properties recursively.
 * 
 * @template T - The type of the target object.
 * @template U - The type of the source object.
 * 
 * @param target - The target object to be merged into. This object will not be mutated.
 * @param source - The source object whose properties will be merged into the target object.
 * 
 * @returns A new object that is the result of deeply merging the target and source objects.
 * 
 * @remarks
 * - If a property in both `target` and `source` is an object (and not an array), 
 *   the function will recursively merge those objects.
 * - If a property in `source` is not an object or is an array, it will overwrite 
 *   the corresponding property in `target`.
 * - The function ensures immutability by creating a new object instead of modifying 
 *   the `target` or `source` objects.
 * 
 * @example
 * ```typescript
 * const obj1 = { a: 1, b: { c: 2 } };
 * const obj2 = { b: { d: 3 }, e: 4 };
 * const result = deepMerge(obj1, obj2);
 * console.log(result); // { a: 1, b: { c: 2, d: 3 }, e: 4 }
 * ```
 */
export function deepMerge<T extends Record<string, unknown>, U extends Record<string, unknown>>(target: T, source: U): T & U {
  const result: Record<string, unknown> = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof result[key] === 'object' &&
        result[key] !== null &&
        !Array.isArray(result[key])
      ) {
        result[key] = deepMerge(result[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result as T & U;
}