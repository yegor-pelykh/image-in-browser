/** @format */

import { Format } from '../color/format.js';
import { cubicAlphaWeights } from '../common/alpha-weight.js';
import { MathUtils } from '../common/math-utils.js';
import { MemoryImage } from '../image/image.js';
import { Interpolation } from '../common/interpolation.js';
import { AlphaBlockSums } from './alpha-block-sums.js';
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

    if (nc % 2 === 0) {
      blendLinearAlphaPixel(src, i0, n0, i1, n1, kx, ky, out, d, nc);
      d += nc;
      continue;
    }

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
 * Blends one linear sample of four taps.
 * @param {number} center - The center tap.
 * @param {number} right - The right tap.
 * @param {number} below - The below tap.
 * @param {number} diagonal - The diagonal tap.
 * @param {number} fractionX - The horizontal fraction.
 * @param {number} fractionY - The vertical fraction.
 * @returns {number} The blended sample.
 */
function blendLinearByte(
  center: number,
  right: number,
  below: number,
  diagonal: number,
  fractionX: number,
  fractionY: number
): number {
  return Math.trunc(
    center +
      fractionX *
        (right - center + fractionY * (center + diagonal - below - right)) +
      fractionY * (below - center)
  );
}

/**
 * Blends one pixel of 2 or 4 channels from four taps, weighting taps with
 * different alpha by alpha.
 * @param {Uint8Array} bytes - The source data.
 * @param {number} center - The center tap byte offset.
 * @param {number} right - The right tap byte offset.
 * @param {number} below - The below tap byte offset.
 * @param {number} diagonal - The diagonal tap byte offset.
 * @param {number} fractionX - The horizontal fraction.
 * @param {number} fractionY - The vertical fraction.
 * @param {Uint8Array} out - The destination data.
 * @param {number} outOffset - The destination byte offset.
 * @param {number} channels - The number of channels.
 */
function blendLinearAlphaPixel(
  bytes: Uint8Array,
  center: number,
  right: number,
  below: number,
  diagonal: number,
  fractionX: number,
  fractionY: number,
  out: Uint8Array,
  outOffset: number,
  channels: number
): void {
  const alphaOffset = channels - 1;
  const centerAlpha = bytes[center + alphaOffset];
  const rightAlpha = bytes[right + alphaOffset];
  const belowAlpha = bytes[below + alphaOffset];
  const diagonalAlpha = bytes[diagonal + alphaOffset];
  const isUniform =
    ((centerAlpha ^ rightAlpha) |
      (centerAlpha ^ belowAlpha) |
      (centerAlpha ^ diagonalAlpha)) ===
    0;

  if (!isUniform) {
    blendMixedLinearPixel(
      bytes,
      center,
      right,
      below,
      diagonal,
      fractionX,
      fractionY,
      out,
      outOffset,
      channels
    );
    return;
  }

  out[outOffset] = blendLinearByte(
    bytes[center],
    bytes[right],
    bytes[below],
    bytes[diagonal],
    fractionX,
    fractionY
  );

  if (channels === 4) {
    out[outOffset + 1] = blendLinearByte(
      bytes[center + 1],
      bytes[right + 1],
      bytes[below + 1],
      bytes[diagonal + 1],
      fractionX,
      fractionY
    );
    out[outOffset + 2] = blendLinearByte(
      bytes[center + 2],
      bytes[right + 2],
      bytes[below + 2],
      bytes[diagonal + 2],
      fractionX,
      fractionY
    );
  }

  out[outOffset + alphaOffset] = centerAlpha;
}

/**
 * Blends one pixel of 2 or 4 channels from four taps with different alpha.
 * @param {Uint8Array} bytes - The source data.
 * @param {number} center - The center tap byte offset.
 * @param {number} right - The right tap byte offset.
 * @param {number} below - The below tap byte offset.
 * @param {number} diagonal - The diagonal tap byte offset.
 * @param {number} fractionX - The horizontal fraction.
 * @param {number} fractionY - The vertical fraction.
 * @param {Uint8Array} out - The destination data.
 * @param {number} outOffset - The destination byte offset.
 * @param {number} channels - The number of channels.
 */
