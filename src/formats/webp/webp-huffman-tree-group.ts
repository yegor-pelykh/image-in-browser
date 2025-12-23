/** @format */

import { HuffmanCodeList } from './webp-huffman-code-list.js';
import { HuffmanCode32 } from './webp-huffman-code-32.js';
import { VP8LBitReader } from './vp8l-bit-reader.js';
import { VP8L } from './vp8l.js';
import { ArrayUtils } from '../../common/array-utils.js';

/**
 * Represents a group of Huffman trees used for decoding WebP lossless images.
 * Manages Huffman tables and provides symbol reading functionality.
 */
export class HuffmanTreeGroup {
  /** Huffman trees for each meta code. */
  readonly htrees: HuffmanCodeList[];
  /** Packed Huffman tables for fast decoding. */
  readonly packedTable: HuffmanCode32[];
  /** Indicates if the literal code is trivial (single symbol). */
  isTrivialLiteral: boolean = false;
  /** Stores the value of the trivial literal if present. */
  literalArb: number = 0;
  /** Indicates if the code is trivial (single symbol). */
  isTrivialCode: boolean = false;
  /** Enables use of packed tables for decoding. */
  usePackedTable: boolean = false;

  private static readonly _huffmanTableBits = 8;
  private static readonly _huffmanTableMask =
    (1 << HuffmanTreeGroup._huffmanTableBits) - 1;

  /**
   * Initializes Huffman trees and packed tables.
   */
  constructor() {
    this.htrees = ArrayUtils.generate(VP8L.huffmanCodesPerMetaCode, () =>
      HuffmanCodeList.sized(0)
    );
    this.packedTable = ArrayUtils.generate(
      VP8L.huffmanPackedTableSize,
      () => new HuffmanCode32()
    );
  }

  /**
   * Returns the HuffmanCodeList at the specified index.
   * @param index Index of the Huffman tree.
   */
  public get(index: number): HuffmanCodeList {
    return this.htrees[index];
  }

  /**
   * Reads a symbol from the specified Huffman table using the bit reader.
   * @param table Index of the Huffman table.
   * @param br Bit reader for input data.
   */
  public readSymbol(table: number, br: VP8LBitReader): number {
    let val = br.prefetchBits();
    let tableIndex = val & HuffmanTreeGroup._huffmanTableMask;
    const nbits =
      this.htrees[table].get(tableIndex).bits -
      HuffmanTreeGroup._huffmanTableBits;
    if (nbits > 0) {
      br.bitPos += HuffmanTreeGroup._huffmanTableBits;
      val = br.prefetchBits();
      tableIndex += this.htrees[table].get(tableIndex).value;
      tableIndex += val & ((1 << nbits) - 1);
    }
    br.bitPos += this.htrees[table].get(tableIndex).bits;
    return this.htrees[table].get(tableIndex).value;
  }
}
