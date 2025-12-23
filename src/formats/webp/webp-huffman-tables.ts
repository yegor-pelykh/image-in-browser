/** @format */

import { HuffmanTablesSegment } from './webp-huffman-table-segment.js';
import { HuffmanCodeList } from './webp-huffman-code-list.js';

/**
 * Represents a collection of Huffman table segments for WebP decoding.
 * Manages the root segment and the current working segment.
 */
export class HuffmanTables {
  /** Root segment of the Huffman tables chain */
  root: HuffmanTablesSegment;
  /** Currently active segment in the chain */
  currentSegment?: HuffmanTablesSegment;

  /**
   * Initializes Huffman tables with a given size.
   * @param size Number of codes in the table
   */
  constructor(size: number) {
    this.root = new HuffmanTablesSegment();
    this.currentSegment = this.root;
    const start = HuffmanCodeList.sized(size);
    this.root.size = size;
    this.root.start = start;
    this.root.currentTable = start;
    this.root.next = undefined;
  }
}
