/** @format */

import { ImageError } from '../../error/image-error';
import { InputBuffer } from '../util/input-buffer';

export class LzwDecoder {
  private static readonly LZ_MAX_CODE = 4095;
  private static readonly NO_SUCH_CODE = 4098;
  private static readonly AND_TABLE: number[] = [511, 1023, 2047, 4095];

  private readonly buffer = new Uint8Array(4096);

  private bitsToGet = 9;
  private bytePointer = 0;
  private nextData = 0;
  private nextBits = 0;
  private data!: Uint8Array;
  private dataLength!: number;
  private out!: Uint8Array;
  private outPointer!: number;
  private table!: Uint8Array;
  private prefix!: Uint32Array;
  private tableIndex?: number;
  private bufferLength!: number;

  private addString(string: number, newString: number): void {
    this.table[this.tableIndex!] = newString;
    this.prefix[this.tableIndex!] = string;
    this.tableIndex = this.tableIndex! + 1;

    if (this.tableIndex === 511) {
      this.bitsToGet = 10;
    } else if (this.tableIndex === 1023) {
      this.bitsToGet = 11;
    } else if (this.tableIndex === 2047) {
      this.bitsToGet = 12;
    }
  }

  private getString(code: number): void {
    this.bufferLength = 0;
    let c = code;
    this.buffer[this.bufferLength++] = this.table[c];
    c = this.prefix[c];
    while (c !== LzwDecoder.NO_SUCH_CODE) {
      this.buffer[this.bufferLength++] = this.table[c];
      c = this.prefix[c];
    }
  }

  /**
   * Returns the next 9, 10, 11 or 12 bits
   */
  private getNextCode(): number {
    if (this.bytePointer >= this.dataLength) {
      return 257;
    }

    while (this.nextBits < this.bitsToGet) {
      if (this.bytePointer >= this.dataLength) {
        return 257;
      }
      this.nextData =
        ((this.nextData << 8) + this.data[this.bytePointer++]) & 0xffffffff;
      this.nextBits += 8;
    }

    this.nextBits -= this.bitsToGet;
    const code =
      (this.nextData >> this.nextBits) &
      LzwDecoder.AND_TABLE[this.bitsToGet - 9];

    return code;
  }

  /**
   * Initialize the string table.
   */
  private initializeStringTable(): void {
    this.table = new Uint8Array(LzwDecoder.LZ_MAX_CODE + 1);
    this.prefix = new Uint32Array(LzwDecoder.LZ_MAX_CODE + 1);
    this.prefix.fill(LzwDecoder.NO_SUCH_CODE, 0, this.prefix.length);

    for (let i = 0; i < 256; i++) {
      this.table[i] = i;
    }

    this.bitsToGet = 9;

    this.tableIndex = 258;
  }

  public decode(p: InputBuffer, out: Uint8Array): void {
    this.out = out;
    const outLen = out.length;
    this.outPointer = 0;
    this.data = p.buffer;
    this.dataLength = this.data.length;
    this.bytePointer = p.offset;

    if (this.data[0] === 0x00 && this.data[1] === 0x01) {
      throw new ImageError('Invalid LZW Data');
    }

    this.initializeStringTable();

    this.nextData = 0;
    this.nextBits = 0;

    let oldCode = 0;

    let code = this.getNextCode();
    while (code !== 257 && this.outPointer < outLen) {
      if (code === 256) {
        this.initializeStringTable();
        code = this.getNextCode();
        this.bufferLength = 0;
        if (code === 257) {
          break;
        }

        this.out[this.outPointer++] = code;
        oldCode = code;
      } else {
        if (code < this.tableIndex!) {
          this.getString(code);
          for (let i = this.bufferLength - 1; i >= 0; --i) {
            this.out[this.outPointer++] = this.buffer[i];
          }
          this.addString(oldCode, this.buffer[this.bufferLength - 1]);
          oldCode = code;
        } else {
          this.getString(oldCode);
          for (let i = this.bufferLength - 1; i >= 0; --i) {
            this.out[this.outPointer++] = this.buffer[i];
          }
          this.out[this.outPointer++] = this.buffer[this.bufferLength - 1];
          this.addString(oldCode, this.buffer[this.bufferLength - 1]);

          oldCode = code;
        }
      }

      code = this.getNextCode();
    }
  }
}
