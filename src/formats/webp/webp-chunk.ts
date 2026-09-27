/** @format */

import { MathUtils } from '../../common/math-utils.js';
import { OutputBuffer } from '../../common/output-buffer.js';

/**
 * A chunk of a WebP file: a four character tag and its payload.
 */
export class WebPChunk {
  public readonly tag: string;
  public readonly data: Uint8Array;

  constructor(tag: string, data: Uint8Array) {
    this.tag = tag;
    this.data = data;
  }

  /**
   * Chunks are padded to an even length, and the pad byte is not counted in
   * the size field.
   */
  public get diskSize(): number {
    return 8 + this.data.length + (this.data.length % 2 === 1 ? 1 : 0);
  }

  public writeTo(out: OutputBuffer): void {
    out.writeBytes(webPTag(this.tag));
    out.writeUint32(this.data.length);
    out.writeBytes(this.data);
    if (this.data.length % 2 === 1) {
      out.writeByte(0);
    }
  }
}

/**
 * The four bytes of a chunk tag.
 */
export function webPTag(s: string): Uint8Array {
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    bytes[i] = s.charCodeAt(i);
  }
  return bytes;
}

/**
 * The flags byte of a VP8X chunk.
 */
export function vp8xFlags(
  hasIcc: boolean,
  hasAlpha: boolean,
  hasExif: boolean,
  hasXmp: boolean,
  hasAnimation: boolean
): number {
  return (
    (hasIcc ? 1 << 5 : 0) |
    (hasAlpha ? 1 << 4 : 0) |
    (hasExif ? 1 << 3 : 0) |
    (hasXmp ? 1 << 2 : 0) |
    (hasAnimation ? 1 << 1 : 0)
  );
}

/**
 * The VP8X chunk payload: the flags and the canvas size.
 */
export function vp8xChunkData(
  flags: number,
  width: number,
  height: number
): Uint8Array {
  const out = new OutputBuffer();
  out.writeByte(flags);
  out.writeByte(0);
  out.writeByte(0);
  out.writeByte(0);
  writeUint24(out, width - 1);
  writeUint24(out, height - 1);
  return out.getBytes();
}

/**
 * The ANIM chunk payload: the canvas background color and the loop count.
 *
 * {@link loopCount} is clamped, since wrapping its sixteen bit field turns 70000
 * loops into 4464.
 */
export function animChunkData(
  r: number,
  g: number,
  b: number,
  a: number,
  loopCount: number
): Uint8Array {
  // The chunk holds blue, green, red, alpha in that byte order, and the buffer
  // is little endian, so the packed value runs the other way.
  const out = new OutputBuffer();
  out.writeUint32((a << 24) | (r << 16) | (g << 8) | b);
  out.writeUint16(MathUtils.clamp(loopCount, 0, 0xffff));
  return out.getBytes();
}

/**
 * One ANMF chunk: the frame's placement and timing, then its bitstream.
 *
 * {@link duration} is clamped, since wrapping its twenty four bit field turns a
 * negative duration into a pause of over four hours.
 */
export function anmfChunkData(
  x: number,
  y: number,
  width: number,
  height: number,
  duration: number,
  clearToBackground: boolean,
  blend: boolean,
  frame: WebPChunk[]
): Uint8Array {
  const out = new OutputBuffer();
  // The offsets are stored halved, so they are always even.
  writeUint24(out, x >> 1);
  writeUint24(out, y >> 1);
  writeUint24(out, width - 1);
  writeUint24(out, height - 1);
  writeUint24(out, MathUtils.clamp(duration, 0, 0xffffff));
  // Bit 0 disposes to the background after the frame is shown, bit 1 is set
  // when the frame must not be blended.
  out.writeByte((clearToBackground ? 1 : 0) | (blend ? 0 : 2));
  // The frame's own chunks follow: its bitstream, preceded by the alpha plane
  // when the bitstream is lossy and carries none of its own.
  for (const chunk of frame) {
    chunk.writeTo(out);
  }
  return out.getBytes();
}

/**
 * Wraps {@link chunks} in the RIFF/WEBP header.
 */
export function buildRiff(chunks: WebPChunk[]): Uint8Array {
  let payload = 4;
  for (const c of chunks) {
    payload += c.diskSize;
  }

  const out = new OutputBuffer();
  out.writeBytes(webPTag('RIFF'));
  out.writeUint32(payload);
  out.writeBytes(webPTag('WEBP'));
  for (const c of chunks) {
    c.writeTo(out);
  }
  return out.getBytes();
}

function writeUint24(out: OutputBuffer, v: number): void {
  out.writeByte(v & 0xff);
  out.writeByte((v >> 8) & 0xff);
  out.writeByte((v >> 16) & 0xff);
}
