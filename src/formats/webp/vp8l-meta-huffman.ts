/** @format */

import { VP8LClustering } from './vp8l-clustering.js';

/**
 * A chosen meta Huffman layout: the block size and which group each block
 * belongs to.
 */
export class VP8LMetaHuffman {
  /**
   * Blocks span 2^bits pixels each way.
   */
  public readonly bits: number;
  public readonly xsize: number;
  public readonly ysize: number;
  public readonly clustering: VP8LClustering;

  constructor(
    bits: number,
    xsize: number,
    ysize: number,
    clustering: VP8LClustering
  ) {
    this.bits = bits;
    this.xsize = xsize;
    this.ysize = ysize;
    this.clustering = clustering;
  }
}
