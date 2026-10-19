/** @format */

import { Format } from '../color/format.js';
import { MathUtils } from '../common/math-utils.js';
import { MemoryImage } from '../image/image.js';
import { Interpolation } from '../common/interpolation.js';
import { bytesPerPixel } from './pixel-bytes.js';

/**
 * Whether {@link resizeBytes} supports resizing **frame** with
 * **interpolation**.
 * @param {MemoryImage} frame - The frame to resize.
 * @param {Interpolation} interpolation - The interpolation method.
 * @returns {boolean} True if the frame is supported.
 */
export function canResizeBytes(
  frame: MemoryImage,
  interpolation: Interpolation
): boolean {
  return interpolation === Interpolation.nearest
    ? bytesPerPixel(frame) > 0
    : frame.format === Format.uint8 && !frame.hasPalette;
}

/**
 * The width of **frame** once **orientation** (an EXIF orientation) is
 * applied.
 * @param {MemoryImage} frame - The frame.
 * @param {number} orientation - The EXIF orientation.
 * @returns {number} The oriented width.
 */
export function orientedWidth(frame: MemoryImage, orientation: number): number {
  return orientation >= 5 && orientation <= 8 ? frame.height : frame.width;
}

/**
 * The height of **frame** once **orientation** (an EXIF orientation) is
 * applied.
 * @param {MemoryImage} frame - The frame.
 * @param {number} orientation - The EXIF orientation.
 * @returns {number} The oriented height.
 */
export function orientedHeight(
  frame: MemoryImage,
  orientation: number
): number {
  return orientation >= 5 && orientation <= 8 ? frame.width : frame.height;
}

/**
 * Fast paths for copyResize that work on the image bytes, giving the same
 * result as its per-pixel code. **frame**, with its EXIF **orientation**
 * applied as bakeOrientation does, is resized to the w x h region at (x1, y1)
 * of **dst**, with source pixel (x * dx, y * dy) for destination pixel (x, y).
 * Returns false if the image format isn't supported.
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
 * @param {number} [orientation=1] - The EXIF orientation to apply.
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
  scaleY: Int32Array,
  orientation = 1
): boolean {
  if (!canResizeBytes(frame, interpolation)) {
    return false;
  }
  const src = new OrientedSource(frame, orientation);
  const out = dst.toUint8Array();
  const dstStride = dst.data!.rowStride;

  if (interpolation === Interpolation.nearest) {
    if (bytesPerPixel(dst) !== src.k) {
      return false;
    }
    resizeNearest(src, out, dstStride, x1, y1, w, h, scaleX, scaleY);
    return true;
  }

  // The interpolating paths compute each channel independently, so for uint8
  // images they can work on the bytes.
  if (
    dst.format !== Format.uint8 ||
    dst.data!.numChannels !== frame.data!.numChannels
  ) {
    return false;
  }
  switch (interpolation) {
    case Interpolation.linear:
      resizeLinear(src, out, dstStride, x1, y1, w, h, dx, dy);
      return true;
    case Interpolation.average:
      resizeAverage(src, out, dstStride, x1, y1, w, h, dx, dy);
      return true;
    case Interpolation.cubic:
      resizeCubic(src, out, dstStride, x1, y1, w, h, dx, dy);
      return true;
    default:
      return false;
  }
}

/**
 * The bytes of a frame seen with an EXIF orientation applied: the pixel at
 * (x, y) of the oriented image starts at byte base + x * colStep + y * rowStep.
 */
class OrientedSource {
  /** The frame pixel data. */
  bytes: Uint8Array;
  /** The number of bytes per pixel. */
  k: number;
  /** The oriented width. */
  width: number;
  /** The oriented height. */
  height: number;
  /** The byte offset of the first pixel. */
  base: number;
  /** The byte step per oriented column. */
  colStep: number;
  /** The byte step per oriented row. */
  rowStep: number;

