/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { LibError } from '../../error/lib-error.js';

export class LzwDecoder {
  private static readonly _lzMaxCode = 4095;
  private static readonly _noSuchCode = 4098;
  private static readonly _andTable: number[] = [511, 1023, 2047, 4095];

  private readonly _buffer = new Uint8Array(4096);

  private _bitsToGet = 9;
  private _bytePointer = 0;
  private _nextData = 0;
  private _nextBits = 0;
  private _data!: Uint8Array;
  private _dataLength!: number;
  private _out!: Uint8Array;
  private _outPointer!: number;
  private _table!: Uint8Array;
  private _prefix!: Uint32Array;
  private _tableIndex?: number;
  private _bufferLength!: number;

  private addString(string: number, newString: number): void {
    this._table[this._tableIndex!] = newString;
    this._prefix[this._tableIndex!] = string;
    this._tableIndex = this._tableIndex! + 1;

    if (this._tableIndex === 511) {
      this._bitsToGet = 10;
    } else if (this._tableIndex === 1023) {
      this._bitsToGet = 11;
    } else if (this._tableIndex === 2047) {
      this._bitsToGet = 12;
    }
  }

  private getString(code: number): void {
    this._bufferLength = 0;
    let c = code;
    this._buffer[this._bufferLength++] = this._table[c];
    c = this._prefix[c];
    while (c !== LzwDecoder._noSuchCode) {
      this._buffer[this._bufferLength++] = this._table[c];
      c = this._prefix[c];
    }
  }

  /**
   * Returns the next 9, 10, 11 or 12 bits
   */
  private getNextCode(): number {
    if (this._bytePointer >= this._dataLength) {
      return 257;
    }

    while (this._nextBits < this._bitsToGet) {
      if (this._bytePointer >= this._dataLength) {
        return 257;
      }
      this._nextData =
        ((this._nextData << 8) + this._data[this._bytePointer++]) & 0xffffffff;
      this._nextBits += 8;
    }

    this._nextBits -= this._bitsToGet;
    const code =
      (this._nextData >>> this._nextBits) &
      LzwDecoder._andTable[this._bitsToGet - 9];

    return code;
  }

  /**
   * Initialize the string table.
   */
  private initializeStringTable(): void {
    this._table = new Uint8Array(LzwDecoder._lzMaxCode + 1);
    this._prefix = new Uint32Array(LzwDecoder._lzMaxCode + 1);
    this._prefix.fill(LzwDecoder._noSuchCode, 0, this._prefix.length);

    for (let i = 0; i < 256; i++) {
      this._table[i] = i;
    }

    this._bitsToGet = 9;

    this._tableIndex = 258;
  }

  public decode(p: InputBuffer<Uint8Array>, out: Uint8Array): void {
    this._out = out;
    const outLen = out.length;
    this._outPointer = 0;
    this._data = p.buffer;
    this._dataLength = this._data.length;
    this._bytePointer = p.offset;

    if (this._data[0] === 0x00 && this._data[1] === 0x01) {
      throw new LibError('Invalid LZW Data');
    }

    this.initializeStringTable();

    this._nextData = 0;
    this._nextBits = 0;

    let oldCode = 0;

    let code = this.getNextCode();
    while (code !== 257 && this._outPointer < outLen) {
      if (code === 256) {
        this.initializeStringTable();
        code = this.getNextCode();
        this._bufferLength = 0;
        if (code === 257) {
          break;
        }

        this._out[this._outPointer++] = code;
        oldCode = code;
      } else {
        if (code < this._tableIndex!) {
          this.getString(code);
          for (let i = this._bufferLength - 1; i >= 0; --i) {
            this._out[this._outPointer++] = this._buffer[i];
          }
          this.addString(oldCode, this._buffer[this._bufferLength - 1]);
          oldCode = code;
        } else {
          this.getString(oldCode);
          for (let i = this._bufferLength - 1; i >= 0; --i) {
            this._out[this._outPointer++] = this._buffer[i];
          }
          this._out[this._outPointer++] = this._buffer[this._bufferLength - 1];
          this.addString(oldCode, this._buffer[this._bufferLength - 1]);

          oldCode = code;
        }
      }

      code = this.getNextCode();
    }
  }
}
