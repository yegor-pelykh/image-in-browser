/** @format */

import { HuffmanCodeList } from './webp-huffman-code-list.js';

/**
 * Represents a segment of Huffman tables used in WebP decoding.
 * Stores references to Huffman code lists and manages segment chaining.
 */
export class HuffmanTablesSegment {
  /** Offset of the current segment in the bitstream */
  currentOffset: number = 0;

  /** Size of the current Huffman tables segment */
  size: number = 0;

  /** Reference to the starting Huffman code list for this segment */
  start?: HuffmanCodeList;

  /** Reference to the currently active Huffman code list */
  currentTable?: HuffmanCodeList;

  /** Reference to the next segment in the chain */
  next?: HuffmanTablesSegment;
}
