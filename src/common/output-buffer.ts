/** @format */

import { InputBuffer } from './input-buffer';
import { ListUtils } from './list-utils';

export interface OutputBufferInitOptions {
  bigEndian?: boolean;
  size?: number;
}

export class OutputBuffer {
  // 8k block-size
  private static readonly BLOCK_SIZE = 0x2000;

  private _buffer: Uint8Array;
  public get buffer(): Uint8Array {
    return this._buffer;
  }

  private readonly _bigEndian: boolean;
  public get bigEndian(): boolean {
    return this._bigEndian;
  }

  private _length: number;
  public set length(v: number) {
    this._length = v;
  }
  public get length(): number {
    return this._length;
  }

  /**
   * Create a byte buffer for writing.
   */
  constructor(options?: OutputBufferInitOptions) {
    this._bigEndian = options?.bigEndian ?? false;
    this._buffer = new Uint8Array(options?.size ?? OutputBuffer.BLOCK_SIZE);
    this._length = 0;
  }

  /**
   * Grow the buffer to accommodate additional data.
   */
  private expandBuffer(required?: number): void {
    let blockSize: number = OutputBuffer.BLOCK_SIZE;
    if (required !== undefined) {
      blockSize = required;
    } else if (this._buffer.length > 0) {
      blockSize = this._buffer.length * 2;
    }
    const newBuffer = new Uint8Array(this._buffer.length + blockSize);
    ListUtils.setRange(newBuffer, 0, this._buffer.length, this._buffer);
    this._buffer = newBuffer;
  }

  public rewind(): void {
    this._length = 0;
  }

  /**
   * Clear the buffer.
   */
  public clear(): void {
    this._buffer = new Uint8Array(OutputBuffer.BLOCK_SIZE);
    this._length = 0;
  }

  /**
   * Get the resulting bytes from the buffer.
   */
  public getBytes(): Uint8Array {
    return new Uint8Array(this._buffer.buffer, 0, this._length);
  }

  /**
   * Write a byte to the end of the buffer.
   */
  public writeByte(value: number): void {
    if (this._length === this._buffer.length) {
      this.expandBuffer();
    }
    this._buffer[this._length++] = value & 0xff;
  }

  /**
   * Write a set of bytes to the end of the buffer.
   */
  public writeBytes(bytes: Uint8Array, length?: number): void {
    const correctedLength = length ?? bytes.length;
    while (this._length + correctedLength > this._buffer.length) {
      this.expandBuffer(this._length + correctedLength - this._buffer.length);
    }
    ListUtils.setRange(
      this._buffer,
      this._length,
      this._length + correctedLength,
      bytes
    );
    this._length += correctedLength;
  }

  public writeBuffer(bytes: InputBuffer): void {
    while (length + bytes.length > this._buffer.length) {
      this.expandBuffer(length + bytes.length - this._buffer.length);
    }
    ListUtils.setRange(
      this._buffer,
      length,
      length + bytes.length,
      bytes.buffer,
      bytes.offset
    );
    this._length += bytes.length;
  }

  /**
   * Write a 16-bit word to the end of the buffer.
   */
  public writeUint16(value: number): void {
    if (this._bigEndian) {
      this.writeByte((value >> 8) & 0xff);
      this.writeByte(value & 0xff);
      return;
    }
    this.writeByte(value & 0xff);
    this.writeByte((value >> 8) & 0xff);
  }

  /**
   * Write a 32-bit word to the end of the buffer.
   */
  public writeUint32(value: number): void {
    if (this._bigEndian) {
      this.writeByte((value >> 24) & 0xff);
      this.writeByte((value >> 16) & 0xff);
      this.writeByte((value >> 8) & 0xff);
      this.writeByte(value & 0xff);
      return;
    }
    this.writeByte(value & 0xff);
    this.writeByte((value >> 8) & 0xff);
    this.writeByte((value >> 16) & 0xff);
    this.writeByte((value >> 24) & 0xff);
  }

  /**
   * Return the subarray of the buffer in the range **start**:**end**.
   * If **start** or **end** are < 0 then it is relative to the end of the buffer.
   * If **end** is not specified (or undefined), then it is the end of the buffer.
   * This is equivalent to the python list range operator.
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
