/** @format */

import { Format } from '../color/format.js';
import { MathUtils } from '../common/math-utils.js';
import { MemoryImage } from '../image/image.js';
import { Interpolation } from '../common/interpolation.js';
import { bytesPerPixel } from './pixel-bytes.js';

/**
 * Fast paths for copyResize that work on the image bytes, giving the same
 * result as its per-pixel code. **frame** is resized to the w x h region at
 * (x1, y1) of **dst**, with source pixel (x * dx, y * dy) for destination
 * pixel (x, y). Returns false if the image format isn't supported.
 * @param {MemoryImage} frame - The source frame.
 * @param {MemoryImage} dst - The destination image.
 * @param {Interpolation} interpolation - The interpolation method.
 * @param {number} x1 - The X offset in the destination.
 * @param {number} y1 - The Y offset in the destination.
 * @param {number} w - The width of the destination region.
 * @param {number} h - The height of the destination region.
 * @param {number} dx - The source X step per destination X.
 * @param {number} dy - The source Y step per destination Y.
 * @param {Int32Array} scaleX - The source X for each destination X.
 * @param {Int32Array} scaleY - The source Y for each destination Y.
 * @returns {boolean} True if a byte fast path was used.
 */
export function resizeBytes(
  frame: MemoryImage,
  dst: MemoryImage,
  interpolation: Interpolation,
  x1: number,
  y1: number,
  w: number,
  h: number,
  dx: number,
  dy: number,
  scaleX: Int32Array,
  scaleY: Int32Array
): boolean {
  if (interpolation === Interpolation.nearest) {
    const k = bytesPerPixel(frame);
    if (k === 0 || bytesPerPixel(dst) !== k) {
      return false;
    }
    resizeNearest(
      frame.toUint8Array(),
      frame.data!.rowStride,
      dst.toUint8Array(),
      dst.data!.rowStride,
      k,
      x1,
      y1,
      w,
      h,
      scaleX,
      scaleY
    );
    return true;
  }

  // The interpolating paths compute each channel independently, so for uint8
  // images they can work on the bytes.
  if (
    frame.format !== Format.uint8 ||
    frame.hasPalette ||
    dst.format !== Format.uint8 ||
    dst.data!.numChannels !== frame.data!.numChannels
  ) {
    return false;
  }
  const src = frame.toUint8Array();
  const srcStride = frame.data!.rowStride;
  const out = dst.toUint8Array();
  const dstStride = dst.data!.rowStride;
  const nc = frame.data!.numChannels;
  const sw = frame.width;
  const sh = frame.height;

  switch (interpolation) {
    case Interpolation.linear:
      resizeLinear(
        src,
        srcStride,
        sw,
        sh,
        out,
        dstStride,
        nc,
        x1,
        y1,
        w,
        h,
        dx,
        dy
      );
      return true;
    case Interpolation.average:
      resizeAverage(
        src,
        srcStride,
        out,
        dstStride,
        nc,
        x1,
        y1,
        w,
        h,
        dx,
        dy
      );
      return true;
    case Interpolation.cubic:
      resizeCubic(
        src,
        srcStride,
        sw,
        sh,
        out,
        dstStride,
        nc,
        x1,
        y1,
        w,
        h,
        dx,
        dy
      );
      return true;
    default:
      return false;
  }
}

/**
 * Resizes using nearest-neighbor sampling.
 * @param {Uint8Array} src - The source data.
 * @param {number} srcStride - The source row stride.
 * @param {Uint8Array} out - The destination data.
 * @param {number} dstStride - The destination row stride.
 * @param {number} k - The number of bytes per pixel.
 * @param {number} x1 - The X offset in the destination.
 * @param {number} y1 - The Y offset in the destination.
 * @param {number} w - The width of the destination region.
 * @param {number} h - The height of the destination region.
 * @param {Int32Array} scaleX - The source X for each destination X.
 * @param {Int32Array} scaleY - The source Y for each destination Y.
 */
function resizeNearest(
  src: Uint8Array,
  srcStride: number,
  out: Uint8Array,
  dstStride: number,
  k: number,
  x1: number,
  y1: number,
  w: number,
  h: number,
  scaleX: Int32Array,
  scaleY: Int32Array
): void {
  const srcX = new Int32Array(w);
  for (let x = 0; x < w; ++x) {
    srcX[x] = scaleX[x] * k;
  }
  for (let y = 0; y < h; ++y) {
    const srcRow = scaleY[y] * srcStride;
    let di = (y1 + y) * dstStride + x1 * k;
    for (let x = 0; x < w; ++x) {
      const si = srcRow + srcX[x];
      for (let c = 0; c < k; ++c) {
        out[di++] = src[si + c];
      }
    }
  }
}

