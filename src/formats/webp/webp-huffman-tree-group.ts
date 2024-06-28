/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { VP8L } from './vp8l.js';
import { HuffmanTree } from './webp-huffman-tree.js';

/**
 * A group of Huffman trees.
 */
export class HuffmanTreeGroup {
  /**
   * Array of HuffmanTree instances.
   */
  private readonly _htrees: HuffmanTree[];

  /**
   * Gets the array of HuffmanTree instances.
   * @returns {HuffmanTree[]} The array of HuffmanTree instances.
   */
  public get htrees(): HuffmanTree[] {
    return this._htrees;
  }

  /**
   * Constructs a new HuffmanTreeGroup.
   */
  constructor() {
    this._htrees = ArrayUtils.generate<HuffmanTree>(
      VP8L.huffmanCodesPerMetaCode,
      () => new HuffmanTree()
    );
  }

  /**
   * Gets the HuffmanTree at the specified index.
   * @param {number} index - The index of the HuffmanTree to retrieve.
   * @returns {HuffmanTree} The HuffmanTree at the specified index.
   */
  public getAt(index: number): HuffmanTree {
    return this._htrees[index];
  }
}
