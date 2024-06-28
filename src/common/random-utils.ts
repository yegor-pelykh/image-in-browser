/** @format */

/**
 * Abstract class providing various random utility methods.
 */
export abstract class RandomUtils {
  /**
   * Returns a random number between [-1, 1].
   * @returns {number} A random number between -1 and 1.
   */
  public static crand(): number {
    return 1 - 2 * Math.random();
  }

  /**
   * Returns a random number following a Gaussian distribution with a standard deviation of 1.
   * @returns {number} A random number following a Gaussian distribution.
   */
  public static grand(): number {
    let x1 = 0;
    let w = 0;
    do {
      const x2 = 2 * Math.random() - 1;
      x1 = 2 * Math.random() - 1;
      w = x1 * x1 + x2 * x2;
    } while (w <= 0 || w >= 1);

    return x1 * Math.sqrt((-2 * Math.log(w)) / w);
  }

  /**
   * Returns a random variable following a Poisson distribution with the given parameter.
   * @param {number} z - The parameter of the Poisson distribution.
   * @returns {number} A random variable following a Poisson distribution.
   */
  public static prand(z: number): number {
    if (z <= 1e-10) {
      return 0;
    }
    if (z > 100) {
      return Math.trunc(Math.sqrt(z) * RandomUtils.grand() + z);
    }
    let k = 0;
    const y = Math.exp(-z);
    for (let s = 1.0; s >= y; ++k) {
      s *= Math.random();
    }
    return k - 1;
  }

  /**
   * Generates a non-negative random integer in the range from 0, inclusive, to the specified max, exclusive.
   * @param {number} max - The upper bound (exclusive) for the random integer.
   * @returns {number} A non-negative random integer less than max.
   */
  public static intrand(max: number): number {
    return Math.floor(Math.random() * max);
  }
}