/**
 * Resizes using linear interpolation.
 * @param {Uint8Array} src - The source data.
 * @param {number} srcStride - The source row stride.
 * @param {number} sw - The source width.
 * @param {number} sh - The source height.
 * @param {Uint8Array} out - The destination data.
 * @param {number} dstStride - The destination row stride.
 * @param {number} nc - The number of channels.
 * @param {number} x1 - The X offset in the destination.
 * @param {number} y1 - The Y offset in the destination.
 * @param {number} w - The width of the destination region.
 * @param {number} h - The height of the destination region.
 * @param {number} dx - The source X step per destination X.
 * @param {number} dy - The source Y step per destination Y.
 */
function resizeLinear(
  src: Uint8Array,
  srcStride: number,
  sw: number,
  sh: number,
  out: Uint8Array,
  dstStride: number,
  nc: number,
  x1: number,
  y1: number,
  w: number,
  h: number,
  dx: number,
  dy: number
): void {
  const maxX = sw - 1;
  const maxY = sh - 1;
  const ixs = new Int32Array(w);
  const nxs = new Int32Array(w);
  const kxs = new Float64Array(w);
  for (let x = 0; x < w; ++x) {
    const fx = x * dx;
    const ix = Math.trunc(fx);
    kxs[x] = fx - ix;
    ixs[x] = ix * nc;
    nxs[x] = MathUtils.clamp(ix + 1, 0, maxX) * nc;
  }
  for (let y = 0; y < h; ++y) {
    const fy = y * dy;
    const iy = Math.trunc(fy);
    const ky = fy - iy;
    const ny = MathUtils.clamp(iy + 1, 0, maxY);
    linearRow(
      src,
      iy * srcStride,
      ny * srcStride,
      out,
      (y1 + y) * dstStride + x1 * nc,
      nc,
      w,
      ixs,
      nxs,
      kxs,
      ky
    );
  }
}

/**
 * Interpolates one linear row.
 * @param {Uint8Array} src - The source data.
 * @param {number} row0 - The byte offset of the first source row.
 * @param {number} row1 - The byte offset of the second source row.
 * @param {Uint8Array} out - The destination data.
 * @param {number} di - The destination byte offset.
 * @param {number} nc - The number of channels.
 * @param {number} w - The width of the destination region.
 * @param {Int32Array} ixs - The source X byte offsets.
 * @param {Int32Array} nxs - The next source X byte offsets.
 * @param {Float64Array} kxs - The X fractions.
 * @param {number} ky - The Y fraction.
 */
function linearRow(
  src: Uint8Array,
  row0: number,
  row1: number,
  out: Uint8Array,
  di: number,
  nc: number,
  w: number,
  ixs: Int32Array,
  nxs: Int32Array,
  kxs: Float64Array,
  ky: number
): void {
  for (let x = 0; x < w; ++x) {
    const i0 = row0 + ixs[x];
    const n0 = row0 + nxs[x];
    const i1 = row1 + ixs[x];
    const n1 = row1 + nxs[x];
    const kx = kxs[x];
    for (let c = 0; c < nc; ++c) {
      const icc = src[i0 + c];
      const inc = src[n0 + c];
      const icn = src[i1 + c];
      const inn = src[n1 + c];
      out[di++] = Math.trunc(
        icc + kx * (inc - icc + ky * (icc + inn - icn - inc)) + ky * (icn - icc)
      );
    }
  }
}

/**
 * Resizes by averaging the source pixels of each destination pixel.
 * @param {Uint8Array} src - The source data.
 * @param {number} srcStride - The source row stride.
 * @param {Uint8Array} out - The destination data.
 * @param {number} dstStride - The destination row stride.
 * @param {number} nc - The number of channels.
 * @param {number} x1 - The X offset in the destination.
 * @param {number} y1 - The Y offset in the destination.
 * @param {number} w - The width of the destination region.
 * @param {number} h - The height of the destination region.
 * @param {number} dx - The source X step per destination X.
 * @param {number} dy - The source Y step per destination Y.
 */
function resizeAverage(
  src: Uint8Array,
  srcStride: number,
  out: Uint8Array,
  dstStride: number,
  nc: number,
  x1: number,
  y1: number,
  w: number,
  h: number,
  dx: number,
  dy: number
): void {
  const ax1s = new Int32Array(w);
  const ax2s = new Int32Array(w);
  for (let x = 0; x < w; ++x) {
    const ax1 = Math.trunc(x * dx);
    let ax2 = Math.trunc((x + 1) * dx);
    if (ax2 === ax1) {
      ax2++;
    }
    ax1s[x] = ax1;
    ax2s[x] = ax2;
  }
  const sums = new Int32Array(nc);
  for (let y = 0; y < h; ++y) {
    const ay1 = Math.trunc(y * dy);
    let ay2 = Math.trunc((y + 1) * dy);
    if (ay2 === ay1) {
      ay2++;
    }
    let di = (y1 + y) * dstStride + x1 * nc;
    for (let x = 0; x < w; ++x) {
      const ax1 = ax1s[x];
      const ax2 = ax2s[x];
      sums.fill(0, 0, nc);
      for (let sy = ay1; sy < ay2; ++sy) {
        sumRow(src, sy * srcStride + ax1 * nc, (ax2 - ax1) * nc, nc, sums);
      }
      const inv = 1.0 / ((ay2 - ay1) * (ax2 - ax1));
      for (let c = 0; c < nc; ++c) {
        out[di++] = Math.trunc(sums[c] * inv);
      }
    }
  }
}

