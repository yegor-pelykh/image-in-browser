/**
 * Bit writer that packs bits LSB-first into bytes.
 *
 * @format
 */

export class WebPBitWriter {
  private readonly _bytes: number[] = [];
  private _currentByte: number = 0;
  private _usedBits: number = 0;

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

  public flush(): void {
    if (this._usedBits > 0) {
      this._bytes.push(this._currentByte);
      this._currentByte = 0;
      this._usedBits = 0;
    }
  }

  public getBytes(): Uint8Array {
    return Uint8Array.from(this._bytes);
  }
}
