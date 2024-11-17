/** @format */

import { LibError } from '../error/lib-error.js';
import { ArrayUtils } from './array-utils.js';
import { BitUtils } from './bit-utils.js';
import { StringUtils } from './string-utils.js';
import { TypedArray } from './typings.js';

/**
 * Interface for initializing InputBuffer with options.
 */
export interface InputBufferInitOptions<T extends TypedArray> {
  /** The buffer to read from. */
  buffer: T;
  /** Optional offset to start reading from. */
  offset?: number;
  /** Optional length of the buffer to read. */
  length?: number;
  /** Optional flag to indicate big-endian byte order. */
  bigEndian?: boolean;
}

/**
 * A buffer that can be read as a stream of bytes.
 */
export class InputBuffer<T extends TypedArray> {
  /** The underlying buffer. */
  private _buffer: T;

  /** Sets the buffer. */
  public set buffer(v: T) {
    this._buffer = v;
  }

  /** Gets the buffer. */
  public get buffer(): T {
    return this._buffer;
  }

  /** Flag indicating if the buffer is in big-endian byte order. */
  private _bigEndian: boolean;

  /** Sets the big-endian flag. */
  public set bigEndian(v: boolean) {
    this._bigEndian = v;
  }

  /** Gets the big-endian flag. */
  public get bigEndian(): boolean {
    return this._bigEndian;
  }

  /** The current offset in the buffer. */
  private _offset: number;

  /** Sets the offset. */
  public set offset(v: number) {
    this._offset = v;
  }

  /** Gets the offset. */
  public get offset(): number {
    return this._offset;
  }

  /** The start position of the buffer. */
  private _start: number;

  /** Gets the start position. */
  public get start(): number {
    return this._start;
  }

  /** The end position of the buffer. */
  private _end: number;

  /** Gets the end position. */
  public get end(): number {
    return this._end;
  }

  /**
   * The current read position relative to the start of the buffer.
   */
  public get position(): number {
    return this._offset - this._start;
  }

  /**
   * How many bytes are left in the stream.
   */
  public get length(): number {
    return this._end - this._offset;
  }

  /**
   * Is the current position at the end of the stream?
   */
  public get isEOS(): boolean {
    return this._offset >= this._end;
  }

  /**
   * Create an InputStream for reading from an Array<int>.
   * @param {InputBufferInitOptions<T>} opt Initialization options.
   */
  constructor(opt: InputBufferInitOptions<T>) {
    this._buffer = opt.buffer;
    this._bigEndian = opt.bigEndian ?? false;
    this._offset = opt.offset ?? 0;
    this._start = this._offset;
    this._end = Math.min(
      this._buffer.length,
      opt.length === undefined ? this._buffer.length : this._offset + opt.length
    );
  }

  /**
   * Create a copy of another InputBuffer.
   * @param {InputBuffer<T>} other - The InputBuffer to copy.
   * @param {number} [offset] - Optional offset to start copying from.
   * @param {number} [length] - Optional length of the buffer to copy.
   * @returns {InputBuffer<T>} - A new InputBuffer instance copied from the other buffer.
   */
  public static from<T extends TypedArray>(
    other: InputBuffer<T>,
    offset?: number,
    length?: number
  ): InputBuffer<T> {
    const offsetFromOther = offset ?? 0;
    const result = new InputBuffer<T>({
      buffer: other._buffer,
      bigEndian: other._bigEndian,
      offset: other._offset + offsetFromOther,
      length: length,
    });
    result._start = other._start;
    result._end = Math.min(
      other.buffer.length,
      length === undefined
        ? other._end
        : other.offset + offsetFromOther + length
    );
    return result;
  }

  /**
   * Reset to the beginning of the stream.
   */
  public rewind(): void {
    this._offset = this._start;
  }

  /**
   * Access the buffer relative from the current position.
   * @param {number} index The index relative to the current position.
   * @returns {number} The value at the specified index.
   */
  public get(index: number): number {
    return this._buffer[this._offset + index];
  }

  /**
   * Set a buffer element relative to the current position.
   *
   * @param {number} index - The index relative to the current position.
   * @param {number} value - The value to set.
   * @returns {number} - The value that was set.
   */
  public set(index: number, value: number): number {
    return (this._buffer[this._offset + index] = value);
  }

  /**
   * Copy data from another buffer to this buffer.
   * @param {number} start The start position in this buffer.
   * @param {number} length The number of bytes to copy.
   * @param {InputBuffer<T> | T} other The source buffer to copy from.
   * @param {number} [offset] The offset in the source buffer to start copying from.
   */
  public memcpy(
    start: number,
    length: number,
    other: InputBuffer<T> | T,
    offset: number = 0
  ): void {
    if (other instanceof InputBuffer) {
      ArrayUtils.copyRange(
        other.buffer,
        other.offset + offset,
        this._buffer,
        this.offset + start,
        length
      );
    } else {
      ArrayUtils.copyRange(
        other,
        offset,
        this._buffer,
        this.offset + start,
        length
      );
    }
  }

