/** @format */

import { BitUtils } from '../../common/bit-utils.js';
import { InputBuffer } from '../../common/input-buffer.js';
import { VP8 } from './vp8.js';

/**
 * Class representing the VP8 filter operations.
 */
export class VP8Filter {
  constructor() {
    VP8Filter.initTables();
  }

  /**
   * Multiplies two numbers and shifts the result right by 16 bits. The product
   * is within +-2^30, so it's shifted with a bias that makes it non-negative:
   * exact, and safe from JavaScript's unsigned shifts.
   * @param {number} a - The first number.
   * @param {number} b - The second number.
   * @returns {number} The result of the multiplication shifted right by 16 bits.
   */
  private static mul(a: number, b: number): number {
    return ((a * b + 0x40000000) >>> 16) - 0x4000;
  }

  /**
   * Stores a value in the destination buffer after clipping.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer.
   * @param {number} di - The destination index.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @param {number} v - The value to store.
   */
  private static store(
    dst: InputBuffer<Uint8Array>,
    di: number,
    x: number,
    y: number,
    v: number
  ): void {
    const i = di + x + y * VP8.bps;
    dst.set(i, VP8Filter.clip8b(dst.get(i) + VP8Filter.shift3(v)));
  }

  /**
   * Stores a value in the destination buffer after clipping.
   * @param {Uint8Array} dst - The destination buffer.
   * @param {number} i - The destination index.
   * @param {number} v - The value to store.
   */
  private static storeAt(dst: Uint8Array, i: number, v: number): void {
    dst[i] = VP8Filter.clip8b(dst[i] + VP8Filter.shift3(v));
  }

  /**
   * Shifts a value right by 3 bits, for a value in [-65536, 65535].
   * @param {number} v - The value to shift.
   * @returns {number} The shifted value.
   */
  private static shift3(v: number): number {
    return ((v + 65536) >>> 3) - 8192;
  }

  /**
   * Stores values in the destination buffer for a 2x2 block.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer.
   * @param {number} y - The y-coordinate.
   * @param {number} dc - The DC value.
   * @param {number} d - The D value.
   * @param {number} c - The C value.
   */
  private static store2(
    dst: InputBuffer<Uint8Array>,
    y: number,
    dc: number,
    d: number,
    c: number
  ): void {
    VP8Filter.store(dst, 0, 0, y, dc + d);
    VP8Filter.store(dst, 0, 1, y, dc + c);
    VP8Filter.store(dst, 0, 2, y, dc - c);
    VP8Filter.store(dst, 0, 3, y, dc - d);
  }

  /**
   * Initializes the lookup tables used for filtering.
   */
  private static initTables(): void {
    if (!this.tablesInitialized) {
      for (let i = -255; i <= 255; ++i) {
        this.abs0[255 + i] = i < 0 ? -i : i;
        this.abs1[255 + i] = this.abs0[255 + i] >>> 1;
      }
      for (let i = -1020; i <= 1020; ++i) {
        this.sclip1[1020 + i] = i < -128 ? -128 : i > 127 ? 127 : i;
      }
      for (let i = -112; i <= 112; ++i) {
        this.sclip2[112 + i] = i < -16 ? -16 : i > 15 ? 15 : i;
      }
      for (let i = -255; i <= 255 + 255; ++i) {
        this.clip1[255 + i] = i < 0 ? 0 : i > 255 ? 255 : i;
      }
      this.tablesInitialized = true;
    }
  }

  /**
   * Clips a value to the range [0, 255].
   * @param {number} v - The value to clip.
   * @returns {number} The clipped value.
   */
  private static clip8b(v: number): number {
    return (v & -256) === 0 ? v : v < 0 ? 0 : 255;
  }

  /**
   * Computes the average of three numbers.
   * @param {number} a - The first number.
   * @param {number} b - The second number.
   * @param {number} c - The third number.
   * @returns {number} The average of the three numbers.
   */
  private static avg3(a: number, b: number, c: number): number {
    return BitUtils.sshR(a + 2 * b + c + 2, 2);
  }

  /**
   * Computes the average of two numbers.
   * @param {number} a - The first number.
   * @param {number} b - The second number.
   * @returns {number} The average of the two numbers.
   */
  private static avg2(a: number, b: number): number {
    return BitUtils.sshR(a + b + 1, 1);
  }

  /**
   * Vertical edge filtering for a 4x4 block.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer.
   */
  private static ve4(dst: InputBuffer<Uint8Array>): void {
    const top = -VP8.bps;
    const values: Uint8Array = new Uint8Array([
      VP8Filter.avg3(dst.get(top - 1), dst.get(top), dst.get(top + 1)),
      VP8Filter.avg3(dst.get(top), dst.get(top + 1), dst.get(top + 2)),
      VP8Filter.avg3(dst.get(top + 1), dst.get(top + 2), dst.get(top + 3)),
      VP8Filter.avg3(dst.get(top + 2), dst.get(top + 3), dst.get(top + 4)),
    ]);

    for (let i = 0; i < 4; ++i) {
      dst.memcpy(i * VP8.bps, 4, values);
    }
  }

  /**
   * Horizontal edge filtering for a 4x4 block.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer.
   */
  private static he4(dst: InputBuffer<Uint8Array>): void {
    const a = dst.get(-1 - VP8.bps);
    const b = dst.get(-1);
    const c = dst.get(-1 + VP8.bps);
    const d = dst.get(-1 + 2 * VP8.bps);
    const e = dst.get(-1 + 3 * VP8.bps);
    const d2 = InputBuffer.from(dst);

    d2.toUint32Array()[0] = 0x01010101 * VP8Filter.avg3(a, b, c);
    d2.offset += VP8.bps;
    d2.toUint32Array()[0] = 0x01010101 * VP8Filter.avg3(b, c, d);
    d2.offset += VP8.bps;
    d2.toUint32Array()[0] = 0x01010101 * VP8Filter.avg3(c, d, e);
    d2.offset += VP8.bps;
    d2.toUint32Array()[0] = 0x01010101 * VP8Filter.avg3(d, e, e);
  }

  /**
   * DC edge filtering for a 4x4 block.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer.
   */
  private static dc4(dst: InputBuffer<Uint8Array>): void {
    // DC
    let dc = 4;
    for (let i = 0; i < 4; ++i) {
      dc += dst.get(i - VP8.bps) + dst.get(-1 + i * VP8.bps);
    }
    dc >>>= 3;
    for (let i = 0; i < 4; ++i) {
      dst.memset(i * VP8.bps, 4, dc);
    }
  }

