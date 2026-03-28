/** @format */

/**
 * Abstract class containing utility methods for Map operations.
 */
export abstract class MapUtils {
  /**
   * Returns the value associated with the specified key if it exists in the map.
   * If the key is not present, computes a new value using the provided function,
   * inserts it into the map, and returns the new value.
   *
   * @param {Map<K, V>} map - The map to operate on.
   * @param {K} key - The key to look up.
   * @param {() => V} ifAbsent - Function to generate a value if the key is absent.
   * @returns {V} The existing or newly created value associated with the key.
   */
  public static putIfAbsent<K, V>(
    map: Map<K, V>,
    key: K,
    ifAbsent: () => V
  ): V {
    if (map.has(key)) {
      return map.get(key) as V;
    } else {
      const newValue = ifAbsent();
      map.set(key, newValue);
      return newValue;
    }
  }
}
