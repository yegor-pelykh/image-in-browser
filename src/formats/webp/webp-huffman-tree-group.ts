/** @format */

import { ArrayUtils } from '../../common/array-utils';
import { VP8L } from './vp8l';
import { HuffmanTree } from './webp-huffman-tree';

/**
 * A group of huffman trees
 */
export class HuffmanTreeGroup {
  private readonly _htrees: HuffmanTree[];
  public get htrees(): HuffmanTree[] {
    return this._htrees;
  }

  constructor() {
    this._htrees = ArrayUtils.generate<HuffmanTree>(
      VP8L.huffmanCodesPerMetaCode,
      () => new HuffmanTree()
    );
  }

  public getAt(index: number): HuffmanTree {
    return this._htrees[index];
  }
}