  /**
   * Set a range of bytes in this buffer to a value.
   * @param {number} start The start position in this buffer.
   * @param {number} length The number of bytes to set.
   * @param {number} value The value to set.
   */
  public memset(start: number, length: number, value: number): void {
    this._buffer.fill(
      value,
      this._offset + start,
      this._offset + start + length
    );
  }

  /**
   * Return an InputBuffer to read a subset of this stream.
   * @param {number} count The number of bytes to read.
   * @param {number} [position] The position to start reading from.
   * @param {number} offset The offset to start reading from.
   * @returns {InputBuffer<T>} A new InputBuffer for the subset.
   */
  public subarray(
    count: number,
    position?: number,
    offset = 0
  ): InputBuffer<T> {
    let pos = position !== undefined ? this._start + position : this._offset;
    pos += offset;
    return new InputBuffer<T>({
      buffer: this._buffer,
      bigEndian: this._bigEndian,
      offset: pos,
      length: count,
    });
  }

  /**
   * Returns the position of the given value within the buffer.
   * @param {number} value The value to search for.
   * @param {number} offset The offset to start searching from.
   * @returns {number} The position of the value, or -1 if not found.
   */
  public indexOf(value: number, offset = 0): number {
    const end = this.offset + this.length;
    for (let i = this.offset + offset; i < end; ++i) {
      if (this._buffer[i] === value) {
        return i - this._start;
      }
    }
    return -1;
  }

  /**
   * Read a specified number of bytes from an offset without moving the read position.
   * @param {number} count The number of bytes to read.
   * @param {number} offset The offset to start reading from.
   * @returns {InputBuffer<T>} A new InputBuffer for the read bytes.
   */
  public peek(count: number, offset = 0): InputBuffer<T> {
    return this.subarray(count, undefined, offset);
  }

  /**
   * Move the read position by a specified number of bytes.
   * @param {number} count The number of bytes to skip.
   */
  public skip(count: number): void {
    this._offset += count;
  }

  /**
   * Read a single value from the buffer.
   * @returns {number} The value read.
   */
  public read(): number {
    return this._buffer[this._offset++];
  }

  /**
   * Read a specified number of bytes from the stream.
   * @param {number} count The number of bytes to read.
   * @returns {InputBuffer<T>} A new InputBuffer for the read bytes.
   */
  public readRange(count: number): InputBuffer<T> {
    const bytes = this.subarray(count);
    this._offset += bytes.length;
    return bytes;
  }

  /**
   * Read an 8-bit integer from the stream.
   * @returns {number} The 8-bit integer read.
   */
  public readInt8(): number {
    return BitUtils.uint8ToInt8(this.read());
  }

  /**
   * Read a null-terminated string, or a specified number of bytes as a string.
   * @param {number} [length] The number of bytes to read as a string.
   * @returns {string} The string read.
   * @throws {LibError} If EOF is reached without finding string terminator.
   */
  public readString(length?: number): string {
    if (length === undefined) {
      const codes: number[] = [];
      while (!this.isEOS) {
        const c = this.read();
        if (c === 0) {
          return String.fromCodePoint(...codes);
        }
        codes.push(c);
      }
      throw new LibError('EOF reached without finding string terminator.');
    }

    const s = this.readRange(length);
    const bytes = s.toUint8Array();
    const result = String.fromCodePoint(...bytes);
    return result;
  }

  /**
   * Read one line of a null-terminated string, or a specified number of bytes as a string.
   * @param {number} length - The number of bytes to read as a string.
   * @returns {string} The string read.
   */
  public readStringLine(length: number = 256): string {
    const codes: number[] = [];
    while (!this.isEOS) {
      const c = this.read();
      codes.push(c);
      if (c === 10 || codes.length >= length) {
        return String.fromCodePoint(...codes);
      }
    }
    return String.fromCodePoint(...codes);
  }

  /**
   * Read a null-terminated UTF-8 string.
   * @returns {string} The UTF-8 string read.
   */
  public readStringUtf8(): string {
    const codes: number[] = [];
    while (!this.isEOS) {
      const c = this.read();
      if (c === 0) {
        const array = new Uint8Array(codes);
        return StringUtils.utf8Decoder.decode(array);
      }
      codes.push(c);
    }
    const array = new Uint8Array(codes);
    return StringUtils.utf8Decoder.decode(array);
  }

