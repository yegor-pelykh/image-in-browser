/** @format */

/**
 * Bits of a packed match holding the length.
 */
export const matchLengthBits = 12;

/**
 * Longest match the tokenizer will emit.
 */
export const maxMatchLength = (1 << matchLengthBits) - 1;

/**
 * Distances stop at 1048576, and the first 120 values are taken by the
 * near-neighbor plane codes, leaving this as the real maximum.
 */
export const maxMatchDistance = 1048456;

/**
 * The longest match reachable from each position.
 *
 * A parse that considers every way of covering the image needs the answer at
 * every pixel, so the whole table is built up front.
 */
export class VP8LMatches {
  /**
   * Distance above {@link matchLengthBits}, length below; length zero means
   * nothing matches and the distance is meaningless.
   */
  public readonly match: Uint32Array;

  /**
   * Offsets landing on the near-neighbor plane codes, the cheapest distances
   * the format has, where a shorter match can beat a longer one from the chain.
   */
  public readonly cheapDistances: Int32Array;

  constructor(match: Uint32Array, cheapDistances: Int32Array) {
    this.match = match;
    this.cheapDistances = cheapDistances;
  }

  public lengthAt(i: number): number {
    return this.match[i] & maxMatchLength;
  }

  public distanceAt(i: number): number {
    return this.match[i] >>> matchLengthBits;
  }
}
