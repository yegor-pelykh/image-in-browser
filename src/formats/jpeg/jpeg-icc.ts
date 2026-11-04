/** @format */

import type { InputBuffer } from '../../common/input-buffer.js';
import type { OutputBuffer } from '../../common/output-buffer.js';
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
 * Writes the **profile** as APP2 segments.
 * @param {OutputBuffer} out - The output buffer.
 * @param {Uint8Array} profile - The ICC profile data.
 */
export function writeJpegIccProfile(
  out: OutputBuffer,
  profile: Uint8Array
): void {
  const numParts = Math.trunc((profile.length + maxPartSize - 1) / maxPartSize);
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
 * Joins the parts of an ICC profile read from APP2 segments.
 */
export class JpegIccProfileReader {
  /**
   * The parts of the profile, by their 1-based sequence number.
   */
  private readonly _parts = new Map<number, Uint8Array>();

  /**
   * Reads the APP2 **block**. Returns the profile when all of its parts are
   * read, or undefined.
   * @param {InputBuffer<Uint8Array>} block - The APP2 block data.
   * @returns {Uint8Array | undefined} The joined profile, if complete.
   */
  public read(block: InputBuffer<Uint8Array>): Uint8Array | undefined {
    if (block.length < signature.length + 2) {
      return undefined;
    }
    for (const b of signature) {
      if (block.read() !== b) {
        return undefined;
      }
    }
    const sequence = block.read();
    const numParts = block.read();
    if (sequence === 0 || sequence > numParts) {
      return undefined;
    }
    this._parts.set(sequence, block.toUint8Array());
    return this.join(numParts);
  }

  /**
   * Joins the parts of the profile in sequence order.
   * @param {number} numParts - The number of parts in the profile.
   * @returns {Uint8Array | undefined} The joined profile, if all parts are present.
   */
  private join(numParts: number): Uint8Array | undefined {
    const parts = new Array<Uint8Array>();
    for (let i = 1; i <= numParts; ++i) {
      const part = this._parts.get(i);
      if (part === undefined) {
        return undefined;
      }
      parts.push(part);
    }
    const profile = new Uint8Array(
      parts.reduce((size, part) => size + part.length, 0)
    );
    let offset = 0;
    for (const part of parts) {
      profile.set(part, offset);
      offset += part.length;
    }
    return profile;
  }
}
