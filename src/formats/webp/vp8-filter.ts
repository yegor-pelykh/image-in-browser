/**
 * eslint-disable no-implicit-coercion
 *
 * @format
 */

/** @format */

import { BitUtils } from '../../common/bit-utils';
import { InputBuffer } from '../../common/input-buffer';
import { VP8 } from './vp8';

export class VP8Filter {
  constructor() {
    VP8Filter.initTables();
  }

  private static mul(a: number, b: number): number {
    const c = a * b;
    return BitUtils.sshR(c, 16);
  }

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

  private static clip8b(v: number): number {
    return (v & -256) === 0 ? v : v < 0 ? 0 : 255;
  }

  private static avg3(a: number, b: number, c: number): number {
    return BitUtils.sshR(a + 2 * b + c + 2, 2);
  }

  private static avg2(a: number, b: number): number {
    return BitUtils.sshR(a + b + 1, 1);
  }

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

  private static tm4(dst: InputBuffer<Uint8Array>): void {
    VP8Filter.trueMotion(dst, 4);
  }

  private static tm8uv(dst: InputBuffer<Uint8Array>): void {
    VP8Filter.trueMotion(dst, 8);
  }

  private static tm16(dst: InputBuffer<Uint8Array>): void {
    VP8Filter.trueMotion(dst, 16);
  }

  private static dst(x: number, y: number): number {
    return x + y * VP8.bps;
  }

  /**
   * Down-right
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
   * Down-Left
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
   * Vertical-Right
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
   * Vertical-Left
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
   * Horizontal-Up
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
   * Horizontal-Down
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
   * 4 pixels in, 2 pixels out
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
   * 4 pixels in, 4 pixels out
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
   * 6 pixels in, 6 pixels out
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
   * on macroblock edges
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
   * on three inner edges
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
   * 8-pixels wide variant, for chroma filtering
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
   * Simplified transform when only src.getByte(0), src.getByte(1) and src.getByte(4) are non-zero
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

  public static ve16(dst: InputBuffer<Uint8Array>): void {
    // vertical
    for (let j = 0; j < 16; ++j) {
      dst.memcpy(j * VP8.bps, 16, dst, -VP8.bps);
    }
  }

  public static he16(dst: InputBuffer<Uint8Array>): void {
    // horizontal
    let di = 0;
    for (let j = 16; j > 0; --j) {
      dst.memset(di, 16, dst.get(di - 1));
      di += VP8.bps;
    }
  }

  public static put16(v: number, dst: InputBuffer<Uint8Array>): void {
    for (let j = 0; j < 16; ++j) {
      dst.memset(j * VP8.bps, 16, v);
    }
  }

  public static dc16(dst: InputBuffer<Uint8Array>): void {
    let dc = 16;
    for (let j = 0; j < 16; ++j) {
      dc += dst.get(-1 + j * VP8.bps) + dst.get(j - VP8.bps);
    }
    VP8Filter.put16(dc >>> 5, dst);
  }

  /**
   * DC with top samples not available
   */
  public static dc16NoTop(dst: InputBuffer<Uint8Array>): void {
    let dc = 8;
    for (let j = 0; j < 16; ++j) {
      dc += dst.get(-1 + j * VP8.bps);
    }
    VP8Filter.put16(dc >>> 4, dst);
  }

  /**
   * DC with left samples not available
   */
  public static dc16NoLeft(dst: InputBuffer<Uint8Array>): void {
    let dc = 8;
    for (let i = 0; i < 16; ++i) {
      dc += dst.get(i - VP8.bps);
    }
    VP8Filter.put16(dc >>> 4, dst);
  }

  /**
   * DC with no top and left samples
   */
  public static dc16NoTopLeft(dst: InputBuffer<Uint8Array>): void {
    VP8Filter.put16(0x80, dst);
  }

  public static ve8uv(dst: InputBuffer<Uint8Array>): void {
    for (let j = 0; j < 8; ++j) {
      dst.memcpy(j * VP8.bps, 8, dst, -VP8.bps);
    }
  }

  public static he8uv(dst: InputBuffer<Uint8Array>): void {
    let di = 0;
    for (let j = 0; j < 8; ++j) {
      dst.memset(di, 8, dst.get(di - 1));
      di += VP8.bps;
    }
  }

  /**
   * helper for chroma-DC predictions
   */
  public static put8x8uv(value: number, dst: InputBuffer<Uint8Array>): void {
    for (let j = 0; j < 8; ++j) {
      dst.memset(j * VP8.bps, 8, value);
    }
  }

  public static dc8uv(dst: InputBuffer<Uint8Array>): void {
    let dc0 = 8;
    for (let i = 0; i < 8; ++i) {
      dc0 += dst.get(i - VP8.bps) + dst.get(-1 + i * VP8.bps);
    }
    VP8Filter.put8x8uv(dc0 >>> 4, dst);
  }

  /**
   * DC with no left samples
   */
  public static dc8uvNoLeft(dst: InputBuffer<Uint8Array>): void {
    let dc0 = 4;
    for (let i = 0; i < 8; ++i) {
      dc0 += dst.get(i - VP8.bps);
    }
    VP8Filter.put8x8uv(dc0 >>> 3, dst);
  }

  /**
   * DC with no top samples
   */
  public static dc8uvNoTop(dst: InputBuffer<Uint8Array>): void {
    let dc0 = 4;
    for (let i = 0; i < 8; ++i) {
      dc0 += dst.get(-1 + i * VP8.bps);
    }
    VP8Filter.put8x8uv(dc0 >>> 3, dst);
  }

  /**
   * DC with nothing
   */
  public static dc8uvNoTopLeft(dst: InputBuffer<Uint8Array>): void {
    VP8Filter.put8x8uv(0x80, dst);
  }

  private static readonly kC1 = 20091 + ((1 << 16) >>> 0);
  private static readonly kC2 = 35468;

  /**
   * abs(i)
   */
  private static abs0: Uint8Array = new Uint8Array(255 + 255 + 1);

  /**
   * abs(i)>>1
   */
  private static abs1: Uint8Array = new Uint8Array(255 + 255 + 1);

  /**
   * clips [-1020, 1020] to [-128, 127]
   */
  private static sclip1: Int8Array = new Int8Array(1020 + 1020 + 1);

  /**
   * clips [-112, 112] to [-16, 15]
   */
  private static sclip2: Int8Array = new Int8Array(112 + 112 + 1);

  /**
   * clips [-255,510] to [0,255]
   */
  private static clip1: Uint8Array = new Uint8Array(255 + 510 + 1);

  private static tablesInitialized: boolean = false;

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

  public static readonly predLuma16 = [
    this.dc16,
    this.tm16,
    this.ve16,
    this.he16,
    this.dc16NoTop,
    this.dc16NoLeft,
    this.dc16NoTopLeft,
  ];

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