  /**
   * True motion filtering for a block of given size.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer.
   * @param {number} size - The size of the block.
   */
  private static trueMotion(dst: InputBuffer<Uint8Array>, size: number): void {
    const top = -VP8.bps;
    const clip0 = 255 - dst.get(top - 1);
    let di = 0;
    for (let y = 0; y < size; ++y) {
      const clip = clip0 + dst.get(di - 1);
      for (let x = 0; x < size; ++x) {
        dst.set(di + x, VP8Filter.clip1[clip + dst.get(top + x)]);
      }
      di += VP8.bps;
    }
  }

  /**
   * True motion filtering for a 4x4 block.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer.
   */
  private static tm4(dst: InputBuffer<Uint8Array>): void {
    VP8Filter.trueMotion(dst, 4);
  }

  /**
   * True motion filtering for an 8x8 block.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer.
   */
  private static tm8uv(dst: InputBuffer<Uint8Array>): void {
    VP8Filter.trueMotion(dst, 8);
  }

  /**
   * True motion filtering for a 16x16 block.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer.
   */
  private static tm16(dst: InputBuffer<Uint8Array>): void {
    VP8Filter.trueMotion(dst, 16);
  }

  /**
   * Computes the destination index for a given x and y coordinate.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @returns {number} The destination index.
   */
  private static dst(x: number, y: number): number {
    return x + y * VP8.bps;
  }

  /**
   * Down-right filtering for a 4x4 block.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer.
   */
  private static rd4(dst: InputBuffer<Uint8Array>): void {
    const i = dst.get(-1);
    const j = dst.get(-1 + VP8.bps);
    const K = dst.get(-1 + 2 * VP8.bps);
    const l = dst.get(-1 + 3 * VP8.bps);
    const x = dst.get(-1 - VP8.bps);
    const a = dst.get(0 - VP8.bps);
    const b = dst.get(1 - VP8.bps);
    const c = dst.get(2 - VP8.bps);
    const d = dst.get(3 - VP8.bps);

    dst.set(VP8Filter.dst(0, 3), VP8Filter.avg3(j, K, l));
    dst.set(
      VP8Filter.dst(0, 2),
      dst.set(VP8Filter.dst(1, 3), VP8Filter.avg3(i, j, K))
    );
    dst.set(
      VP8Filter.dst(0, 1),
      dst.set(
        VP8Filter.dst(1, 2),
        dst.set(VP8Filter.dst(2, 3), VP8Filter.avg3(x, i, j))
      )
    );
    dst.set(
      VP8Filter.dst(0, 0),
      dst.set(
        VP8Filter.dst(1, 1),
        dst.set(
          VP8Filter.dst(2, 2),
          dst.set(VP8Filter.dst(3, 3), VP8Filter.avg3(a, x, i))
        )
      )
    );
    dst.set(
      VP8Filter.dst(1, 0),
      dst.set(
        VP8Filter.dst(2, 1),
        dst.set(VP8Filter.dst(3, 2), VP8Filter.avg3(b, a, x))
      )
    );
    dst.set(
      VP8Filter.dst(2, 0),
      dst.set(VP8Filter.dst(3, 1), VP8Filter.avg3(c, b, a))
    );
    dst.set(VP8Filter.dst(3, 0), VP8Filter.avg3(d, c, b));
  }

  /**
   * Down-left filtering for a 4x4 block.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer.
   */
  private static ld4(dst: InputBuffer<Uint8Array>): void {
    const a = dst.get(0 - VP8.bps);
    const b = dst.get(1 - VP8.bps);
    const c = dst.get(2 - VP8.bps);
    const d = dst.get(3 - VP8.bps);
    const e = dst.get(4 - VP8.bps);
    const f = dst.get(5 - VP8.bps);
    const g = dst.get(6 - VP8.bps);
    const h = dst.get(7 - VP8.bps);

    dst.set(VP8Filter.dst(0, 0), VP8Filter.avg3(a, b, c));
    dst.set(
      VP8Filter.dst(1, 0),
      dst.set(VP8Filter.dst(0, 1), VP8Filter.avg3(b, c, d))
    );
    dst.set(
      VP8Filter.dst(2, 0),
      dst.set(
        VP8Filter.dst(1, 1),
        dst.set(VP8Filter.dst(0, 2), VP8Filter.avg3(c, d, e))
      )
    );
    dst.set(
      VP8Filter.dst(3, 0),
      dst.set(
        VP8Filter.dst(2, 1),
        dst.set(
          VP8Filter.dst(1, 2),
          dst.set(VP8Filter.dst(0, 3), VP8Filter.avg3(d, e, f))
        )
      )
    );
    dst.set(
      VP8Filter.dst(3, 1),
      dst.set(
        VP8Filter.dst(2, 2),
        dst.set(VP8Filter.dst(1, 3), VP8Filter.avg3(e, f, g))
      )
    );
    dst.set(
      VP8Filter.dst(3, 2),
      dst.set(VP8Filter.dst(2, 3), VP8Filter.avg3(f, g, h))
    );
    dst.set(VP8Filter.dst(3, 3), VP8Filter.avg3(g, h, h));
  }

  /**
   * Vertical-right filtering for a 4x4 block.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer.
   */
  private static vr4(dst: InputBuffer<Uint8Array>): void {
    const i = dst.get(-1 + 0 * VP8.bps);
    const j = dst.get(-1 + VP8.bps);
    const k = dst.get(-1 + 2 * VP8.bps);
    const x = dst.get(-1 - VP8.bps);
    const a = dst.get(0 - VP8.bps);
    const b = dst.get(1 - VP8.bps);
    const c = dst.get(2 - VP8.bps);
    const d = dst.get(3 - VP8.bps);

    dst.set(
      VP8Filter.dst(0, 0),
      dst.set(VP8Filter.dst(1, 2), VP8Filter.avg2(x, a))
    );
    dst.set(
      VP8Filter.dst(1, 0),
      dst.set(VP8Filter.dst(2, 2), VP8Filter.avg2(a, b))
    );
    dst.set(
      VP8Filter.dst(2, 0),
      dst.set(VP8Filter.dst(3, 2), VP8Filter.avg2(b, c))
    );
    dst.set(VP8Filter.dst(3, 0), VP8Filter.avg2(c, d));

    dst.set(VP8Filter.dst(0, 3), VP8Filter.avg3(k, j, i));
    dst.set(VP8Filter.dst(0, 2), VP8Filter.avg3(j, i, x));
    dst.set(
      VP8Filter.dst(0, 1),
      dst.set(VP8Filter.dst(1, 3), VP8Filter.avg3(i, x, a))
    );
    dst.set(
      VP8Filter.dst(1, 1),
      dst.set(VP8Filter.dst(2, 3), VP8Filter.avg3(x, a, b))
    );
    dst.set(
      VP8Filter.dst(2, 1),
      dst.set(VP8Filter.dst(3, 3), VP8Filter.avg3(a, b, c))
    );
    dst.set(VP8Filter.dst(3, 1), VP8Filter.avg3(b, c, d));
  }