/**
 * Adds a row of source pixels to the channel sums.
 * @param {Uint8Array} src - The source data.
 * @param {number} si - The source byte offset.
 * @param {number} n - The number of bytes to sum.
 * @param {number} nc - The number of channels.
 * @param {Int32Array} sums - The channel sums.
 */
function sumRow(
  src: Uint8Array,
  si: number,
  n: number,
  nc: number,
  sums: Int32Array
): void {
  for (let i = 0; i < n; i += nc) {
    for (let c = 0; c < nc; ++c) {
      sums[c] += src[si + i + c];
    }
  }
}

/**
 * Resizes using cubic interpolation. Matches Image.getPixelCubic: a tap whose
 * row or column is outside the image uses the center pixel.
 * @param {Uint8Array} src - The source data.
 * @param {number} srcStride - The source row stride.
 * @param {number} sw - The source width.
 * @param {number} sh - The source height.
 * @param {Uint8Array} out - The destination data.
 * @param {number} dstStride - The destination row stride.
 * @param {number} nc - The number of channels.
 * @param {number} x1 - The X offset in the destination.
 * @param {number} y1 - The Y offset in the destination.
 * @param {number} w - The width of the destination region.
 * @param {number} h - The height of the destination region.
 * @param {number} dx - The source X step per destination X.
 * @param {number} dy - The source Y step per destination Y.
 */
function resizeCubic(
  src: Uint8Array,
  srcStride: number,
  sw: number,
  sh: number,
  out: Uint8Array,
  dstStride: number,
  nc: number,
  x1: number,
  y1: number,
  w: number,
  h: number,
  dx: number,
  dy: number
): void {
  // For each destination column, the source column offsets of the four taps
  // (-1 where outside the image) and the fraction.
  const cols = new Int32Array(w * 4);
  const fxs = new Float64Array(w);
  for (let x = 0; x < w; ++x) {
    const fx = x * dx;
    const ix = Math.trunc(fx);
    fxs[x] = fx - ix;
    for (let t = 0; t < 4; ++t) {
      const cx = ix + t - 1;
      cols[x * 4 + t] = cx < 0 || cx >= sw ? -1 : cx * nc;
    }
  }
  const rows = new Int32Array(4);
  const taps = new Int32Array(16);
  const p = new Float64Array(4);
  for (let y = 0; y < h; ++y) {
    const fy = y * dy;
    const iy = Math.trunc(fy);
    const ky = fy - iy;
    for (let t = 0; t < 4; ++t) {
      const cy = iy + t - 1;
      rows[t] = cy < 0 || cy >= sh ? -1 : cy * srcStride;
    }
    let di = (y1 + y) * dstStride + x1 * nc;
    for (let x = 0; x < w; ++x) {
      const center = rows[1] + cols[x * 4 + 1];
      for (let r = 0; r < 4; ++r) {
        const row = rows[r];
        for (let t = 0; t < 4; ++t) {
          const col = cols[x * 4 + t];
          taps[r * 4 + t] = row < 0 || col < 0 ? center : row + col;
        }
      }
      const kx = fxs[x];
      for (let c = 0; c < nc; ++c) {
        for (let r = 0; r < 4; ++r) {
          const o = r * 4;
          p[r] = cubic(
            kx,
            src[taps[o] + c],
            src[taps[o + 1] + c],
            src[taps[o + 2] + c],
            src[taps[o + 3] + c]
          );
        }
        const v = cubic(ky, p[0], p[1], p[2], p[3]);
        out[di++] = v < 0 ? 0 : v > 255 ? 255 : Math.trunc(v);
      }
    }
  }
}

/**
 * Cubic interpolation of four points at **dx**.
 * @param {number} dx - The delta value for interpolation.
 * @param {number} ipp - The intensity of the previous previous point.
 * @param {number} icp - The intensity of the current previous point.
 * @param {number} inp - The intensity of the next point.
 * @param {number} iap - The intensity of the after next point.
 * @returns {number} The interpolated intensity.
 */
function cubic(
  dx: number,
  ipp: number,
  icp: number,
  inp: number,
  iap: number
): number {
  return (
    icp +
    0.5 *
      (dx * (-ipp + inp) +
        dx * dx * (2 * ipp - 5 * icp + 4 * inp - iap) +
        dx * dx * dx * (-ipp + 3 * icp - 3 * inp + iap))
  );
}