function blendMixedLinearPixel(
  bytes: Uint8Array,
  center: number,
  right: number,
  below: number,
  diagonal: number,
  fractionX: number,
  fractionY: number,
  out: Uint8Array,
  outOffset: number,
  channels: number
): void {
  const alphaOffset = channels - 1;
  const centerAlpha = bytes[center + alphaOffset];
  const rightAlpha = bytes[right + alphaOffset];
  const belowAlpha = bytes[below + alphaOffset];
  const diagonalAlpha = bytes[diagonal + alphaOffset];
  const crossAlpha = centerAlpha + diagonalAlpha - belowAlpha - rightAlpha;
  const alpha =
    centerAlpha +
    fractionX * (rightAlpha - centerAlpha + fractionY * crossAlpha) +
    fractionY * (belowAlpha - centerAlpha);

  if (alpha <= 0) {
    for (let i = 0; i < alphaOffset; ++i) {
      out[outOffset + i] = blendLinearByte(
        bytes[center + i],
        bytes[right + i],
        bytes[below + i],
        bytes[diagonal + i],
        fractionX,
        fractionY
      );
    }
  } else {
    const cross = fractionX * fractionY;
    const centerWeight = (1 - fractionX - fractionY + cross) * centerAlpha;
    const rightWeight = (fractionX - cross) * rightAlpha;
    const belowWeight = (fractionY - cross) * belowAlpha;
    const diagonalWeight = cross * diagonalAlpha;
    let referenceTap = center;
    let largest = centerWeight;
    if (rightWeight > largest) {
      referenceTap = right;
      largest = rightWeight;
    }
    if (belowWeight > largest) {
      referenceTap = below;
      largest = belowWeight;
    }
    if (diagonalWeight > largest) {
      referenceTap = diagonal;
    }

    for (let i = 0; i < alphaOffset; ++i) {
      const reference = bytes[referenceTap + i];
      const offset =
        centerWeight * (bytes[center + i] - reference) +
        rightWeight * (bytes[right + i] - reference) +
        belowWeight * (bytes[below + i] - reference) +
        diagonalWeight * (bytes[diagonal + i] - reference);

      out[outOffset + i] = Math.trunc(reference + offset / alpha);
    }
  }

  out[outOffset + alphaOffset] = Math.trunc(alpha);
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
  if (nc % 2 === 0) {
    resizeAverageAlpha(src, out, dstStride, x1, y1, w, h, dy, ax1s, ax2s);
    return;
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
      const count = (ay2 - ay1) * (ax2 - ax1);
      for (let c = 0; c < nc; ++c) {
        out[di++] = Math.floor(sums[c] / count);
      }
    }
  }
}

/**
 * Resizes by averaging the source pixels of each destination pixel, weighting
 * the colors of blocks with different alpha by alpha.
 * @param {OrientedSource} source - The oriented source.
 * @param {Uint8Array} out - The destination data.
 * @param {number} dstStride - The destination row stride.
 * @param {number} x1 - The X offset in the destination.
 * @param {number} y1 - The Y offset in the destination.
 * @param {number} w - The width of the destination region.
 * @param {number} h - The height of the destination region.
 * @param {number} dy - The source Y step per destination Y.
 * @param {Int32Array} ax1s - The first source X of each destination X.
 * @param {Int32Array} ax2s - The last source X of each destination X.
 */