  /**
   * Vertical-left filtering for a 4x4 block.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer.
   */
  private static vl4(dst: InputBuffer<Uint8Array>): void {
    const a = dst.get(0 - VP8.bps);
    const b = dst.get(1 - VP8.bps);
    const c = dst.get(2 - VP8.bps);
    const d = dst.get(3 - VP8.bps);
    const e = dst.get(4 - VP8.bps);
    const f = dst.get(5 - VP8.bps);
    const g = dst.get(6 - VP8.bps);
    const h = dst.get(7 - VP8.bps);

    dst.set(VP8Filter.dst(0, 0), VP8Filter.avg2(a, b));
    dst.set(
      VP8Filter.dst(1, 0),
      dst.set(VP8Filter.dst(0, 2), VP8Filter.avg2(b, c))
    );
    dst.set(
      VP8Filter.dst(2, 0),
      dst.set(VP8Filter.dst(1, 2), VP8Filter.avg2(c, d))
    );
    dst.set(
      VP8Filter.dst(3, 0),
      dst.set(VP8Filter.dst(2, 2), VP8Filter.avg2(d, e))
    );

    dst.set(VP8Filter.dst(0, 1), VP8Filter.avg3(a, b, c));
    dst.set(
      VP8Filter.dst(1, 1),
      dst.set(VP8Filter.dst(0, 3), VP8Filter.avg3(b, c, d))
    );
    dst.set(
      VP8Filter.dst(2, 1),
      dst.set(VP8Filter.dst(1, 3), VP8Filter.avg3(c, d, e))
    );
    dst.set(
      VP8Filter.dst(3, 1),
      dst.set(VP8Filter.dst(2, 3), VP8Filter.avg3(d, e, f))
    );
    dst.set(VP8Filter.dst(3, 2), VP8Filter.avg3(e, f, g));
    dst.set(VP8Filter.dst(3, 3), VP8Filter.avg3(f, g, h));
  }

  /**
   * Horizontal-up filtering for a 4x4 block.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer.
   */
  private static hu4(dst: InputBuffer<Uint8Array>): void {
    const i = dst.get(-1 + 0 * VP8.bps);
    const j = dst.get(-1 + VP8.bps);
    const k = dst.get(-1 + 2 * VP8.bps);
    const l = dst.get(-1 + 3 * VP8.bps);

    dst.set(VP8Filter.dst(0, 0), VP8Filter.avg2(i, j));
    dst.set(
      VP8Filter.dst(2, 0),
      dst.set(VP8Filter.dst(0, 1), VP8Filter.avg2(j, k))
    );
    dst.set(
      VP8Filter.dst(2, 1),
      dst.set(VP8Filter.dst(0, 2), VP8Filter.avg2(k, l))
    );
    dst.set(VP8Filter.dst(1, 0), VP8Filter.avg3(i, j, k));
    dst.set(
      VP8Filter.dst(3, 0),
      dst.set(VP8Filter.dst(1, 1), VP8Filter.avg3(j, k, l))
    );
    dst.set(
      VP8Filter.dst(3, 1),
      dst.set(VP8Filter.dst(1, 2), VP8Filter.avg3(k, l, l))
    );
    dst.set(
      VP8Filter.dst(3, 2),
      dst.set(
        VP8Filter.dst(2, 2),
        dst.set(
          VP8Filter.dst(0, 3),
          dst.set(
            VP8Filter.dst(1, 3),
            dst.set(VP8Filter.dst(2, 3), dst.set(VP8Filter.dst(3, 3), l))
          )
        )
      )
    );
  }

  /**
   * Applies a horizontal-down filter to the destination buffer.
   *
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer of type InputBuffer containing Uint8Array.
   */
  private static hd4(dst: InputBuffer<Uint8Array>): void {
    const i = dst.get(-1 + 0 * VP8.bps);
    const j = dst.get(-1 + VP8.bps);
    const k = dst.get(-1 + 2 * VP8.bps);
    const l = dst.get(-1 + 3 * VP8.bps);
    const x = dst.get(-1 - VP8.bps);
    const a = dst.get(0 - VP8.bps);
    const b = dst.get(1 - VP8.bps);
    const c = dst.get(2 - VP8.bps);

    dst.set(
      VP8Filter.dst(0, 0),
      dst.set(VP8Filter.dst(2, 1), VP8Filter.avg2(i, x))
    );
    dst.set(
      VP8Filter.dst(0, 1),
      dst.set(VP8Filter.dst(2, 2), VP8Filter.avg2(j, i))
    );
    dst.set(
      VP8Filter.dst(0, 2),
      dst.set(VP8Filter.dst(2, 3), VP8Filter.avg2(k, j))
    );
    dst.set(VP8Filter.dst(0, 3), VP8Filter.avg2(l, k));

    dst.set(VP8Filter.dst(3, 0), VP8Filter.avg3(a, b, c));
    dst.set(VP8Filter.dst(2, 0), VP8Filter.avg3(x, a, b));
    dst.set(
      VP8Filter.dst(1, 0),
      dst.set(VP8Filter.dst(3, 1), VP8Filter.avg3(i, x, a))
    );
    dst.set(
      VP8Filter.dst(1, 1),
      dst.set(VP8Filter.dst(3, 2), VP8Filter.avg3(j, i, x))
    );
    dst.set(
      VP8Filter.dst(1, 2),
      dst.set(VP8Filter.dst(3, 3), VP8Filter.avg3(k, j, i))
    );
    dst.set(VP8Filter.dst(1, 3), VP8Filter.avg3(l, k, j));
  }

