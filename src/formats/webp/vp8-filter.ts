/**
 * @format
 */

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
   * Multiplies two numbers and shifts the result right by 16 bits.
   * @param {number} a - The first number.
   * @param {number} b - The second number.
   * @returns {number} The result of the multiplication shifted right by 16 bits.
   */
  private static mul(a: number, b: number): number {
    const c = a * b;
    return BitUtils.sshR(c, 16);
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
    dst.set(
      di + x + y * VP8.bps,
      VP8Filter.clip8b(dst.get(di + x + y * VP8.bps) + BitUtils.sshR(v, 3))
    );
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
    const i = dst.get(-1 + 0 * VP8.bps);
    const j = dst.get(-1 + Number(VP8.bps));
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
    const j = dst.get(-1 + Number(VP8.bps));
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
    const j = dst.get(-1 + Number(VP8.bps));
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
    const j = dst.get(-1 + Number(VP8.bps));
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
   * @param {InputBuffer<Uint8Array>} p - The input buffer containing the data to be filtered.
   * @param {number} hstride - The horizontal stride, which determines the step size in the horizontal direction.
   * @param {number} vstride - The vertical stride, which determines the step size in the vertical direction.
   * @param {number} size - The number of elements to process in the buffer.
   * @param {number} thresh - The threshold value used to determine if filtering is needed.
   * @param {number} ithresh - The inner threshold value used in the filtering decision process.
   * @param {number} hevThresh - The high edge variance threshold used to decide between different filtering methods.
   */
  private filterLoop26(
    p: InputBuffer<Uint8Array>,
    hstride: number,
    vstride: number,
    size: number,
    thresh: number,
    ithresh: number,
    hevThresh: number
  ): void {
    let _size = size;
    const p2 = InputBuffer.from(p);
    while (_size-- > 0) {
      if (this.needsFilter2(p2, hstride, thresh, ithresh)) {
        if (this.hev(p2, hstride, hevThresh)) {
          this.doFilter2(p2, hstride);
        } else {
          this.doFilter6(p2, hstride);
        }
      }
      p2.offset += vstride;
    }
  }

  /**
   * Filters a loop with specific parameters.
   * @param {InputBuffer<Uint8Array>} p - The input buffer.
   * @param {number} hstride - Horizontal stride.
   * @param {number} vstride - Vertical stride.
   * @param {number} size - Size of the loop.
   * @param {number} thresh - Threshold value.
   * @param {number} ithresh - Inner threshold value.
   * @param {number} hevThresh - HEV threshold value.
   */
  private filterLoop24(
    p: InputBuffer<Uint8Array>,
    hstride: number,
    vstride: number,
    size: number,
    thresh: number,
    ithresh: number,
    hevThresh: number
  ): void {
    let _size = size;
    const p2 = InputBuffer.from(p);
    while (_size-- > 0) {
      if (this.needsFilter2(p2, hstride, thresh, ithresh)) {
        if (this.hev(p2, hstride, hevThresh)) {
          this.doFilter2(p2, hstride);
        } else {
          this.doFilter4(p2, hstride);
        }
      }
      p2.offset += vstride;
    }
  }

  /**
   * Applies a 2-pixel filter.
   * @param {InputBuffer<Uint8Array>} p - The input buffer.
   * @param {number} step - Step size.
   */
  private doFilter2(p: InputBuffer<Uint8Array>, step: number): void {
    const p1 = p.get(-2 * step);
    const p0 = p.get(-step);
    const q0 = p.get(0);
    const q1 = p.get(step);
    const a = 3 * (q0 - p0) + VP8Filter.sclip1[1020 + p1 - q1];
    const a1 = VP8Filter.sclip2[112 + BitUtils.sshR(a + 4, 3)];
    const a2 = VP8Filter.sclip2[112 + BitUtils.sshR(a + 3, 3)];
    p.set(-step, VP8Filter.clip1[255 + p0 + a2]);
    p.set(0, VP8Filter.clip1[255 + q0 - a1]);
  }

  /**
   * Applies a 4-pixel filter.
   * @param {InputBuffer<Uint8Array>} p - The input buffer.
   * @param {number} step - Step size.
   */
  private doFilter4(p: InputBuffer<Uint8Array>, step: number): void {
    const p1 = p.get(-2 * step);
    const p0 = p.get(-step);
    const q0 = p.get(0);
    const q1 = p.get(step);
    const a = 3 * (q0 - p0);
    const a1 = VP8Filter.sclip2[112 + BitUtils.sshR(a + 4, 3)];
    const a2 = VP8Filter.sclip2[112 + BitUtils.sshR(a + 3, 3)];
    const a3 = BitUtils.sshR(a1 + 1, 1);
    p.set(-2 * step, VP8Filter.clip1[255 + p1 + a3]);
    p.set(-step, VP8Filter.clip1[255 + p0 + a2]);
    p.set(0, VP8Filter.clip1[255 + q0 - a1]);
    p.set(step, VP8Filter.clip1[255 + q1 - a3]);
  }

  /**
   * Applies a 6-pixel filter.
   * @param {InputBuffer<Uint8Array>} p - The input buffer.
   * @param {number} step - Step size.
   */
  private doFilter6(p: InputBuffer<Uint8Array>, step: number): void {
    const p2 = p.get(-3 * step);
    const p1 = p.get(-2 * step);
    const p0 = p.get(-step);
    const q0 = p.get(0);
    const q1 = p.get(step);
    const q2 = p.get(2 * step);
    const a =
      VP8Filter.sclip1[1020 + 3 * (q0 - p0) + VP8Filter.sclip1[1020 + p1 - q1]];
    // eq. to ((3 * a + 7) * 9) >>> 7
    const a1 = BitUtils.sshR(27 * a + 63, 7);
    // eq. to ((2 * a + 7) * 9) >>> 7
    const a2 = BitUtils.sshR(18 * a + 63, 7);
    // eq. to ((1 * a + 7) * 9) >>> 7
    const a3 = BitUtils.sshR(9 * a + 63, 7);
    p.set(-3 * step, VP8Filter.clip1[255 + p2 + a3]);
    p.set(-2 * step, VP8Filter.clip1[255 + p1 + a2]);
    p.set(-step, VP8Filter.clip1[255 + p0 + a1]);
    p.set(0, VP8Filter.clip1[255 + q0 - a1]);
    p.set(step, VP8Filter.clip1[255 + q1 - a2]);
    p.set(2 * step, VP8Filter.clip1[255 + q2 - a3]);
  }

  /**
   * Determines if high edge variance (HEV) is present.
   * @param {InputBuffer<Uint8Array>} p - The input buffer.
   * @param {number} step - Step size.
   * @param {number} thresh - Threshold value.
   * @returns {boolean} True if HEV is present, false otherwise.
   */
  private hev(
    p: InputBuffer<Uint8Array>,
    step: number,
    thresh: number
  ): boolean {
    const p1 = p.get(-2 * step);
    const p0 = p.get(-step);
    const q0 = p.get(0);
    const q1 = p.get(step);
    return (
      VP8Filter.abs0[255 + p1 - p0] > thresh ||
      VP8Filter.abs0[255 + q1 - q0] > thresh
    );
  }

  /**
   * Determines if filtering is needed.
   * @param {InputBuffer<Uint8Array>} p - The input buffer.
   * @param {number} step - Step size.
   * @param {number} thresh - Threshold value.
   * @returns {boolean} True if filtering is needed, false otherwise.
   */
  private needsFilter(
    p: InputBuffer<Uint8Array>,
    step: number,
    thresh: number
  ): boolean {
    const p1 = p.get(-2 * step);
    const p0 = p.get(-step);
    const q0 = p.get(0);
    const q1 = p.get(step);
    return (
      2 * VP8Filter.abs0[255 + p0 - q0] + VP8Filter.abs1[255 + p1 - q1] <=
      thresh
    );
  }

  /**
   * Determines if filtering is needed with additional parameters.
   * @param {InputBuffer<Uint8Array>} p - The input buffer.
   * @param {number} step - Step size.
   * @param {number} t - Threshold value.
   * @param {number} it - Inner threshold value.
   * @returns {boolean} True if filtering is needed, false otherwise.
   */
  private needsFilter2(
    p: InputBuffer<Uint8Array>,
    step: number,
    t: number,
    it: number
  ): boolean {
    const p3 = p.get(-4 * step);
    const p2 = p.get(-3 * step);
    const p1 = p.get(-2 * step);
    const p0 = p.get(-step);
    const q0 = p.get(0);
    const q1 = p.get(step);
    const q2 = p.get(2 * step);
    const q3 = p.get(3 * step);
    if (2 * VP8Filter.abs0[255 + p0 - q0] + VP8Filter.abs1[255 + p1 - q1] > t) {
      return false;
    }

    return (
      VP8Filter.abs0[255 + p3 - p2] <= it &&
      VP8Filter.abs0[255 + p2 - p1] <= it &&
      VP8Filter.abs0[255 + p1 - p0] <= it &&
      VP8Filter.abs0[255 + q3 - q2] <= it &&
      VP8Filter.abs0[255 + q2 - q1] <= it &&
      VP8Filter.abs0[255 + q1 - q0] <= it
    );
  }

  /**
   * Applies a simple vertical filter on 16 pixels.
   * @param {InputBuffer<Uint8Array>} p - The input buffer.
   * @param {number} stride - Stride value.
   * @param {number} threshold - Threshold value.
   */
  public simpleVFilter16(
    p: InputBuffer<Uint8Array>,
    stride: number,
    threshold: number
  ): void {
    const p2 = InputBuffer.from(p);
    for (let i = 0; i < 16; ++i) {
      p2.offset = p.offset + i;
      if (this.needsFilter(p2, stride, threshold)) {
        this.doFilter2(p2, stride);
      }
    }
  }

  /**
   * Applies a simple horizontal filter on 16 pixels.
   * @param {InputBuffer<Uint8Array>} p - The input buffer.
   * @param {number} stride - Stride value.
   * @param {number} threshold - Threshold value.
   */
  public simpleHFilter16(
    p: InputBuffer<Uint8Array>,
    stride: number,
    threshold: number
  ): void {
    const p2 = InputBuffer.from(p);
    for (let i = 0; i < 16; ++i) {
      p2.offset = p.offset + i * stride;
      if (this.needsFilter(p2, 1, threshold)) {
        this.doFilter2(p2, 1);
      }
    }
  }

  /**
   * Applies a simple vertical filter on 16 pixels with inner edges.
   * @param {InputBuffer<Uint8Array>} p - The input buffer.
   * @param {number} stride - Stride value.
   * @param {number} threshold - Threshold value.
   */
  public simpleVFilter16i(
    p: InputBuffer<Uint8Array>,
    stride: number,
    threshold: number
  ): void {
    const p2 = InputBuffer.from(p);
    for (let k = 3; k > 0; --k) {
      p2.offset += 4 * stride;
      this.simpleVFilter16(p2, stride, threshold);
    }
  }

  /**
   * Applies a simple horizontal filter on 16 pixels with inner edges.
   * @param {InputBuffer<Uint8Array>} p - The input buffer.
   * @param {number} stride - Stride value.
   * @param {number} threshold - Threshold value.
   */
  public simpleHFilter16i(
    p: InputBuffer<Uint8Array>,
    stride: number,
    threshold: number
  ): void {
    const p2 = InputBuffer.from(p);
    for (let k = 3; k > 0; --k) {
      p2.offset += 4;
      this.simpleHFilter16(p2, stride, threshold);
    }
  }

  /**
   * Applies a vertical filter on macroblock edges.
   * @param {InputBuffer<Uint8Array>} p - The input buffer.
   * @param {number} stride - Stride value.
   * @param {number} thresh - Threshold value.
   * @param {number} iThreshold - Inner threshold value.
   * @param {number} hevThreshold - HEV threshold value.
   */
  public vFilter16(
    p: InputBuffer<Uint8Array>,
    stride: number,
    thresh: number,
    iThreshold: number,
    hevThreshold: number
  ) {
    this.filterLoop26(p, stride, 1, 16, thresh, iThreshold, hevThreshold);
  }

  /**
   * Applies a horizontal filter on macroblock edges.
   * @param {InputBuffer<Uint8Array>} p - The input buffer.
   * @param {number} stride - Stride value.
   * @param {number} thresh - Threshold value.
   * @param {number} iThreshold - Inner threshold value.
   * @param {number} hevThreshold - HEV threshold value.
   */
  public hFilter16(
    p: InputBuffer<Uint8Array>,
    stride: number,
    thresh: number,
    iThreshold: number,
    hevThreshold: number
  ) {
    this.filterLoop26(p, 1, stride, 16, thresh, iThreshold, hevThreshold);
  }

  /**
   * Applies a vertical filter on three inner edges.
   * @param {InputBuffer<Uint8Array>} p - The input buffer.
   * @param {number} stride - Stride value.
   * @param {number} thresh - Threshold value.
   * @param {number} iThreshold - Inner threshold value.
   * @param {number} hevThreshold - HEV threshold value.
   */
  public vFilter16i(
    p: InputBuffer<Uint8Array>,
    stride: number,
    thresh: number,
    iThreshold: number,
    hevThreshold: number
  ): void {
    const p2 = InputBuffer.from(p);
    for (let k = 3; k > 0; --k) {
      p2.offset += 4 * stride;
      this.filterLoop24(p2, stride, 1, 16, thresh, iThreshold, hevThreshold);
    }
  }

  /**
   * Applies a horizontal filter on three inner edges.
   * @param {InputBuffer<Uint8Array>} p - The input buffer.
   * @param {number} stride - Stride value.
   * @param {number} thresh - Threshold value.
   * @param {number} iThreshold - Inner threshold value.
   * @param {number} hevThreshold - HEV threshold value.
   */
  public hFilter16i(
    p: InputBuffer<Uint8Array>,
    stride: number,
    thresh: number,
    iThreshold: number,
    hevThreshold: number
  ): void {
    const p2 = InputBuffer.from(p);
    for (let k = 3; k > 0; --k) {
      p2.offset += 4;
      this.filterLoop24(p2, 1, stride, 16, thresh, iThreshold, hevThreshold);
    }
  }

  /**
   * Applies an 8-pixel wide vertical filter for chroma filtering.
   * @param {InputBuffer<Uint8Array>} u - The U component input buffer.
   * @param {InputBuffer<Uint8Array>} v - The V component input buffer.
   * @param {number} stride - Stride value.
   * @param {number} thresh - Threshold value.
   * @param {number} iThreshold - Inner threshold value.
   * @param {number} hevThreshold - HEV threshold value.
   */
  public vFilter8(
    u: InputBuffer<Uint8Array>,
    v: InputBuffer<Uint8Array>,
    stride: number,
    thresh: number,
    iThreshold: number,
    hevThreshold: number
  ): void {
    this.filterLoop26(u, stride, 1, 8, thresh, iThreshold, hevThreshold);
    this.filterLoop26(v, stride, 1, 8, thresh, iThreshold, hevThreshold);
  }

  /**
   * Applies an 8-pixel wide horizontal filter for chroma filtering.
   * @param {InputBuffer<Uint8Array>} u - The U component input buffer.
   * @param {InputBuffer<Uint8Array>} v - The V component input buffer.
   * @param {number} stride - Stride value.
   * @param {number} thresh - Threshold value.
   * @param {number} iThreshold - Inner threshold value.
   * @param {number} hevThreshold - HEV threshold value.
   */
  public hFilter8(
    u: InputBuffer<Uint8Array>,
    v: InputBuffer<Uint8Array>,
    stride: number,
    thresh: number,
    iThreshold: number,
    hevThreshold: number
  ): void {
    this.filterLoop26(u, 1, stride, 8, thresh, iThreshold, hevThreshold);
    this.filterLoop26(v, 1, stride, 8, thresh, iThreshold, hevThreshold);
  }

  /**
   * Applies an 8-pixel wide vertical filter on inner edges for chroma filtering.
   * @param {InputBuffer<Uint8Array>} u - The U component input buffer.
   * @param {InputBuffer<Uint8Array>} v - The V component input buffer.
   * @param {number} stride - Stride value.
   * @param {number} thresh - Threshold value.
   * @param {number} iThreshold - Inner threshold value.
   * @param {number} hevThreshold - HEV threshold value.
   */
  public vFilter8i(
    u: InputBuffer<Uint8Array>,
    v: InputBuffer<Uint8Array>,
    stride: number,
    thresh: number,
    iThreshold: number,
    hevThreshold: number
  ) {
    const u2 = InputBuffer.from(u, 4 * stride);
    const v2 = InputBuffer.from(v, 4 * stride);
    this.filterLoop24(u2, stride, 1, 8, thresh, iThreshold, hevThreshold);
    this.filterLoop24(v2, stride, 1, 8, thresh, iThreshold, hevThreshold);
  }

  /**
   * Applies an 8-pixel wide horizontal filter on inner edges for chroma filtering.
   * @param {InputBuffer<Uint8Array>} u - The U component input buffer.
   * @param {InputBuffer<Uint8Array>} v - The V component input buffer.
   * @param {number} stride - Stride value.
   * @param {number} thresh - Threshold value.
   * @param {number} iThreshold - Inner threshold value.
   * @param {number} hevThreshold - HEV threshold value.
   */
  public hFilter8i(
    u: InputBuffer<Uint8Array>,
    v: InputBuffer<Uint8Array>,
    stride: number,
    thresh: number,
    iThreshold: number,
    hevThreshold: number
  ) {
    const u2 = InputBuffer.from(u, 4);
    const v2 = InputBuffer.from(v, 4);
    this.filterLoop24(u2, 1, stride, 8, thresh, iThreshold, hevThreshold);
    this.filterLoop24(v2, 1, stride, 8, thresh, iThreshold, hevThreshold);
  }

  /**
   * Transforms a block of data from the source buffer to the destination buffer.
   * @param {InputBuffer<Int16Array>} src - The source buffer containing Int16Array data.
   * @param {InputBuffer<Uint8Array>} dst - The destination buffer to store Uint8Array data.
   */
  public transformOne(
    src: InputBuffer<Int16Array>,
    dst: InputBuffer<Uint8Array>
  ): void {
    const t = new Int32Array(4 * 4);
    let si = 0;
    let di = 0;
    let tmp = 0;
    for (let i = 0; i < 4; ++i) {
      // vertical pass
      // [-4096, 4094]
      const a = src.get(si) + src.get(si + 8);
      // [-4095, 4095]
      const b = src.get(si) - src.get(si + 8);
      // [-3783, 3783]
      const c =
        VP8Filter.mul(src.get(si + 4), VP8Filter.kC2) -
        VP8Filter.mul(src.get(si + 12), VP8Filter.kC1);
      // [-3785, 3781]
      const d =
        VP8Filter.mul(src.get(si + 4), VP8Filter.kC1) +
        VP8Filter.mul(src.get(si + 12), VP8Filter.kC2);
      // [-7881, 7875]
      t[tmp++] = a + d;
      // [-7878, 7878]
      t[tmp++] = b + c;
      // [-7878, 7878]
      t[tmp++] = b - c;
      // [-7877, 7879]
      t[tmp++] = a - d;
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
    for (let i = 0; i < 4; ++i) {
      // horizontal pass
      const dc = t[tmp] + 4;
      const a = dc + t[tmp + 8];
      const b = dc - t[tmp + 8];
      const c =
        VP8Filter.mul(t[tmp + 4], VP8Filter.kC2) -
        VP8Filter.mul(t[tmp + 12], VP8Filter.kC1);
      const d =
        VP8Filter.mul(t[tmp + 4], VP8Filter.kC1) +
        VP8Filter.mul(t[tmp + 12], VP8Filter.kC2);
      VP8Filter.store(dst, di, 0, 0, a + d);
      VP8Filter.store(dst, di, 1, 0, b + c);
      VP8Filter.store(dst, di, 2, 0, b - c);
      VP8Filter.store(dst, di, 3, 0, a - d);
      tmp++;
      di += VP8.bps;
    }
  }

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
    this.dc4,
    this.tm4,
    this.ve4,
    this.he4,
    this.rd4,
    this.vr4,
    this.ld4,
    this.vl4,
    this.hd4,
    this.hu4,
  ];

  /**
   * Array of prediction functions for Luma 16x16 blocks.
   */
  public static readonly predLuma16 = [
    this.dc16,
    this.tm16,
    this.ve16,
    this.he16,
    this.dc16NoTop,
    this.dc16NoLeft,
    this.dc16NoTopLeft,
  ];

  /**
   * Array of prediction functions for Chroma 8x8 blocks.
   */
  public static readonly predChroma8 = [
    this.dc8uv,
    this.tm8uv,
    this.ve8uv,
    this.he8uv,
    this.dc8uvNoTop,
    this.dc8uvNoLeft,
    this.dc8uvNoTopLeft,
  ];
}
