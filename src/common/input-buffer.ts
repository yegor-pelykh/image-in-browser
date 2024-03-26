/** @format */

import { LibError } from '../error/lib-error';
import { ArrayUtils } from './array-utils';
import { BitUtils } from './bit-utils';
import { StringUtils } from './string-utils';
import { TypedArray } from './typings';

export interface InputBufferInitOptions<T extends TypedArray> {
  buffer: T;
  offset?: number;
  length?: number;
  bigEndian?: boolean;
}

/**
 * A buffer that can be read as a stream of bytes.
 */
export class InputBuffer<T extends TypedArray> {
  private _buffer: T;
  public set buffer(v: T) {
    this._buffer = v;
  }
  public get buffer(): T {
    return this._buffer;
  }

  private _bigEndian: boolean;
  public set bigEndian(v: boolean) {
    this._bigEndian = v;
  }
  public get bigEndian(): boolean {
    return this._bigEndian;
  }

  private _offset: number;
  public set offset(v: number) {
    this._offset = v;
  }
  public get offset(): number {
    return this._offset;
  }

  private _start: number;
  public get start(): number {
    return this._start;
  }

  private _end: number;
  public get end(): number {
    return this._end;
  }

  /**
   *  The current read position relative to the start of the buffer.
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
   * Create a InputStream for reading from an Array<int>
   */
  constructor(opt: InputBufferInitOptions<T>) {
    this._buffer = opt.buffer;
    this._bigEndian = opt.bigEndian ?? false;
    this._offset = opt.offset ?? 0;
    this._start = this._offset;
    this._end =
      opt.length !== undefined ? this._start + opt.length : this._buffer.length;
  }

  /**
   * Create a copy of **other**.
   */
  public static from<T extends TypedArray>(
    other: InputBuffer<T>,
    offset?: number,
    length?: number
  ) {
    const offsetFromOther = offset ?? 0;
    const result = new InputBuffer<T>({
      buffer: other._buffer,
      bigEndian: other._bigEndian,
      offset: other._offset + offsetFromOther,
      length: length,
    });
    result._start = other._start;
    result._end =
      length !== undefined
        ? other.offset + offsetFromOther + length
        : other._end;
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
   */
  public get(index: number): number {
    return this._buffer[this._offset + index];
  }

  /**
   * Set a buffer element relative to the current position.
   */
  public set(index: number, value: number) {
    return (this._buffer[this._offset + index] = value);
  }

  /**
   * Copy data from **other** to this buffer, at **start** offset from the
   * current read position, and **length** number of bytes. **offset** is
   * the offset in **other** to start reading.
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
   * Set a range of bytes in this buffer to **value**, at **start** offset from the
   * current read position, and **length** number of bytes.
   */
  public memset(start: number, length: number, value: number): void {
    this._buffer.fill(
      value,
      this._offset + start,
      this._offset + start + length
    );
  }

  /**
   * Return an InputBuffer to read a subset of this stream. It does not
   * move the read position of this stream. **position** is specified relative
   * to the start of the buffer. If **position** is not specified, the current
   * read position is used. If **length** is not specified, the remainder of this
   * stream is used.
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
   * Returns the position of the given **value** within the buffer, starting
   * from the current read position with the given **offset**. The position
   * returned is relative to the start of the buffer, or -1 if the **value**
   * was not found.
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
   * Read **count** bytes from an **offset** of the current read position, without
   * moving the read position.
   */
  public peek(count: number, offset = 0): InputBuffer<T> {
    return this.subarray(count, undefined, offset);
  }

  /**
   * Move the read position by **count** bytes.
   */
  public skip(count: number): void {
    this._offset += count;
  }

  /**
   * Read a single value.
   */
  public read(): number {
    return this._buffer[this._offset++];
  }

  /**
   * Read **count** bytes from the stream.
   */
  public readRange(count: number): InputBuffer<T> {
    const bytes = this.subarray(count);
    this._offset += bytes.length;
    return bytes;
  }

  /**
   * Read 8-bit integer from the stream.
   */
  public readInt8(): number {
    return BitUtils.uint8ToInt8(this.read());
  }

  /**
   * Read a null-terminated string, or if **length** is provided, that number of
   * bytes returned as a string.
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
   * Read a null-terminated UTF-8 string.
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
   * Read a 16-bit word from the stream.
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
   * Read a 16-bit word from the stream.
   */
  public readInt16(): number {
    return BitUtils.uint16ToInt16(this.readUint16());
  }

  /**
   * Read a 24-bit word from the stream.
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
   * Read a 32-bit word from the stream.
   */
  public readUint32(): number {
    return BitUtils.int32ToUint32(this.readInt32());
  }

  /**
   * Read a signed 32-bit integer from the stream.
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
   * Read a 32-bit float.
   */
  public readFloat32(): number {
    return BitUtils.uint32ToFloat32(this.readUint32());
  }

  /**
   * Read a 64-bit float.
   */
  public readFloat64(): number {
    return BitUtils.uint64ToFloat64(this.readUint64());
  }

  /**
   * Read a 64-bit word form the stream.
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
