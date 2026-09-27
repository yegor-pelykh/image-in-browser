/** @format */

/**
 * A block-to-group assignment and what it is estimated to cost.
 */
export class VP8LClustering {
  /**
   * Meta Huffman group index for each block, in raster order.
   */
  public readonly assignment: Int32Array;
  public readonly numGroups: number;

  /**
   * Estimated bits to code the image this way, entropy image included.
   */
  public readonly cost: number;

  constructor(assignment: Int32Array, numGroups: number, cost: number) {
    this.assignment = assignment;
    this.numGroups = numGroups;
    this.cost = cost;
  }
}