  constructor(frame: MemoryImage, orientation: number) {
    this.bytes = frame.toUint8Array();
    this.k = bytesPerPixel(frame);
    this.width = orientedWidth(frame, orientation);
    this.height = orientedHeight(frame, orientation);
    const stride = frame.data!.rowStride;
    const lastCol = (frame.width - 1) * this.k;
    const lastRow = (frame.height - 1) * stride;
    switch (orientation) {
      case 2:
        // flip horizontal
        this.base = lastCol;
        this.colStep = -this.k;
        this.rowStep = stride;
        break;
      case 3:
        // rotate 180
        this.base = lastRow + lastCol;
        this.colStep = -this.k;
        this.rowStep = -stride;
        break;
      case 4:
        // flip vertical
        this.base = lastRow;
        this.colStep = this.k;
        this.rowStep = -stride;
        break;
      case 5:
        // transpose
        this.base = 0;
        this.colStep = stride;
        this.rowStep = this.k;
        break;
      case 6:
        // rotate 90
        this.base = lastRow;
        this.colStep = -stride;
        this.rowStep = this.k;
        break;
      case 7:
        // transverse
        this.base = lastRow + lastCol;
        this.colStep = -stride;
        this.rowStep = -this.k;
        break;
      case 8:
        // rotate 270
        this.base = lastCol;
        this.colStep = stride;
        this.rowStep = -this.k;
        break;
      default:
        this.base = 0;
        this.colStep = this.k;
        this.rowStep = stride;
        break;
    }
  }

  /**
   * The byte offset of the start of the oriented row **y**.
   * @param {number} y - The row of the oriented image.
   * @returns {number} The byte offset of the row.
   */
  row(y: number): number {
    return this.base + y * this.rowStep;
  }
}

/**
 * Resizes using nearest-neighbor sampling.
 * @param {OrientedSource} src - The oriented source.
 * @param {Uint8Array} out - The destination data.
 * @param {number} dstStride - The destination row stride.
 * @param {number} x1 - The X offset in the destination.
 * @param {number} y1 - The Y offset in the destination.
 * @param {number} w - The width of the destination region.
 * @param {number} h - The height of the destination region.
 * @param {Int32Array} scaleX - The source X for each destination X.
 * @param {Int32Array} scaleY - The source Y for each destination Y.
 */
function resizeNearest(
  src: OrientedSource,
  out: Uint8Array,
  dstStride: number,
  x1: number,
  y1: number,
  w: number,
  h: number,
  scaleX: Int32Array,
  scaleY: Int32Array
): void {
  const k = src.k;
  const s = src.bytes;
  const srcX = new Int32Array(w);
  for (let x = 0; x < w; ++x) {
    srcX[x] = scaleX[x] * src.colStep;
  }
  for (let y = 0; y < h; ++y) {
    const srcRow = src.row(scaleY[y]);
    let di = (y1 + y) * dstStride + x1 * k;
    for (let x = 0; x < w; ++x) {
      const si = srcRow + srcX[x];
      for (let c = 0; c < k; ++c) {
        out[di++] = s[si + c];
      }
    }
  }
}

/**
 * Resizes using linear interpolation.
 * @param {OrientedSource} src - The oriented source.
 * @param {Uint8Array} out - The destination data.
 * @param {number} dstStride - The destination row stride.
 * @param {number} x1 - The X offset in the destination.
 * @param {number} y1 - The Y offset in the destination.
 * @param {number} w - The width of the destination region.
 * @param {number} h - The height of the destination region.
 * @param {number} dx - The source X step per destination X.
 * @param {number} dy - The source Y step per destination Y.
 */
function resizeLinear(
  src: OrientedSource,
  out: Uint8Array,
  dstStride: number,
  x1: number,
  y1: number,
  w: number,
  h: number,
  dx: number,
  dy: number
): void {
  const nc = src.k;
  const maxX = src.width - 1;
  const maxY = src.height - 1;
  const ixs = new Int32Array(w);
  const nxs = new Int32Array(w);
  const kxs = new Float64Array(w);
  for (let x = 0; x < w; ++x) {
    const fx = x * dx;
    const ix = Math.trunc(fx);
    kxs[x] = fx - ix;
    ixs[x] = ix * src.colStep;
    nxs[x] = MathUtils.clamp(ix + 1, 0, maxX) * src.colStep;
  }
  for (let y = 0; y < h; ++y) {
    const fy = y * dy;
    const iy = Math.trunc(fy);
    const ky = fy - iy;
    const ny = MathUtils.clamp(iy + 1, 0, maxY);
    linearRow(
      src.bytes,
      src.row(iy),
      src.row(ny),
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
  let d = di;
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
      out[d++] = Math.trunc(
        icc + kx * (inc - icc + ky * (icc + inn - icn - inc)) + ky * (icn - icc)
      );
    }
  }
}