  /**
   * Applies a filter to the input buffer based on specified thresholds and strides.
   *
   * @param {Uint8Array} p - The buffer containing the data to be filtered.
   * @param {number} o0 - The byte offset of the edge in the buffer.
   * @param {number} hstride - The horizontal stride, which determines the step size in the horizontal direction.
   * @param {number} vstride - The vertical stride, which determines the step size in the vertical direction.
   * @param {number} size - The number of elements to process in the buffer.
   * @param {number} thresh - The threshold value used to determine if filtering is needed.
   * @param {number} ithresh - The inner threshold value used in the filtering decision process.
   * @param {number} hevThresh - The high edge variance threshold used to decide between different filtering methods.
   */
  private filterLoop26(
    p: Uint8Array,
    o0: number,
    hstride: number,
    vstride: number,
    size: number,
    thresh: number,
    ithresh: number,
    hevThresh: number
  ): void {
    let o = o0;
    for (let i = 0; i < size; ++i, o += vstride) {
      if (this.needsFilter2(p, o, hstride, thresh, ithresh)) {
        if (this.hev(p, o, hstride, hevThresh)) {
          this.doFilter2(p, o, hstride);
        } else {
          this.doFilter6(p, o, hstride);
        }
      }
    }
  }

  /**
   * Filters a loop with specific parameters.
   * @param {Uint8Array} p - The buffer containing the data.
   * @param {number} o0 - The byte offset of the edge in the buffer.
   * @param {number} hstride - Horizontal stride.
   * @param {number} vstride - Vertical stride.
   * @param {number} size - Size of the loop.
   * @param {number} thresh - Threshold value.
   * @param {number} ithresh - Inner threshold value.
   * @param {number} hevThresh - HEV threshold value.
   */
  private filterLoop24(
    p: Uint8Array,
    o0: number,
    hstride: number,
    vstride: number,
    size: number,
    thresh: number,
    ithresh: number,
    hevThresh: number
  ): void {
    let o = o0;
    for (let i = 0; i < size; ++i, o += vstride) {
      if (this.needsFilter2(p, o, hstride, thresh, ithresh)) {
        if (this.hev(p, o, hstride, hevThresh)) {
          this.doFilter2(p, o, hstride);
        } else {
          this.doFilter4(p, o, hstride);
        }
      }
    }
  }

  /**
   * Applies a 2-pixel filter.
   * @param {Uint8Array} p - The buffer containing the data.
   * @param {number} o - The byte offset of the edge in the buffer.
   * @param {number} step - Step size.
   */
  private doFilter2(p: Uint8Array, o: number, step: number): void {
    const p1 = p[o - 2 * step];
    const p0 = p[o - step];
    const q0 = p[o];
    const q1 = p[o + step];
    const a = 3 * (q0 - p0) + this._sclip1[1020 + p1 - q1];
    const a1 = this._sclip2[((a + 4 + 1024) >>> 3) - 128 + 112];
    const a2 = this._sclip2[((a + 3 + 1024) >>> 3) - 128 + 112];
    p[o - step] = this._clip1[255 + p0 + a2];
    p[o] = this._clip1[255 + q0 - a1];
  }

  /**
   * Applies a 4-pixel filter.
   * @param {Uint8Array} p - The buffer containing the data.
   * @param {number} o - The byte offset of the edge in the buffer.
   * @param {number} step - Step size.
   */
  private doFilter4(p: Uint8Array, o: number, step: number): void {
    const p1 = p[o - 2 * step];
    const p0 = p[o - step];
    const q0 = p[o];
    const q1 = p[o + step];
    const a = 3 * (q0 - p0);
    const a1 = this._sclip2[((a + 4 + 1024) >>> 3) - 128 + 112];
    const a2 = this._sclip2[((a + 3 + 1024) >>> 3) - 128 + 112];
    const a3 = ((a1 + 1 + 16) >>> 1) - 8;
    p[o - 2 * step] = this._clip1[255 + p1 + a3];
    p[o - step] = this._clip1[255 + p0 + a2];
    p[o] = this._clip1[255 + q0 - a1];
    p[o + step] = this._clip1[255 + q1 - a3];
  }

  /**
   * Applies a 6-pixel filter.
   * @param {Uint8Array} p - The buffer containing the data.
   * @param {number} o - The byte offset of the edge in the buffer.
   * @param {number} step - Step size.
   */
  private doFilter6(p: Uint8Array, o: number, step: number): void {
    const p2 = p[o - 3 * step];
    const p1 = p[o - 2 * step];
    const p0 = p[o - step];
    const q0 = p[o];
    const q1 = p[o + step];
    const q2 = p[o + 2 * step];
    const a = this._sclip1[1020 + 3 * (q0 - p0) + this._sclip1[1020 + p1 - q1]];
    // eq. to ((3 * a + 7) * 9) >>> 7
    const a1 = ((27 * a + 63 + 27 * 128) >>> 7) - 27;
    // eq. to ((2 * a + 7) * 9) >>> 7
    const a2 = ((18 * a + 63 + 18 * 128) >>> 7) - 18;
    // eq. to ((1 * a + 7) * 9) >>> 7
    const a3 = ((9 * a + 63 + 9 * 128) >>> 7) - 9;
    p[o - 3 * step] = this._clip1[255 + p2 + a3];
    p[o - 2 * step] = this._clip1[255 + p1 + a2];
    p[o - step] = this._clip1[255 + p0 + a1];
    p[o] = this._clip1[255 + q0 - a1];
    p[o + step] = this._clip1[255 + q1 - a2];
    p[o + 2 * step] = this._clip1[255 + q2 - a3];
  }

  /**
   * Determines if high edge variance (HEV) is present.
   * @param {Uint8Array} p - The buffer containing the data.
   * @param {number} o - The byte offset of the edge in the buffer.
   * @param {number} step - Step size.
   * @param {number} thresh - Threshold value.
   * @returns {boolean} True if HEV is present, false otherwise.
   */
  private hev(p: Uint8Array, o: number, step: number, thresh: number): boolean {
    const p1 = p[o - 2 * step];
    const p0 = p[o - step];
    const q0 = p[o];
    const q1 = p[o + step];
    return (
      this._abs0[255 + p1 - p0] > thresh || this._abs0[255 + q1 - q0] > thresh
    );
  }

