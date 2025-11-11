export class MapUtils {
  /**
   * Given a map and a value, provides the key to that value in the map.
   *
   * @template TKey The type of element used for keys
   * @template TValue The type of element used for values
   * @param map The map in which to find the key
   * @param value The value for which to find the key
   * @param equal A function used to determine if the values are equal.
   * @returns The key for the value given, or undefined if the value was not found.
   * @description Note that this uses strict equality (===) by default.
   */
  public static getKeyForValue<TKey, TValue>(
    map: Map<TKey, TValue>,
    value: TValue,
    equal: (a: TValue, b: TValue) => boolean = (a, b) => a === b
  ): TKey | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return [...map.entries()].find(([key, val]) => equal(val, value))?.[0];
  }
}
