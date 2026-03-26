/**
 * Abstract class containing utility methods for Map operations.
 *
 * @format
 */

export abstract class MapUtils {
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
