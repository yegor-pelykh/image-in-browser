/** @format */

import { BitOperators } from '../../common/bit-operators';
import { TextCodec } from '../../common/text-codec';
import { ImageError } from '../../error/image-error';

export interface InputBufferInitOptions {
  buffer: Uint8Array;
  offset?: number;
  length?: number;
  bigEndian?: boolean;
}

/**
 * A buffer that can be read as a stream of bytes.
 */
export class InputBuffer {
  private readonly _buffer: Uint8Array;
  public get buffer(): Uint8Array {
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
  get position(): number {
    return this._offset - this._start;
  }

  /**
   * How many bytes are left in the stream.
   */
  get length(): number {
    return this._end - this._offset;
  }

  /**
   * Is the current position at the end of the stream?
   */
  get isEOS(): boolean {
    return this._offset >= this._end;
  }

  /**
   * Create a InputStream for reading from an Array<int>
   */
  constructor(options: InputBufferInitOptions) {
    this._buffer = options.buffer;
    this._bigEndian = options.bigEndian ?? false;
    this._offset = options.offset ?? 0;
    this._start = this._offset;
    this._end =
      options.length !== undefined
        ? this._start + options.length
        : this._buffer.length;
  }

  /**
   * Create a copy of [other].
   */
  public static from(other: InputBuffer, offset?: number, length?: number) {
    const offsetFromOther = offset ?? 0;
    const result = new InputBuffer({
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
  public getByte(index: number): number {
    return this._buffer[this._offset + index];
  }

  /**
   * Set a buffer element relative to the current position.
   */
  public setByte(index: number, value: number) {
    return (this._buffer[this._offset + index] = value);
  }

  /**
   * Set a range of bytes in this buffer to [value], at [start] offset from the
   * current read position, and [length] number of bytes.
   */
  public memset(start: number, length: number, value: number): void {
    this._buffer.fill(
      this._offset + start,
      this._offset + start + length,
      value
    );
  }

  /**
   * Return a InputStream to read a subset of this stream. It does not
   * move the read position of this stream. [position] is specified relative
   * to the start of the buffer. If [position] is not specified, the current
   * read position is used. If [length] is not specified, the remainder of this
   * stream is used.
   */
  public subarray(count: number, position?: number, offset = 0): InputBuffer {
    let pos = position !== undefined ? this._start + position : this._offset;
    pos += offset;
    return new InputBuffer({
      buffer: this._buffer,
      bigEndian: this._bigEndian,
      offset: pos,
      length: count,
    });
  }

  /**
   * Returns the position of the given [value] within the buffer, starting
   * from the current read position with the given [offset]. The position
   * returned is relative to the start of the buffer, or -1 if the [value]
   * was not found.
   */
  public indexOf(value: number, offset = 0): number {
    for (
      let i = this._offset + offset, end = this._offset + length;
      i < end;
      ++i
    ) {
      if (this._buffer[i] === value) {
        return i - this._start;
      }
    }
    return -1;
  }

  /**
   * Read [count] bytes from an [offset] of the current read position, without
   * moving the read position.
   */
  public peekBytes(count: number, offset = 0): InputBuffer {
    return this.subarray(count, undefined, offset);
  }

  /**
   * Move the read position by [count] bytes.
   */
  public skip(count: number): void {
    this._offset += count;
  }

  /**
   * Read a single byte.
   */
  public readByte(): number {
    return this._buffer[this._offset++];
  }

  public readInt8(): number {
    return BitOperators.toInt8(this.readByte());
  }

  /**
   * Read [count] bytes from the stream.
   */
  public readBytes(count: number): InputBuffer {
    const bytes = this.subarray(count);
    this._offset += bytes.length;
    return bytes;
  }

  /**
   * Read a null-terminated string, or if [length] is provided, that number of
   * bytes returned as a string.
   */
  public readString(length?: number): string {
    if (length === undefined) {
      const codes: number[] = [];
      while (!this.isEOS) {
        const c = this.readByte();
        if (c === 0) {
          return String.fromCharCode(...codes);
        }
        codes.push(c);
      }
      throw new ImageError('EOF reached without finding string terminator');
    }

    const s = this.readBytes(length);
    const bytes = s.toUint8Array();
    const result = String.fromCharCode(...bytes);
    return result;
  }

  /**
   * Read a null-terminated UTF-8 string.
   */
  public readStringUtf8(): string {
    const codes: number[] = [];
    while (!this.isEOS) {
      const c = this.readByte();
      if (c === 0) {
        const array = new Uint8Array(codes);
        return TextCodec.utf8Decoder.decode(array);
      }
      codes.push(c);
    }
    throw new ImageError('EOF reached without finding string terminator');
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
    return BitOperators.toInt16(this.readUint16());
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
    const b1 = this._buffer[this._offset++] & 0xff;
    const b2 = this._buffer[this._offset++] & 0xff;
    const b3 = this._buffer[this._offset++] & 0xff;
    const b4 = this._buffer[this._offset++] & 0xff;
    const d = this._bigEndian
      ? (b1 << 24) | (b2 << 16) | (b3 << 8) | b4
      : (b4 << 24) | (b3 << 16) | (b2 << 8) | b1;
    return BitOperators.toUint32(d);
  }

  /**
   * Read a signed 32-bit integer from the stream.
   */
  public readInt32(): number {
    return BitOperators.toInt32(this.readUint32());
  }

  /**
   * Read a 32-bit float.
   */
  public readFloat32(): number {
    return BitOperators.toFloat32(this.readUint32());
  }

  /**
   * Read a 64-bit float.
   */
  public readFloat64(): number {
    return BitOperators.toFloat64(this.readUint64());
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

  public toUint8Array(offset?: number, length?: number): Uint8Array {
    const correctedOffset = offset ?? 0;
    const correctedLength = length ?? this.length - correctedOffset;
    return new Uint8Array(
      this._buffer.buffer,
      this._buffer.byteOffset + this._offset + correctedOffset,
      correctedLength
    );
  }

  public toUint32Array(offset?: number): Uint32Array {
    const correctedOffset = offset ?? 0;
    return new Uint32Array(
      this._buffer.buffer,
      this._buffer.byteOffset + this._offset + correctedOffset
    );
  }
}