  /**
   * Determines if filtering is needed.
   * @param {Uint8Array} p - The buffer containing the data.
   * @param {number} o - The byte offset of the edge in the buffer.
   * @param {number} step - Step size.
   * @param {number} thresh - Threshold value.
   * @returns {boolean} True if filtering is needed, false otherwise.
   */
  private needsFilter(
    p: Uint8Array,
    o: number,
    step: number,
    thresh: number
  ): boolean {
    const p1 = p[o - 2 * step];
    const p0 = p[o - step];
    const q0 = p[o];
    const q1 = p[o + step];
    return 2 * this._abs0[255 + p0 - q0] + this._abs1[255 + p1 - q1] <= thresh;
  }

  /**
   * Determines if filtering is needed with additional parameters.
   * @param {Uint8Array} p - The buffer containing the data.
   * @param {number} o - The byte offset of the edge in the buffer.
   * @param {number} step - Step size.
   * @param {number} t - Threshold value.
   * @param {number} it - Inner threshold value.
   * @returns {boolean} True if filtering is needed, false otherwise.
   */
  private needsFilter2(
    p: Uint8Array,
    o: number,
    step: number,
    t: number,
    it: number
  ): boolean {
    const p3 = p[o - 4 * step];
    const p2 = p[o - 3 * step];
    const p1 = p[o - 2 * step];
    const p0 = p[o - step];
    const q0 = p[o];
    const q1 = p[o + step];
    const q2 = p[o + 2 * step];
    const q3 = p[o + 3 * step];
    if (2 * this._abs0[255 + p0 - q0] + this._abs1[255 + p1 - q1] > t) {
      return false;
    }

    return (
      this._abs0[255 + p3 - p2] <= it &&
      this._abs0[255 + p2 - p1] <= it &&
      this._abs0[255 + p1 - p0] <= it &&
      this._abs0[255 + q3 - q2] <= it &&
      this._abs0[255 + q2 - q1] <= it &&
      this._abs0[255 + q1 - q0] <= it
    );
  }

  /**
   * Applies a simple vertical filter on 16 pixels.
   *
   * The loop filters work on the bytes of `p` around the edge at byte offset
   * `o`. Shifts of values that can be negative are done on a biased,
   * non-negative value: `(v + k * 2^n) >>> n == (v >>> n) + k`, which is exact
   * and safe from JavaScript's unsigned shifts.
   * @param {Uint8Array} p - The buffer containing the data.
   * @param {number} o - The byte offset of the edge in the buffer.
   * @param {number} stride - Stride value.
   * @param {number} threshold - Threshold value.
   */
  public simpleVFilter16(
    p: Uint8Array,
    o: number,
    stride: number,
    threshold: number
  ): void {
    for (let i = 0; i < 16; ++i) {
      if (this.needsFilter(p, o + i, stride, threshold)) {
        this.doFilter2(p, o + i, stride);
      }
    }
  }

  /**
   * Applies a simple horizontal filter on 16 pixels.
   * @param {Uint8Array} p - The buffer containing the data.
   * @param {number} o - The byte offset of the edge in the buffer.
   * @param {number} stride - Stride value.
   * @param {number} threshold - Threshold value.
   */
  public simpleHFilter16(
    p: Uint8Array,
    o: number,
    stride: number,
    threshold: number
  ): void {
    for (let i = 0; i < 16; ++i) {
      const q = o + i * stride;
      if (this.needsFilter(p, q, 1, threshold)) {
        this.doFilter2(p, q, 1);
      }
    }
  }

  /**
   * Applies a simple vertical filter on 16 pixels with inner edges.
   * @param {Uint8Array} p - The buffer containing the data.
   * @param {number} o - The byte offset of the edge in the buffer.
   * @param {number} stride - Stride value.
   * @param {number} threshold - Threshold value.
   */
  public simpleVFilter16i(
    p: Uint8Array,
    o: number,
    stride: number,
    threshold: number
  ): void {
    for (let k = 1; k <= 3; ++k) {
      this.simpleVFilter16(p, o + 4 * k * stride, stride, threshold);
    }
  }

  /**
   * Applies a simple horizontal filter on 16 pixels with inner edges.
   * @param {Uint8Array} p - The buffer containing the data.
   * @param {number} o - The byte offset of the edge in the buffer.
   * @param {number} stride - Stride value.
   * @param {number} threshold - Threshold value.
   */
  public simpleHFilter16i(
    p: Uint8Array,
    o: number,
    stride: number,
    threshold: number
  ): void {
    for (let k = 1; k <= 3; ++k) {
      this.simpleHFilter16(p, o + 4 * k, stride, threshold);
    }
  }

  /**
   * Applies a vertical filter on macroblock edges.
   * @param {Uint8Array} p - The buffer containing the data.
   * @param {number} o - The byte offset of the edge in the buffer.
   * @param {number} stride - Stride value.
   * @param {number} thresh - Threshold value.
   * @param {number} iThreshold - Inner threshold value.
   * @param {number} hevThreshold - HEV threshold value.
   */
  public vFilter16(
    p: Uint8Array,
    o: number,
    stride: number,
    thresh: number,
    iThreshold: number,
    hevThreshold: number
  ) {
    this.filterLoop26(p, o, stride, 1, 16, thresh, iThreshold, hevThreshold);
  }

  /**
   * Applies a horizontal filter on macroblock edges.
   * @param {Uint8Array} p - The buffer containing the data.
   * @param {number} o - The byte offset of the edge in the buffer.
   * @param {number} stride - Stride value.
   * @param {number} thresh - Threshold value.
   * @param {number} iThreshold - Inner threshold value.
   * @param {number} hevThreshold - HEV threshold value.
   */
  public hFilter16(
    p: Uint8Array,
    o: number,
    stride: number,
    thresh: number,
    iThreshold: number,
    hevThreshold: number
  ) {
    this.filterLoop26(p, o, 1, stride, 16, thresh, iThreshold, hevThreshold);
  }

  /**
   * Applies a vertical filter on three inner edges.
   * @param {Uint8Array} p - The buffer containing the data.
   * @param {number} o - The byte offset of the edge in the buffer.
   * @param {number} stride - Stride value.
   * @param {number} thresh - Threshold value.
   * @param {number} iThreshold - Inner threshold value.
   * @param {number} hevThreshold - HEV threshold value.
   */
  public vFilter16i(
    p: Uint8Array,
    o: number,
    stride: number,
    thresh: number,
    iThreshold: number,
    hevThreshold: number
  ): void {
    for (let k = 1; k <= 3; ++k) {
      this.filterLoop24(
        p,
        o + 4 * k * stride,
        stride,
        1,
        16,
        thresh,
        iThreshold,
        hevThreshold
      );
    }
  }

