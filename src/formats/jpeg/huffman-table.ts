/** @format */

/**
 * A computed JPEG Huffman table: {@link code} holds the code for each value and
 * {@link length} the number of bits.
 */
export class HuffmanTable {
  /** The Huffman codes. */
  public readonly code = new Int32Array(256);
  /** The code lengths. */
  public readonly length = new Uint8Array(256);
}
