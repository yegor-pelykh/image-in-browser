/** @format */

import type { InputBuffer } from '../../common/input-buffer.js';
import type { OutputBuffer } from '../../common/output-buffer.js';
import { LibError } from '../../error/lib-error.js';
import { JpegMarker } from './jpeg-marker.js';

/**
 * An ICC profile is stored in APP2 segments, each with 'ICC_PROFILE\0', its
 * 1-based sequence number, the number of segments and a part of the profile.
 */
const signature = new Uint8Array([
  0x49, 0x43, 0x43, 0x5f, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x00,
]);

/**
 * The size of a segment before its part of the profile: the length, the
 * signature, the sequence number and the count.
 */
const headerSize = 2 + 12 + 2;

/**
 * The segment length is 16 bits.
 */
const maxPartSize = 65535 - headerSize;

/**
 * The sequence number and count are 8 bits.
 */
const maxParts = 255;

/**
 * Writes the **profile** as APP2 segments. Throws a {@link LibError} if it
 * doesn't fit in them.
 * @param {OutputBuffer} out - The output buffer.
 * @param {Uint8Array} profile - The ICC profile data.
 */
export function writeJpegIccProfile(
  out: OutputBuffer,
  profile: Uint8Array
): void {
  const numParts = Math.trunc((profile.length + maxPartSize - 1) / maxPartSize);
  if (numParts > maxParts) {
    throw new LibError('ICC profile is too large for a JPEG');
  }
  for (let i = 0; i < numParts; ++i) {
    const start = i * maxPartSize;
    const end = Math.min(start + maxPartSize, profile.length);
    out.writeByte(0xff);
    out.writeByte(JpegMarker.app2);
    out.writeUint16(headerSize + end - start);
    out.writeBytes(signature);
    out.writeByte(i + 1);
    out.writeByte(numParts);
    out.writeBytes(profile.subarray(start, end));
  }
}

/**
 * Collects the parts of an ICC profile from APP2 segments.
 */
export class JpegIccProfileReader {
  /**
   * The parts of the profile, by their 1-based sequence number.
   */
  private readonly _parts = new Map<number, Uint8Array>();

  /**
   * The number of parts in the profile, or 0 if none have been read.
   */
  private _numParts = 0;

  /**
   * Whether the segments read make a valid profile.
   */
  private _valid = true;

  /**
   * The joined profile, or undefined if the segments read don't make a complete
   * profile: like libjpeg, a count that differs between segments or a repeated
   * sequence number invalidates all of them.
   * @returns {Uint8Array | undefined} The joined profile, if complete.
   */
  public get profile(): Uint8Array | undefined {
    if (
      !this._valid ||
      this._parts.size === 0 ||
      this._parts.size !== this._numParts
    ) {
      return undefined;
    }
    let length = 0;
    for (let i = 1; i <= this._numParts; ++i) {
      length += this._parts.get(i)!.length;
    }
    const profile = new Uint8Array(length);
    let offset = 0;
    for (let i = 1; i <= this._numParts; ++i) {
      const part = this._parts.get(i)!;
      profile.set(part, offset);
      offset += part.length;
    }
    return profile;
  }

  /**
   * Reads the APP2 **block**, ignoring it if it isn't an ICC profile segment.
   * @param {InputBuffer<Uint8Array>} block - The APP2 block data.
   */
  public read(block: InputBuffer<Uint8Array>): void {
    if (block.length < signature.length + 2) {
      return;
    }
    for (const b of signature) {
      if (block.read() !== b) {
        return;
      }
    }
    const data = block.toUint8Array();
    if (this.isUnsplit(data)) {
      this.add(1, 1, data);
    } else {
      this.add(data[0], data[1], data.subarray(2));
    }
  }

  /**
   * Earlier encoders wrote the profile directly after the signature. The
   * profile starts with its big-endian size, so the byte that would be the
   * sequence number is 0, and the size is that of the segment data.
   * @param {Uint8Array} data - The segment data after the signature.
   * @returns {boolean} True if the data is a complete profile written without a sequence number and count.
   */
  private isUnsplit(data: Uint8Array): boolean {
    return (
      data.length >= 4 &&
      data[0] === 0 &&
      new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(
        0
      ) === data.length
    );
  }

  /**
   * Adds a part of the profile.
   * @param {number} sequence - The 1-based sequence number.
   * @param {number} numParts - The number of parts in the profile.
   * @param {Uint8Array} part - The part data.
   */
  private add(sequence: number, numParts: number, part: Uint8Array): void {
    if (this._numParts === 0) {
      this._numParts = numParts;
    }
    if (
      sequence === 0 ||
      sequence > numParts ||
      numParts !== this._numParts ||
      this._parts.has(sequence)
    ) {
      this._valid = false;
      return;
    }
    this._parts.set(sequence, part);
  }
}