function resizeAverageAlpha(
  source: OrientedSource,
  out: Uint8Array,
  dstStride: number,
  x1: number,
  y1: number,
  w: number,
  h: number,
  dy: number,
  ax1s: Int32Array,
  ax2s: Int32Array
): void {
  const bytes = source.bytes;
  const colStep = source.colStep;
  const channels = source.k;
  const rowStep = source.rowStep;
  const hasColor = channels === 4;
  const sums = new AlphaBlockSums();

  for (let y = 0; y < h; ++y) {
    const ay1 = Math.trunc(y * dy);
    let ay2 = Math.trunc((y + 1) * dy);
    if (ay2 === ay1) {
      ay2++;
    }
    let di = (y1 + y) * dstStride + x1 * channels;

    for (let x = 0; x < w; ++x) {
      const columns = ax2s[x] - ax1s[x];
      const start = source.row(ay1) + ax1s[x] * colStep;
      const count = (ay2 - ay1) * columns;
      sums.sumBlock(
        bytes,
        start,
        colStep,
        rowStep,
        columns,
        ay2 - ay1,
        channels
      );

      if (sums.hasMixedAlpha) {
        out[di++] = Math.floor(sums.weightedRed / sums.alpha);
        if (hasColor) {
          out[di++] = Math.floor(sums.weightedGreen / sums.alpha);
          out[di++] = Math.floor(sums.weightedBlue / sums.alpha);
        }
      } else {
        out[di++] = Math.floor(sums.red / count);
        if (hasColor) {
          out[di++] = Math.floor(sums.green / count);
          out[di++] = Math.floor(sums.blue / count);
        }
      }

      out[di++] = Math.floor(sums.alpha / count);
    }
  }
}

/**
 * Downscales **bytes** of 2 or 4 channels by average in place for resize,
 * reading every block before writing a pixel that overlaps it.
 * @param {Uint8Array} bytes - The image bytes.
 * @param {number} sourceWidth - The source width.
 * @param {number} channels - The number of channels.
 * @param {number} width - The destination width.
 * @param {number} height - The destination height.
 * @param {number} stepX - The source X step per destination X.
 * @param {number} stepY - The source Y step per destination Y.
 */
export function resizeDownAverageAlpha(
  bytes: Uint8Array,
  sourceWidth: number,
  channels: number,
  width: number,
  height: number,
  stepX: number,
  stepY: number
): void {
  const sums = new AlphaBlockSums();
  const hasColor = channels === 4;
  const rowStep = sourceWidth * channels;
  let outOffset = 0;

  for (let y = 0; y < height; ++y) {
    const blockTop = Math.trunc(y * stepY);
    const blockBottom = Math.trunc((y + 1) * stepY);
    const rows = blockBottom === blockTop ? 1 : blockBottom - blockTop;

    for (let x = 0; x < width; ++x) {
      const blockLeft = Math.trunc(x * stepX);
      const blockRight = Math.trunc((x + 1) * stepX);
      const columns = blockRight === blockLeft ? 1 : blockRight - blockLeft;
      const count = rows * columns;
      const start = (blockTop * sourceWidth + blockLeft) * channels;
      sums.sumBlock(bytes, start, channels, rowStep, columns, rows, channels);

      if (sums.hasMixedAlpha) {
        bytes[outOffset++] = Math.floor(sums.weightedRed / sums.alpha);
        if (hasColor) {
          bytes[outOffset++] = Math.floor(sums.weightedGreen / sums.alpha);
          bytes[outOffset++] = Math.floor(sums.weightedBlue / sums.alpha);
        }
      } else {
        bytes[outOffset++] = Math.floor(sums.red / count);
        if (hasColor) {
          bytes[outOffset++] = Math.floor(sums.green / count);
          bytes[outOffset++] = Math.floor(sums.blue / count);
        }
      }

      bytes[outOffset++] = Math.floor(sums.alpha / count);
    }
  }
}

/**
 * Downscales **bytes** of 2 or 4 channels linearly in place for resize, using
 * the center pixel as the tap outside the right or bottom edge, as
 * {@link MemoryImage.getPixelLinear} does.
 * @param {Uint8Array} bytes - The image bytes.
 * @param {number} sourceWidth - The source width.
 * @param {number} sourceHeight - The source height.
 * @param {number} channels - The number of channels.
 * @param {number} width - The destination width.
 * @param {number} height - The destination height.
 * @param {number} stepX - The source X step per destination X.
 * @param {number} stepY - The source Y step per destination Y.
 */