  /**
   * Applies a horizontal filter on three inner edges.
   * @param {Uint8Array} p - The buffer containing the data.
   * @param {number} o - The byte offset of the edge in the buffer.
   * @param {number} stride - Stride value.
   * @param {number} thresh - Threshold value.
   * @param {number} iThreshold - Inner threshold value.
   * @param {number} hevThreshold - HEV threshold value.
   */
  public hFilter16i(
    p: Uint8Array,
    o: number,
    stride: number,
    thresh: number,
    iThreshold: number,
    hevThreshold: number
  ): void {
    for (let k = 1; k <= 3; ++k) {
      this.filterLoop24(
        p,
        o + 4 * k,
        1,
        stride,
        16,
        thresh,
        iThreshold,
        hevThreshold
      );
    }
  }

  /**
   * Applies an 8-pixel wide vertical filter for chroma filtering.
   * @param {Uint8Array} u - The U component buffer.
   * @param {number} uo - The byte offset of the edge in the U buffer.
   * @param {Uint8Array} v - The V component buffer.
   * @param {number} vo - The byte offset of the edge in the V buffer.
   * @param {number} stride - Stride value.
   * @param {number} thresh - Threshold value.
   * @param {number} iThreshold - Inner threshold value.
   * @param {number} hevThreshold - HEV threshold value.
   */
  public vFilter8(
    u: Uint8Array,
    uo: number,
    v: Uint8Array,
    vo: number,
    stride: number,
    thresh: number,
    iThreshold: number,
    hevThreshold: number
  ): void {
    this.filterLoop26(u, uo, stride, 1, 8, thresh, iThreshold, hevThreshold);
    this.filterLoop26(v, vo, stride, 1, 8, thresh, iThreshold, hevThreshold);
  }

  /**
   * Applies an 8-pixel wide horizontal filter for chroma filtering.
   * @param {Uint8Array} u - The U component buffer.
   * @param {number} uo - The byte offset of the edge in the U buffer.
   * @param {Uint8Array} v - The V component buffer.
   * @param {number} vo - The byte offset of the edge in the V buffer.
   * @param {number} stride - Stride value.
   * @param {number} thresh - Threshold value.
   * @param {number} iThreshold - Inner threshold value.
   * @param {number} hevThreshold - HEV threshold value.
   */
  public hFilter8(
    u: Uint8Array,
    uo: number,
    v: Uint8Array,
    vo: number,
    stride: number,
    thresh: number,
    iThreshold: number,
    hevThreshold: number
  ): void {
    this.filterLoop26(u, uo, 1, stride, 8, thresh, iThreshold, hevThreshold);
    this.filterLoop26(v, vo, 1, stride, 8, thresh, iThreshold, hevThreshold);
  }

  /**
   * Applies an 8-pixel wide vertical filter on inner edges for chroma filtering.
   * @param {Uint8Array} u - The U component buffer.
   * @param {number} uo - The byte offset of the edge in the U buffer.
   * @param {Uint8Array} v - The V component buffer.
   * @param {number} vo - The byte offset of the edge in the V buffer.
   * @param {number} stride - Stride value.
   * @param {number} thresh - Threshold value.
   * @param {number} iThreshold - Inner threshold value.
   * @param {number} hevThreshold - HEV threshold value.
   */
  public vFilter8i(
    u: Uint8Array,
    uo: number,
    v: Uint8Array,
    vo: number,
    stride: number,
    thresh: number,
    iThreshold: number,
    hevThreshold: number
  ) {
    this.filterLoop24(
      u,
      uo + 4 * stride,
      stride,
      1,
      8,
      thresh,
      iThreshold,
      hevThreshold
    );
    this.filterLoop24(
      v,
      vo + 4 * stride,
      stride,
      1,
      8,
      thresh,
      iThreshold,
      hevThreshold
    );
  }

  /**
   * Applies an 8-pixel wide horizontal filter on inner edges for chroma filtering.
   * @param {Uint8Array} u - The U component buffer.
   * @param {number} uo - The byte offset of the edge in the U buffer.
   * @param {Uint8Array} v - The V component buffer.
   * @param {number} vo - The byte offset of the edge in the V buffer.
   * @param {number} stride - Stride value.
   * @param {number} thresh - Threshold value.
   * @param {number} iThreshold - Inner threshold value.
   * @param {number} hevThreshold - HEV threshold value.
   */
  public hFilter8i(
    u: Uint8Array,
    uo: number,
    v: Uint8Array,
    vo: number,
    stride: number,
    thresh: number,
    iThreshold: number,
    hevThreshold: number
  ) {
    this.filterLoop24(
      u,
      uo + 4,
      1,
      stride,
      8,
      thresh,
      iThreshold,
      hevThreshold
    );
    this.filterLoop24(
      v,
      vo + 4,
      1,
      stride,
      8,
      thresh,
      iThreshold,
      hevThreshold
    );
  }

  /**
   * The tables, as fields to avoid the lazy initialization check of statics.
   */
  private readonly _abs0: Uint8Array = VP8Filter.abs0;
  private readonly _abs1: Uint8Array = VP8Filter.abs1;
  private readonly _sclip1: Int8Array = VP8Filter.sclip1;
  private readonly _sclip2: Int8Array = VP8Filter.sclip2;
  private readonly _clip1: Uint8Array = VP8Filter.clip1;