/**
 * Resizes by averaging the source pixels of each destination pixel.
 * @param {OrientedSource} src - The oriented source.
 * @param {Uint8Array} out - The destination data.
 * @param {number} dstStride - The destination row stride.
 * @param {number} x1 - The X offset in the destination.
 * @param {number} y1 - The Y offset in the destination.
 * @param {number} w - The width of the destination region.
 * @param {number} h - The height of the destination region.
 * @param {number} dx - The source X step per destination X.
 * @param {number} dy - The source Y step per destination Y.
 */
function resizeAverage(
  src: OrientedSource,
  out: Uint8Array,
  dstStride: number,
  x1: number,
  y1: number,
  w: number,
  h: number,
  dx: number,
  dy: number
): void {
  const nc = src.k;
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
      for (let c = 0; c < nc; ++c) {
        sums[c] = 0;
      }
      for (let sy = ay1; sy < ay2; ++sy) {
        sumRow(
          src.bytes,
          src.row(sy) + ax1 * src.colStep,
          ax2 - ax1,
          src.colStep,
          nc,
          sums
        );
      }
      // Integer sums are exact in doubles, so this matches summing doubles.
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
 * @param {number} n - The number of pixels to sum.
 * @param {number} step - The byte step between pixels.
 * @param {number} nc - The number of channels.
 * @param {Int32Array} sums - The channel sums.
 */
function sumRow(
  src: Uint8Array,
  si: number,
  n: number,
  step: number,
  nc: number,
  sums: Int32Array
): void {
  let s = si;
  for (let i = 0; i < n; ++i, s += step) {
    for (let c = 0; c < nc; ++c) {
      sums[c] += src[s + c];
    }
  }
}

/**
 * Resizes using cubic interpolation. Matches Image.getPixelCubic: a tap whose
 * row or column is outside the image uses the center pixel.
 * @param {OrientedSource} src - The oriented source.
 * @param {Uint8Array} out - The destination data.
 * @param {number} dstStride - The destination row stride.
 * @param {number} x1 - The X offset in the destination.
 * @param {number} y1 - The Y offset in the destination.
 * @param {number} w - The width of the destination region.
 * @param {number} h - The height of the destination region.
 * @param {number} dx - The source X step per destination X.
 * @param {number} dy - The source Y step per destination Y.
 */
function resizeCubic(
  src: OrientedSource,
  out: Uint8Array,
  dstStride: number,
  x1: number,
  y1: number,
  w: number,
  h: number,
  dx: number,
  dy: number
): void {
  const nc = src.k;
  const s = src.bytes;
  // For each destination column, the source column offsets of the four taps,
  // whether they're inside the image, and the fraction.
  const cols = new Int32Array(w * 4);
  const colInside = new Uint8Array(w * 4);
  const fxs = new Float64Array(w);
  for (let x = 0; x < w; ++x) {
    const fx = x * dx;
    const ix = Math.trunc(fx);
    fxs[x] = fx - ix;
    for (let t = 0; t < 4; ++t) {
      const cx = ix + t - 1;
      cols[x * 4 + t] = cx * src.colStep;
      colInside[x * 4 + t] = cx < 0 || cx >= src.width ? 0 : 1;
    }
  }
  const rows = new Int32Array(4);
  const rowInside = new Uint8Array(4);
  const taps = new Int32Array(16);
  const p = new Float64Array(4);
  for (let y = 0; y < h; ++y) {
    const fy = y * dy;
    const iy = Math.trunc(fy);
    const ky = fy - iy;
    for (let t = 0; t < 4; ++t) {
      const cy = iy + t - 1;
      rows[t] = src.row(cy);
      rowInside[t] = cy < 0 || cy >= src.height ? 0 : 1;
    }
    let di = (y1 + y) * dstStride + x1 * nc;
    for (let x = 0; x < w; ++x) {
      const center = rows[1] + cols[x * 4 + 1];
      for (let r = 0; r < 4; ++r) {
        for (let t = 0; t < 4; ++t) {
          taps[r * 4 + t] =
            rowInside[r] === 0 || colInside[x * 4 + t] === 0
              ? center
              : rows[r] + cols[x * 4 + t];
        }
      }
      const kx = fxs[x];
      for (let c = 0; c < nc; ++c) {
        for (let r = 0; r < 4; ++r) {
          const o = r * 4;
          p[r] = cubic(
            kx,
            s[taps[o] + c],
            s[taps[o + 1] + c],
            s[taps[o + 2] + c],
            s[taps[o + 3] + c]
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
