/** @format */

import { InputBuffer } from './input-buffer.js';
import { ArrayUtils } from './array-utils.js';

/**
 * Interface for initializing OutputBuffer options.
 */
export interface OutputBufferInitOptions {
  /**
   * Indicates if the buffer should use big-endian byte order.
   */
  bigEndian?: boolean;
  /**
   * Initial size of the buffer.
   */
  size?: number;
}

/**
 * Class representing a buffer for output operations.
 */
export class OutputBuffer {
  /**
   * Default block size for the buffer.
   */
  private static readonly _blockSize = 0x2000;

  /**
   * Internal buffer storage.
   */
  private _buffer: Uint8Array;

  /**
   * Gets the internal buffer.
   */
  public get buffer(): Uint8Array {
    return this._buffer;
  }

  /**
   * Indicates if the buffer uses big-endian byte order.
   */
  private _bigEndian: boolean;

  /**
   * Gets the big-endian flag.
   */
  public get bigEndian(): boolean {
    return this._bigEndian;
  }

  /**
   * Sets the big-endian flag.
   */
  public set bigEndian(v: boolean) {
    this._bigEndian = v;
  }

  /**
   * Current length of the buffer.
   */
  private _length: number;

  /**
   * Gets the current length of the buffer.
   */
  public get length(): number {
    return this._length;
  }

  /**
   * Sets the current length of the buffer.
   */
  public set length(v: number) {
    this._length = v;
  }

  /**
   * Constructs an OutputBuffer instance.
   *
   * @param {OutputBufferInitOptions} [opt] - Optional initialization options.
   * @param {boolean} [opt.bigEndian=false] - Indicates if the buffer should use big-endian byte order.
   * @param {number} [opt.size=OutputBuffer._blockSize] - The initial size of the buffer.
   */
  constructor(opt?: OutputBufferInitOptions) {
    this._bigEndian = opt?.bigEndian ?? false;
    this._buffer = new Uint8Array(opt?.size ?? OutputBuffer._blockSize);
    this._length = 0;
  }

  /**
   * Grow the buffer to accommodate additional data.
   * @param {number} required - The required additional size.
   */
  private expandBuffer(required?: number): void {
    let blockSize: number = OutputBuffer._blockSize;
    if (required !== undefined) {
      blockSize = required;
    } else if (this._buffer.length > 0) {
      blockSize = this._buffer.length * 2;
    }
    const newBuffer = new Uint8Array(this._buffer.length + blockSize);
    ArrayUtils.copyRange(this._buffer, 0, newBuffer, 0, this._buffer.length);
    this._buffer = newBuffer;
  }

  /**
   * Rewind the buffer to the beginning.
   */
  public rewind(): void {
    this._length = 0;
  }

  /**
   * Clear the buffer.
   */
  public clear(): void {
    this._buffer = new Uint8Array(OutputBuffer._blockSize);
    this._length = 0;
  }

  /**
   * Get the resulting bytes from the buffer.
   * @returns {Uint8Array} A Uint8Array containing the bytes in the buffer.
   */
  public getBytes(): Uint8Array {
    return new Uint8Array(this._buffer.buffer, 0, this._length);
  }

  /**
   * Write a byte to the end of the buffer.
   * @param {number} value - The byte value to write.
   */
  public writeByte(value: number): void {
    if (this._length === this._buffer.length) {
      this.expandBuffer();
    }
    this._buffer[this._length++] = value & 0xff;
  }

  /**
   * Write a set of bytes to the end of the buffer.
   * @param {Uint8Array} bytes - The bytes to write.
   * @param {number} [length] - The number of bytes to write.
   */
  public writeBytes(bytes: Uint8Array, length?: number): void {
    const bytesLength = length ?? bytes.length;
    while (this._length + bytesLength > this._buffer.length) {
      this.expandBuffer(this._length + bytesLength - this._buffer.length);
    }
    ArrayUtils.copyRange(bytes, 0, this._buffer, this._length, bytesLength);
    this._length += bytesLength;
  }

