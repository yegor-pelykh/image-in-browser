/** @format */

import { HuffmanNode } from './huffman-node.js';

/**
 * Represents a JPEG Huffman tree.
 */
export class JpegHuffman {
  /**
   * The children nodes of the Huffman tree.
   */
  private readonly _children: Array<HuffmanNode | undefined> = [];

  /**
   * Gets the children nodes of the Huffman tree.
   * @returns {Array<HuffmanNode | undefined>} The children nodes.
   */
  public get children(): Array<HuffmanNode | undefined> {
    return this._children;
  }

  /**
   * The current index in the Huffman tree.
   */
  private _index = 0;

  /**
   * Gets the current index in the Huffman tree.
   * @returns {number} The current index.
   */
  public get index(): number {
    return this._index;
  }

  /**
   * Increments the current index by one.
   */
  public incrementIndex(): void {
    this._index++;
  }
}