export function resizeDownLinearAlpha(
  bytes: Uint8Array,
  sourceWidth: number,
  sourceHeight: number,
  channels: number,
  width: number,
  height: number,
  stepX: number,
  stepY: number
): void {
  let outOffset = 0;
  for (let y = 0; y < height; ++y) {
    const sourceY = y * stepY;
    const floorY = Math.trunc(sourceY);
    const fractionY = sourceY - floorY;
    const rowStart = floorY * sourceWidth;
    const nextRowStart = rowStart + sourceWidth;
    const hasNextRow = floorY + 1 < sourceHeight;

    for (let x = 0; x < width; ++x) {
      const sourceX = x * stepX;
      const floorX = Math.trunc(sourceX);
      const hasNextColumn = floorX + 1 < sourceWidth;
      const center = (rowStart + floorX) * channels;
      const right = hasNextColumn ? center + channels : center;
      const below = hasNextRow ? (nextRowStart + floorX) * channels : center;
      const diagonal = hasNextColumn && hasNextRow ? below + channels : center;

      blendLinearAlphaPixel(
        bytes,
        center,
        right,
        below,
        diagonal,
        sourceX - floorX,
        fractionY,
        bytes,
        outOffset,
        channels
      );
      outOffset += channels;
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
 * row or column is outside the image uses the center pixel, and taps with
 * different alpha are weighted by alpha.
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
  const alphas = new Float64Array(16);
  const hasAlpha = nc % 2 === 0;
  const alphaOffset = nc - 1;
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
      let colorChannels = nc;
      let alpha = 0;
      let isWeighted = false;
      let referenceTap = 5;
      let visible = 0;

      if (hasAlpha) {
        colorChannels = alphaOffset;
        const centerAlpha = s[center + alphaOffset];
        let isUniform = true;
        for (let i = 0; i < 16; ++i) {
          isUniform = isUniform && s[taps[i] + alphaOffset] === centerAlpha;
        }

        alpha = centerAlpha;
        if (!isUniform) {
          alpha = cubicAlpha(s, taps, alphaOffset, kx, ky, alphas);
          isWeighted = alpha > 0;
        }

        if (isWeighted) {
          for (let i = 0; i < 16; ++i) {
            if (alphas[i] > 0) {
              visible |= 1 << i;
            }
          }

          referenceTap = cubicAlphaWeights(alphas, kx, ky);
        }
      }

      if (isWeighted) {
        for (let c = 0; c < colorChannels; ++c) {
          const reference = s[taps[referenceTap] + c];
          let lowest = 255;
          let highest = 0;
          let v = 0;

          for (let i = 0; i < 16; ++i) {
            const value = s[taps[i] + c];
            v += alphas[i] * (value - reference);
            if ((visible & (1 << i)) !== 0) {
              lowest = value < lowest ? value : lowest;
              highest = value > highest ? value : highest;
            }
          }

          v = reference + v / alpha;
          out[di++] =
            v < lowest ? lowest : v > highest ? highest : Math.trunc(v);
        }
      } else {
        for (let c = 0; c < colorChannels; ++c) {
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

      if (hasAlpha) {
        out[di++] = alpha < 0 ? 0 : alpha > 255 ? 255 : Math.trunc(alpha);
      }
    }
  }
}

/**
 * Computes the cubic interpolation of the alphas of 16 taps.
 * @param {Uint8Array} bytes - The source data.
 * @param {Int32Array} taps - The tap byte offsets.
 * @param {number} alphaOffset - The alpha byte offset in a pixel.
 * @param {number} fractionX - The horizontal fraction.
 * @param {number} fractionY - The vertical fraction.
 * @param {Float64Array} alphas - The output alphas.
 * @returns {number} The interpolated alpha.
 */
function cubicAlpha(
  bytes: Uint8Array,
  taps: Int32Array,
  alphaOffset: number,
  fractionX: number,
  fractionY: number,
  alphas: Float64Array
): number {
  for (let i = 0; i < 16; ++i) {
    alphas[i] = bytes[taps[i] + alphaOffset];
  }

  return cubic(
    fractionY,
    cubic(fractionX, alphas[0], alphas[1], alphas[2], alphas[3]),
    cubic(fractionX, alphas[4], alphas[5], alphas[6], alphas[7]),
    cubic(fractionX, alphas[8], alphas[9], alphas[10], alphas[11]),
    cubic(fractionX, alphas[12], alphas[13], alphas[14], alphas[15])
  );
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
