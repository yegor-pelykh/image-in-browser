/** @format */

import { HuffmanNode } from './huffman-node.js';

/**
 * Represents a parent node in a Huffman tree.
 */
export class HuffmanParent extends HuffmanNode {
  /**
   * The children nodes of this parent node.
   */
  private readonly _children: Array<HuffmanNode | undefined>;

  /**
   * Gets the children nodes of this parent node.
   * @returns {Array<HuffmanNode | undefined>} The children nodes.
   */
  public get children(): Array<HuffmanNode | undefined> {
    return this._children;
  }

  /**
   * Creates an instance of HuffmanParent.
   * @param {Array<HuffmanNode | undefined>} children - The children nodes of this parent node.
   */
  constructor(children: Array<HuffmanNode | undefined>) {
    super();
    this._children = children;
  }
}