  /**
   * Write the contents of another buffer to the end of this buffer.
   * @param {InputBuffer<Uint8Array>} bytes - The InputBuffer to write from.
   */
  public writeBuffer(bytes: InputBuffer<Uint8Array>): void {
    const bytesLength = bytes.length;
    const requiredLength = this._length + bytesLength;
    while (requiredLength > this._buffer.length) {
      this.expandBuffer(requiredLength - this._buffer.length);
    }
    ArrayUtils.copyRange(
      bytes.buffer,
      bytes.offset,
      this._buffer,
      this._length,
      bytesLength
    );
    this._length += bytesLength;
  }

  /**
   * Write a 16-bit word to the end of the buffer.
   * @param {number} value - The 16-bit word to write.
   */
  public writeUint16(value: number): void {
    if (this._bigEndian) {
      this.writeByte((value >>> 8) & 0xff);
      this.writeByte(value & 0xff);
      return;
    }
    this.writeByte(value & 0xff);
    this.writeByte((value >>> 8) & 0xff);
  }

  /**
   * Write a 32-bit word to the end of the buffer.
   * @param {number} value - The 32-bit word to write.
   */
  public writeUint32(value: number): void {
    if (this._bigEndian) {
      this.writeByte((value >>> 24) & 0xff);
      this.writeByte((value >>> 16) & 0xff);
      this.writeByte((value >>> 8) & 0xff);
      this.writeByte(value & 0xff);
      return;
    }
    this.writeByte(value & 0xff);
    this.writeByte((value >>> 8) & 0xff);
    this.writeByte((value >>> 16) & 0xff);
    this.writeByte((value >>> 24) & 0xff);
  }

  /**
   * Write a 32-bit float value to the end of the buffer.
   * @param {number} value - The 32-bit float value to write.
   */
  public writeFloat32(value: number): void {
    const fb = new Float32Array(1);
    fb[0] = value;
    const b = new Uint8Array(fb.buffer);
    if (this._bigEndian) {
      this.writeByte(b[3]);
      this.writeByte(b[2]);
      this.writeByte(b[1]);
      this.writeByte(b[0]);
      return;
    }
    this.writeByte(b[0]);
    this.writeByte(b[1]);
    this.writeByte(b[2]);
    this.writeByte(b[3]);
  }

  /**
   * Write a 64-bit float value to the end of the buffer.
   * @param {number} value - The 64-bit float value to write.
   */
  public writeFloat64(value: number): void {
    const fb = new Float64Array(1);
    fb[0] = value;
    const b = new Uint8Array(fb.buffer);
    if (this._bigEndian) {
      this.writeByte(b[7]);
      this.writeByte(b[6]);
      this.writeByte(b[5]);
      this.writeByte(b[4]);
      this.writeByte(b[3]);
      this.writeByte(b[2]);
      this.writeByte(b[1]);
      this.writeByte(b[0]);
      return;
    }
    this.writeByte(b[0]);
    this.writeByte(b[1]);
    this.writeByte(b[2]);
    this.writeByte(b[3]);
    this.writeByte(b[4]);
    this.writeByte(b[5]);
    this.writeByte(b[6]);
    this.writeByte(b[7]);
  }

  /**
   * Return the subarray of the buffer in the range [**start**,**end**].
   * If **start** or **end** are < 0 then it is relative to the end of the buffer.
   * If **end** is not specified (or undefined), then it is the end of the buffer.
   * This is equivalent to the python list range operator.
   * @param {number} start - The start index of the subarray.
   * @param {number} [end] - The end index of the subarray.
   * @returns {Uint8Array} A Uint8Array representing the subarray.
   */
  public subarray(start: number, end?: number): Uint8Array {
    const correctedStart: number = start >= 0 ? start : this._length + start;
    let correctedEnd: number = end ?? this._length;
    if (correctedEnd < 0) {
      correctedEnd = this._length + correctedEnd;
    }
    return new Uint8Array(
      this._buffer.buffer,
      correctedStart,
      correctedEnd - correctedStart
    );
  }
}