  /**
   * Transforms a block of data from the source buffer to the destination buffer.
   * @param {InputBuffer<Int16Array>} src - The source buffer containing Int16Array data.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public transformOne(
    src: InputBuffer<Int16Array>,
    dst: InputBuffer<Uint8Array>
  ): void {
    const s = src.buffer;
    const d = dst.buffer;
    const t = this._transformTmp;
    let si = src.offset;
    let tmp = 0;
    for (let i = 0; i < 4; ++i) {
      // vertical pass
      // [-4096, 4094]
      const a = s[si] + s[si + 8];
      // [-4095, 4095]
      const b = s[si] - s[si + 8];
      // [-3783, 3783]
      const c =
        VP8Filter.mul(s[si + 4], VP8Filter.kC2) -
        VP8Filter.mul(s[si + 12], VP8Filter.kC1);
      // [-3785, 3781]
      const e =
        VP8Filter.mul(s[si + 4], VP8Filter.kC1) +
        VP8Filter.mul(s[si + 12], VP8Filter.kC2);
      // [-7881, 7875]
      t[tmp++] = a + e;
      // [-7878, 7878]
      t[tmp++] = b + c;
      // [-7878, 7878]
      t[tmp++] = b - c;
      // [-7877, 7879]
      t[tmp++] = a - e;
      si++;
    }

    /**
     * Each pass is expanding the dynamic range by ~3.85 (upper bound).
     * The exact value is (2 + (kC1 + kC2) / 65536).
     * After the second pass, maximum interval is [-3794, 3794], assuming
     * an input in [-2048, 2047] interval. We then need to add a dst value
     * in the [0, 255] range.
     * In the worst case scenario, the input to clip8b() can be as large as
     * [-60713, 60968].
     */
    tmp = 0;
    let di = dst.offset;
    for (let i = 0; i < 4; ++i) {
      // horizontal pass
      const dc = t[tmp] + 4;
      const a = dc + t[tmp + 8];
      const b = dc - t[tmp + 8];
      const c =
        VP8Filter.mul(t[tmp + 4], VP8Filter.kC2) -
        VP8Filter.mul(t[tmp + 12], VP8Filter.kC1);
      const e =
        VP8Filter.mul(t[tmp + 4], VP8Filter.kC1) +
        VP8Filter.mul(t[tmp + 12], VP8Filter.kC2);
      VP8Filter.storeAt(d, di, a + e);
      VP8Filter.storeAt(d, di + 1, b + c);
      VP8Filter.storeAt(d, di + 2, b - c);
      VP8Filter.storeAt(d, di + 3, a - e);
      tmp++;
      di += VP8.bps;
    }
  }

  /**
   * Temporary buffer for {@link transformOne}.
   */
  private readonly _transformTmp: Int32Array = new Int32Array(4 * 4);

  /**
   * Transforms a block of data from the source buffer to the destination buffer.
   * Optionally performs the transformation twice.
   * @param {InputBuffer<Int16Array>} src - The source buffer containing Int16Array data.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   * @param {boolean} doTwo - A boolean flag indicating whether to perform the transformation twice.
   */
  public transform(
    src: InputBuffer<Int16Array>,
    dst: InputBuffer<Uint8Array>,
    doTwo: boolean
  ): void {
    this.transformOne(src, dst);
    if (doTwo) {
      this.transformOne(InputBuffer.from(src, 16), InputBuffer.from(dst, 4));
    }
  }

  /**
   * Transforms UV components of a block of data from the source buffer to the destination buffer.
   * @param {InputBuffer<Int16Array>} src - The source buffer containing Int16Array data.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public transformUV(
    src: InputBuffer<Int16Array>,
    dst: InputBuffer<Uint8Array>
  ): void {
    this.transform(src, dst, true);
    this.transform(
      InputBuffer.from(src, 2 * 16),
      InputBuffer.from(dst, 4 * VP8.bps),
      true
    );
  }

  /**
   * Transforms DC components of a block of data from the source buffer to the destination buffer.
   * @param {InputBuffer<Int16Array>} src - The source buffer containing Int16Array data.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public transformDC(
    src: InputBuffer<Int16Array>,
    dst: InputBuffer<Uint8Array>
  ): void {
    const dc = src.get(0) + 4;
    for (let j = 0; j < 4; ++j) {
      for (let i = 0; i < 4; ++i) {
        VP8Filter.store(dst, 0, i, j, dc);
      }
    }
  }

  /**
   * Transforms DC and UV components of a block of data from the source buffer to the destination buffer.
   * @param {InputBuffer<Int16Array>} src - The source buffer containing Int16Array data.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public transformDCUV(
    src: InputBuffer<Int16Array>,
    dst: InputBuffer<Uint8Array>
  ): void {
    if (src.get(0 * 16) !== 0) {
      this.transformDC(src, dst);
    }
    if (src.get(1 * 16) !== 0) {
      this.transformDC(InputBuffer.from(src, 1 * 16), InputBuffer.from(dst, 4));
    }
    if (src.get(2 * 16) !== 0) {
      this.transformDC(
        InputBuffer.from(src, 2 * 16),
        InputBuffer.from(dst, 4 * VP8.bps)
      );
    }
    if (src.get(3 * 16) !== 0) {
      this.transformDC(
        InputBuffer.from(src, 3 * 16),
        InputBuffer.from(dst, 4 * VP8.bps + 4)
      );
    }
  }

  /**
   * Simplified transform when only src.getByte(0), src.getByte(1) and src.getByte(4) are non-zero.
   * @param {InputBuffer<Int16Array>} src - The source buffer containing Int16Array data.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public transformAC3(
    src: InputBuffer<Int16Array>,
    dst: InputBuffer<Uint8Array>
  ): void {
    const a = src.get(0) + 4;
    const c4 = VP8Filter.mul(src.get(4), VP8Filter.kC2);
    const d4 = VP8Filter.mul(src.get(4), VP8Filter.kC1);
    const c1 = VP8Filter.mul(src.get(1), VP8Filter.kC2);
    const d1 = VP8Filter.mul(src.get(1), VP8Filter.kC1);
    VP8Filter.store2(dst, 0, a + d4, d1, c1);
    VP8Filter.store2(dst, 1, a + c4, d1, c1);
    VP8Filter.store2(dst, 2, a - c4, d1, c1);
    VP8Filter.store2(dst, 3, a - d4, d1, c1);
  }

  /**
   * Performs a vertical edge filtering on a 16x16 block.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public static ve16(dst: InputBuffer<Uint8Array>): void {
    // vertical
    for (let j = 0; j < 16; ++j) {
      dst.memcpy(j * VP8.bps, 16, dst, -VP8.bps);
    }
  }

  /**
   * Performs a horizontal edge filtering on a 16x16 block.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public static he16(dst: InputBuffer<Uint8Array>): void {
    // horizontal
    let di = 0;
    for (let j = 16; j > 0; --j) {
      dst.memset(di, 16, dst.get(di - 1));
      di += VP8.bps;
    }
  }

  /**
   * Fills a 16x16 block with a specified value.
   * @param {number} v - The value to fill the block with.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public static put16(v: number, dst: InputBuffer<Uint8Array>): void {
    for (let j = 0; j < 16; ++j) {
      dst.memset(j * VP8.bps, 16, v);
    }
  }

  /**
   * Computes the DC value for a 16x16 block and fills the block with it.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public static dc16(dst: InputBuffer<Uint8Array>): void {
    let dc = 16;
    for (let j = 0; j < 16; ++j) {
      dc += dst.get(-1 + j * VP8.bps) + dst.get(j - VP8.bps);
    }
    VP8Filter.put16(dc >>> 5, dst);
  }

  /**
   * Computes the DC value for a 16x16 block with top samples not available and fills the block with it.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public static dc16NoTop(dst: InputBuffer<Uint8Array>): void {
    let dc = 8;
    for (let j = 0; j < 16; ++j) {
      dc += dst.get(-1 + j * VP8.bps);
    }
    VP8Filter.put16(dc >>> 4, dst);
  }

  /**
   * Computes the DC value for a 16x16 block with left samples not available and fills the block with it.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public static dc16NoLeft(dst: InputBuffer<Uint8Array>): void {
    let dc = 8;
    for (let i = 0; i < 16; ++i) {
      dc += dst.get(i - VP8.bps);
    }
    VP8Filter.put16(dc >>> 4, dst);
  }

  /**
   * Fills a 16x16 block with a default value when no top and left samples are available.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public static dc16NoTopLeft(dst: InputBuffer<Uint8Array>): void {
    VP8Filter.put16(0x80, dst);
  }

  /**
   * Performs a vertical edge filtering on an 8x8 UV block.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public static ve8uv(dst: InputBuffer<Uint8Array>): void {
    for (let j = 0; j < 8; ++j) {
      dst.memcpy(j * VP8.bps, 8, dst, -VP8.bps);
    }
  }

  /**
   * Performs a horizontal edge filtering on an 8x8 UV block.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public static he8uv(dst: InputBuffer<Uint8Array>): void {
    let di = 0;
    for (let j = 0; j < 8; ++j) {
      dst.memset(di, 8, dst.get(di - 1));
      di += VP8.bps;
    }
  }

  /**
   * Helper for chroma-DC predictions. Fills an 8x8 UV block with a specified value.
   * @param {number} value - The value to fill the block with.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public static put8x8uv(value: number, dst: InputBuffer<Uint8Array>): void {
    for (let j = 0; j < 8; ++j) {
      dst.memset(j * VP8.bps, 8, value);
    }
  }

  /**
   * Computes the DC value for an 8x8 UV block and fills the block with it.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public static dc8uv(dst: InputBuffer<Uint8Array>): void {
    let dc0 = 8;
    for (let i = 0; i < 8; ++i) {
      dc0 += dst.get(i - VP8.bps) + dst.get(-1 + i * VP8.bps);
    }
    VP8Filter.put8x8uv(dc0 >>> 4, dst);
  }

  /**
   * Computes the DC value for an 8x8 UV block with no left samples and fills the block with it.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public static dc8uvNoLeft(dst: InputBuffer<Uint8Array>): void {
    let dc0 = 4;
    for (let i = 0; i < 8; ++i) {
      dc0 += dst.get(i - VP8.bps);
    }
    VP8Filter.put8x8uv(dc0 >>> 3, dst);
  }

  /**
   * Computes the DC value for an 8x8 UV block with no top samples and fills the block with it.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public static dc8uvNoTop(dst: InputBuffer<Uint8Array>): void {
    let dc0 = 4;
    for (let i = 0; i < 8; ++i) {
      dc0 += dst.get(-1 + i * VP8.bps);
    }
    VP8Filter.put8x8uv(dc0 >>> 3, dst);
  }

  /**
   * Fills an 8x8 UV block with a default value when no top and left samples are available.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public static dc8uvNoTopLeft(dst: InputBuffer<Uint8Array>): void {
    VP8Filter.put8x8uv(0x80, dst);
  }

  /**
   * Constant value kC1 used in calculations.
   */
  private static readonly kC1 = 20091 + ((1 << 16) >>> 0);

  /**
   * Constant value kC2 used in calculations.
   */
  private static readonly kC2 = 35468;

  /**
   * Array representing the absolute values of integers.
   */
  private static abs0: Uint8Array = new Uint8Array(255 + 255 + 1);

  /**
   * Array representing the absolute values of integers shifted right by 1.
   */
  private static abs1: Uint8Array = new Uint8Array(255 + 255 + 1);

  /**
   * Array that clips values in the range [-1020, 1020] to [-128, 127].
   */
  private static sclip1: Int8Array = new Int8Array(1020 + 1020 + 1);

  /**
   * Array that clips values in the range [-112, 112] to [-16, 15].
   */
  private static sclip2: Int8Array = new Int8Array(112 + 112 + 1);

  /**
   * Array that clips values in the range [-255, 510] to [0, 255].
   */
  private static clip1: Uint8Array = new Uint8Array(255 + 510 + 1);

  /**
   * Flag indicating whether the tables have been initialized.
   */
  private static tablesInitialized: boolean = false;

  /**
   * Array of prediction functions for Luma 4x4 blocks.
   */
  public static readonly predLuma4 = [
    this.dc4.bind(this),
    this.tm4.bind(this),
    this.ve4.bind(this),
    this.he4.bind(this),
    this.rd4.bind(this),
    this.vr4.bind(this),
    this.ld4.bind(this),
    this.vl4.bind(this),
    this.hd4.bind(this),
    this.hu4.bind(this),
  ];

  /**
   * Array of prediction functions for Luma 16x16 blocks.
   */
  public static readonly predLuma16 = [
    this.dc16.bind(this),
    this.tm16.bind(this),
    this.ve16.bind(this),
    this.he16.bind(this),
    this.dc16NoTop.bind(this),
    this.dc16NoLeft.bind(this),
    this.dc16NoTopLeft.bind(this),
  ];

  /**
   * Array of prediction functions for Chroma 8x8 blocks.
   */
  public static readonly predChroma8 = [
    this.dc8uv.bind(this),
    this.tm8uv.bind(this),
    this.ve8uv.bind(this),
    this.he8uv.bind(this),
    this.dc8uvNoTop.bind(this),
    this.dc8uvNoLeft.bind(this),
    this.dc8uvNoTopLeft.bind(this),
  ];
}
