/** @format */

/**
 * Bit writer that packs bits LSB-first into bytes.
 *
 * This class allows writing individual bits or groups of bits into a byte array,
 * packing them in a least-significant-bit-first order. Useful for encoding
 * bitstreams in formats such as WebP.
 */
export class WebPBitWriter {
  private readonly _bytes: number[] = [];
  private _currentByte: number = 0;
  private _usedBits: number = 0;

  /**
   * Writes a value as a sequence of bits to the bitstream.
   * Bits are written LSB-first.
   * @param {number} value - The value to write.
   * @param {number} numBits - The number of bits to write from the value.
   */
  public writeBits(value: number, numBits: number): void {
    let _value = value;
    let _numBits = numBits;
    while (_numBits > 0) {
      const available = 8 - this._usedBits;
      const bitsToWrite = _numBits < available ? _numBits : available;
      const mask = (1 << bitsToWrite) - 1;
      this._currentByte |= (_value & mask) << this._usedBits;
      _value >>= bitsToWrite;
      _numBits -= bitsToWrite;
      this._usedBits += bitsToWrite;
      if (this._usedBits === 8) {
        this._bytes.push(this._currentByte);
        this._currentByte = 0;
        this._usedBits = 0;
      }
    }
  }

  /**
   * Flushes any remaining bits in the current byte to the byte array.
   * If the current byte is partially filled, it is padded with zeros.
   */
  public flush(): void {
    if (this._usedBits > 0) {
      this._bytes.push(this._currentByte);
      this._currentByte = 0;
      this._usedBits = 0;
    }
  }

  /**
   * Returns the written bytes as a Uint8Array.
   * @returns {Uint8Array} The byte array containing the written bits.
   */
  public getBytes(): Uint8Array {
    return Uint8Array.from(this._bytes);
  }
}
