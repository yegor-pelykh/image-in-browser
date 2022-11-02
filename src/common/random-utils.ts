/** @format */

export abstract class RandomUtils {
  /**
   * Return a random variable between [-1,1].
   */
  public static crand(): number {
    return 1 - 2 * Math.random();
  }

  /**
   * Return a random variable following a gaussian distribution and a standard
   * deviation of 1.
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
   * Return a random variable following a Poisson distribution of parameter [z].
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
}
