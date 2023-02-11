/** @format */

export abstract class MathUtils {
  public static fract(x: number): number {
    return x - Math.floor(x);
  }

  public static smoothStep(edge0: number, edge1: number, x: number): number {
    const t0 = (x - edge0) / (edge1 - edge0);
    const t = MathUtils.clamp(t0, 0, 1);
    return t * t * (3 - 2 * t);
  }

  public static mix(x: number, y: number, a: number): number {
    return x * (1 - a) + y * a;
  }

  public static sign(x: number): number {
    return x < 0 ? -1 : x > 0 ? 1 : 0;
  }

  public static step(edge: number, x: number): number {
    return x < edge ? 0 : 1;
  }

  public static length3(x: number, y: number, z: number): number {
    return Math.sqrt(x * x + y * y + z * z);
  }

  /**
   * Returns the greatest common divisor of **x** and **y**.
   */
  public static gcd(x: number, y: number) {
    let _x = Math.abs(x);
    let _y = Math.abs(y);
    while (_y) {
      const t = _y;
      _y = _x % _y;
      _x = t;
    }
    return _x;
  }

  /**
   * Clamp **num** to [**low**, **high**]
   */
  public static clamp(num: number, low: number, high: number) {
    return Math.max(low, Math.min(num, high));
  }

  /**
   * Clamp **num** to [**low**, **high**] and truncate
   */
  public static clampInt(num: number, low: number, high: number): number {
    return Math.trunc(MathUtils.clamp(num, low, high));
  }

  /**
   * Clamp **num** to [0, 255] and truncate
   */
  public static clampInt255(num: number): number {
    return Math.trunc(MathUtils.clamp(num, 0, 255));
  }
}
