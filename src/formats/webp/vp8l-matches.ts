/** @format */

/**
 * Longest match the tokenizer will emit.
 */
export const maxMatchLen = 4096;

/**
 * The longest match reachable from each position, as parallel arrays.
 *
 * A parse that considers every way of covering the image needs the answer at
 * every pixel, so the whole table is built up front.
 */
export class VP8LMatches {
  /**
   * Match length at each pixel position, 0 where nothing matches.
   */
  public readonly length: Int32Array;

  /**
   * Match distance at each pixel position, meaningless where length is 0.
   */
  public readonly distance: Int32Array;

  /**
   * How far each of {@link cheapDistances} repeats from every position.
   *
   * These are the offsets that land on the near-neighbour plane codes, which
   * are the cheapest distances the format has. They are worth keeping even
   * when the chain finds something longer, since a shorter match at a
   * near-neighbour distance can still cost less. The chain on its own would
   * have to walk back a whole row of candidates to reach the one directly
   * above, which is past the search limit.
   * Lengths never exceed {@link maxMatchLen}, so sixteen bits are enough, and
   * there is one of these per offset per pixel.
   */
  public readonly cheapLength: Uint16Array[];

  /**
   * The distance each entry of {@link cheapLength} corresponds to.
   */
  public readonly cheapDistances: number[];

  constructor(
    length: Int32Array,
    distance: Int32Array,
    cheapLength: Uint16Array[],
    cheapDistances: number[]
  ) {
    this.length = length;
    this.distance = distance;
    this.cheapLength = cheapLength;
    this.cheapDistances = cheapDistances;
  }
}
