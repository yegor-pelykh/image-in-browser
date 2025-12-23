/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { HuffmanCode } from './webp-huffman-code.js';

/**
 * Represents a list of Huffman codes with offset support for efficient access and manipulation.
 */
export class HuffmanCodeList {
  /** Internal array of Huffman codes */
  private _htree: HuffmanCode[];
  /** Offset for logical start of the list */
  private _offset: number;

  /** Returns the number of codes in the list, considering the offset */
  get length(): number {
    return this._htree.length - this._offset;
  }

  /**
   * Creates a new HuffmanCodeList.
   * @param htree Array of Huffman codes
   * @param offset Logical offset in the array
   */
  constructor(htree: HuffmanCode[], offset: number = 0) {
    this._htree = htree;
    this._offset = offset;
  }

  /**
   * Creates a HuffmanCodeList of a given size, filled with new HuffmanCode instances.
   * @param size Number of codes to generate
   */
  public static sized(size: number): HuffmanCodeList {
    return new HuffmanCodeList(
      ArrayUtils.generate(size, () => new HuffmanCode()),
      0
    );
  }

  /**
   * Creates a new HuffmanCodeList from another list, applying an additional offset.
   * @param other Source HuffmanCodeList
   * @param offset Additional offset to apply
   */
  public static from(other: HuffmanCodeList, offset: number): HuffmanCodeList {
    return new HuffmanCodeList(other._htree, other._offset + offset);
  }

  /**
   * Gets the HuffmanCode at the specified index, considering the offset.
   * @param index Index relative to the logical start
   */
  public get(index: number): HuffmanCode {
    return this._htree[this._offset + index];
  }

  /**
   * Sets the HuffmanCode at the specified index, copying bits and value.
   * @param index Index relative to the logical start
   * @param code HuffmanCode to copy from
   */
  public set(index: number, code: HuffmanCode): void {
    const target = this._htree[this._offset + index];
    target.bits = code.bits;
    target.value = code.value;
  }
}