  /**
   * Read a 16-bit unsigned integer from the stream.
   * @returns {number} The 16-bit unsigned integer read.
   */
  public readUint16(): number {
    const b1 = this._buffer[this._offset++] & 0xff;
    const b2 = this._buffer[this._offset++] & 0xff;
    if (this._bigEndian) {
      return (b1 << 8) | b2;
    }
    return (b2 << 8) | b1;
  }

  /**
   * Read a 16-bit signed integer from the stream.
   * @returns {number} The 16-bit signed integer read.
   */
  public readInt16(): number {
    return BitUtils.uint16ToInt16(this.readUint16());
  }

  /**
   * Read a 24-bit unsigned integer from the stream.
   * @returns {number} The 24-bit unsigned integer read.
   */
  public readUint24(): number {
    const b1 = this._buffer[this._offset++] & 0xff;
    const b2 = this._buffer[this._offset++] & 0xff;
    const b3 = this._buffer[this._offset++] & 0xff;
    if (this._bigEndian) {
      return b3 | (b2 << 8) | (b1 << 16);
    }
    return b1 | (b2 << 8) | (b3 << 16);
  }

  /**
   * Read a 32-bit unsigned integer from the stream.
   * @returns {number} The 32-bit unsigned integer read.
   */
  public readUint32(): number {
    return BitUtils.int32ToUint32(this.readInt32());
  }

  /**
   * Read a 32-bit signed integer from the stream.
   * @returns {number} The 32-bit signed integer read.
   */
  public readInt32(): number {
    const b1 = this._buffer[this._offset++] & 0xff;
    const b2 = this._buffer[this._offset++] & 0xff;
    const b3 = this._buffer[this._offset++] & 0xff;
    const b4 = this._buffer[this._offset++] & 0xff;
    return this._bigEndian
      ? (b1 << 24) | (b2 << 16) | (b3 << 8) | b4
      : (b4 << 24) | (b3 << 16) | (b2 << 8) | b1;
  }

  /**
   * Read a 32-bit float from the stream.
   * @returns {number} The 32-bit float read.
   */
  public readFloat32(): number {
    return BitUtils.uint32ToFloat32(this.readUint32());
  }

  /**
   * Read a 64-bit float from the stream.
   * @returns {number} The 64-bit float read.
   */
  public readFloat64(): number {
    return BitUtils.uint64ToFloat64(this.readUint64());
  }

  /**
   * Read a 64-bit unsigned integer from the stream.
   * @returns {bigint} The 64-bit unsigned integer read.
   */
  public readUint64(): bigint {
    const b1 = this._buffer[this._offset++] & 0xff;
    const b2 = this._buffer[this._offset++] & 0xff;
    const b3 = this._buffer[this._offset++] & 0xff;
    const b4 = this._buffer[this._offset++] & 0xff;
    const b5 = this._buffer[this._offset++] & 0xff;
    const b6 = this._buffer[this._offset++] & 0xff;
    const b7 = this._buffer[this._offset++] & 0xff;
    const b8 = this._buffer[this._offset++] & 0xff;
    if (this._bigEndian) {
      return (
        BigInt(b1 << 56) |
        BigInt(b2 << 48) |
        BigInt(b3 << 40) |
        BigInt(b4 << 32) |
        BigInt(b5 << 24) |
        BigInt(b6 << 16) |
        BigInt(b7 << 8) |
        BigInt(b8)
      );
    }
    return (
      BigInt(b8 << 56) |
      BigInt(b7 << 48) |
      BigInt(b6 << 40) |
      BigInt(b5 << 32) |
      BigInt(b4 << 24) |
      BigInt(b3 << 16) |
      BigInt(b2 << 8) |
      BigInt(b1)
    );
  }

  /**
   * Convert the buffer to a Uint8Array.
   * @param {number} offset - The offset to start from.
   * @param {number} [length] - The length of the array.
   * @returns {Uint8Array} The Uint8Array representation of the buffer.
   */
  public toUint8Array(offset: number = 0, length?: number): Uint8Array {
    const correctedLength = length ?? this.length - offset;
    if (this._buffer instanceof Uint8Array) {
      return new Uint8Array(
        this._buffer.buffer,
        this._buffer.byteOffset + this._offset + offset,
        correctedLength
      );
    }
    return Uint8Array.from(
      this._buffer.subarray(
        this._offset + offset,
        this._offset + offset + correctedLength
      )
    );
  }

  /**
   * Convert the buffer to a Uint32Array.
   * @param {number} offset - The offset to start from.
   * @returns {Uint32Array} The Uint32Array representation of the buffer.
   */
  public toUint32Array(offset: number = 0): Uint32Array {
    if (this._buffer instanceof Uint8Array) {
      return new Uint32Array(
        this._buffer.buffer,
        this._buffer.byteOffset + this._offset + offset
      );
    }
    const uint8array = this.toUint8Array();
    return new Uint32Array(uint8array.buffer);
  }
}
