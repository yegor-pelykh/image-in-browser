/**
 * Represents a Huffman code with its bit length and value.
 *
 * @format
 */

export class HuffmanCode {
  /** Number of bits in the Huffman code. */
  bits: number;
  /** Value of the Huffman code. */
  value: number;

  /**
   * Creates a new HuffmanCode instance.
   * @param bits Number of bits in the code.
   * @param value Value of the code.
   */
  constructor(bits: number = 0, value: number = 0) {
    this.bits = bits;
    this.value = value;
  }

  /**
   * Creates a copy of the given HuffmanCode instance.
   * @param other HuffmanCode to copy.
   * @returns New HuffmanCode instance with the same bits and value.
   */
  public static from(other: HuffmanCode): HuffmanCode {
    return new HuffmanCode(other.bits, other.value);
  }
}
