/** @format */

import { HuffmanNode } from './huffman-node.js';

/**
 * Represents a Huffman value node which extends HuffmanNode.
 */
export class HuffmanValue extends HuffmanNode {
  /**
   * The value stored in the Huffman node.
   */
  private readonly _value: number;

  /**
   * Gets the value stored in the Huffman node.
   * @returns {number} The value of the node.
   */
  public get value(): number {
    return this._value;
  }

  /**
   * Initializes a new instance of the HuffmanValue class.
   * @param {number} value - The value to be stored in the Huffman node.
   */
  constructor(value: number) {
    super();
    this._value = value;
  }
}
