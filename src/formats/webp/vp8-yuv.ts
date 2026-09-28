/** @format */

import { Format } from '../../color/format.js';
import { MemoryImageDataUint8 } from '../../image/image-data-uint8.js';
import { MemoryImage } from '../../image/image.js';
import { PaletteUint8 } from '../../image/palette-uint8.js';

/**
 * A picture in the planar form VP8 codes: full-resolution luma, chroma at
 * half resolution in both directions, and alpha kept aside at full resolution.
 */
export class VP8Yuv {
  public readonly width: number;
  public readonly height: number;
  public readonly y: Uint8Array;
  public readonly u: Uint8Array;
  public readonly v: Uint8Array;
  public readonly a: Uint8Array | undefined;

  constructor(
    width: number,
    height: number,
    y: Uint8Array,
    u: Uint8Array,
    v: Uint8Array,
    a: Uint8Array | undefined
  ) {
    this.width = width;
    this.height = height;
    this.y = y;
    this.u = u;
    this.v = v;
    this.a = a;
  }

  public get uvWidth(): number {
    return (this.width + 1) >> 1;
  }

  public get uvHeight(): number {
    return (this.height + 1) >> 1;
  }
}

// Fixed-point precision of the RGB->YUV matrix.
const yuvFix = 16;
const yuvHalf = 1 << (yuvFix - 1);

// Chroma is averaged in a lightly compressed space rather than on the raw
// bytes: averaging gamma-encoded values darkens edges, and at 4:2:0 that shows
// up as a colour shift along every hard boundary. libwebp uses an exponent of
// 0.80 with a 12-bit linear representation.
// fixed-point precision of a linear value
const gammaFix = 12;
// fractional bits of the table index
const gammaTabFix = 7;
const gammaTabSize = 1 << (gammaFix - gammaTabFix);
const gammaScale = (1 << gammaFix) - 1;
const gammaTabRounder = 1 << (gammaTabFix - 1);
const gamma = 0.8;

// (1 << alphaFix) / a, so the alpha-weighted average is a multiply and a
// shift. The factor of four that turns a 2x2 sum into a scaled average is
// folded into the shift.
const alphaFix = 19;

function buildGammaToLinear(): Uint16Array {
  const table = new Uint16Array(256);
  for (let v = 0; v <= 255; v++) {
    table[v] = Math.round(Math.pow(v / 255, gamma) * gammaScale);
  }
  return table;
}

function buildLinearToGamma(): Int32Array {
  const table = new Int32Array(gammaTabSize + 1);
  const scale = (1 << gammaTabFix) / gammaScale;
  for (let v = 0; v <= gammaTabSize; v++) {
    table[v] = Math.round(255 * Math.pow(scale * v, 1 / gamma));
  }
  return table;
}

function buildInvAlpha(): Int32Array {
  const table = new Int32Array(4 * 0xff + 1);
  for (let a = 1; a < table.length; a++) {
    table[a] = (1 << alphaFix) / a;
  }
  return table;
}

const gammaToLinear = buildGammaToLinear();
const linearToGamma = buildLinearToGamma();
const invAlpha = buildInvAlpha();

/**
 * Converts a sum of up to four linear values back to gamma space, keeping the
 * factor of four in the result (so the output is scaled by 4).
 */
function toGamma(sum: number, shift: number): number {
  const v = sum << shift;
  const pos = v >> (gammaTabFix + 2);
  const x = v & ((1 << (gammaTabFix + 2)) - 1);
  const v0 = linearToGamma[pos];
  const v1 = linearToGamma[pos + 1];
  return (
    (v1 * x + v0 * ((1 << (gammaTabFix + 2)) - x) + gammaTabRounder) >>
    gammaTabFix
  );
}

function rgbToY(r: number, g: number, b: number): number {
  return (
    (16839 * r + 33059 * g + 6420 * b + yuvHalf + (16 << yuvFix)) >> yuvFix
  );
}

/**
 * Clips a chroma value given at {@link yuvFix} + 2 precision.
 */
function clipUV(uv: number): number {
  const v = (uv + (yuvHalf << 2) + (128 << (yuvFix + 2))) >> (yuvFix + 2);
  return (v & ~0xff) === 0 ? v : v < 0 ? 0 : 255;
}

/**
 * Converts {@link image} to the planes VP8 codes.
 *
 * Chroma is the average of each 2x2 block, weighted by alpha where the block
 * is partly transparent so that the colour of invisible pixels cannot bleed
 * into visible ones.
 */
export function importYuv(image: MemoryImage): VP8Yuv {
  const width = image.width;
  const height = image.height;
  const uvWidth = (width + 1) >> 1;
  const uvHeight = (height + 1) >> 1;

  const rgba = rgbaBytes(image);
  const y = new Uint8Array(width * height);
  const u = new Uint8Array(uvWidth * uvHeight);
  const v = new Uint8Array(uvWidth * uvHeight);

  let hasAlpha = false;
  if (image.hasAlpha) {
    for (let i = 3; i < rgba.length; i += 4) {
      if (rgba[i] !== 0xff) {
        hasAlpha = true;
        break;
      }
    }
  }
  let a: Uint8Array | undefined = undefined;
  if (hasAlpha) {
    a = new Uint8Array(width * height);
    for (let i = 0, j = 3; i < a.length; i++, j += 4) {
      a[i] = rgba[j];
    }
  }

  const stride = 4 * width;
  // Accumulated 2x2 sums, as r, g, b, alpha per chroma sample.
  const tmp = new Int32Array(4 * uvWidth);

  let row = 0;
  let uvRow = 0;
  for (; row + 1 < height; row += 2, uvRow++) {
    const top = row * stride;
    rowToY(rgba, top, y, row * width, width);
    rowToY(rgba, top + stride, y, (row + 1) * width, width);
    if (hasAlpha && rowsHaveAlpha(rgba, top, width, 2, stride)) {
      accumulateRGBA(rgba, top, stride, tmp, width);
    } else {
      accumulateRGB(rgba, top, stride, tmp, width);
    }
    rowsToUV(tmp, u, v, uvRow * uvWidth, uvWidth);
  }
  if (row < height) {
    // Odd last row: the 2x2 block degenerates to 1x2, so the pair sum is
    // doubled to stay on the same scale.
    const top = row * stride;
    rowToY(rgba, top, y, row * width, width);
    if (hasAlpha && rowsHaveAlpha(rgba, top, width, 1, stride)) {
      accumulateRGBA(rgba, top, 0, tmp, width);
    } else {
      accumulateRGB(rgba, top, 0, tmp, width);
    }
    rowsToUV(tmp, u, v, uvRow * uvWidth, uvWidth);
  }

  return new VP8Yuv(width, height, y, u, v, a);
}

/**
 * Size of the block the transparent-area cleanup works on.
 */
const cleanupBlock = 8;

/**
 * Replaces what sits under transparent pixels with something cheaper to code.
 *
 * The colour beneath a fully transparent pixel is invisible, but the encoder
 * still pays for every edge in it. Within a block that is partly transparent
 * the hidden luma is set to the average of the visible luma, which removes
 * those edges; a run of blocks that are transparent throughout is flattened
 * to one colour, which removes them entirely.
 */
export function cleanupTransparentArea(pic: VP8Yuv): void {
  const a = pic.a;
  if (a === undefined) {
    return;
  }
  const width = pic.width;
  const height = pic.height;
  const uvStride = pic.uvWidth;
  const size = cleanupBlock;
  const half = size >> 1;

  let y = 0;
  for (; y + size <= height; y += size) {
    let needReset = true;
    let yv = 0;
    let uv = 0;
    let vv = 0;
    let x = 0;
    for (; x + size <= width; x += size) {
      const yOff = y * width + x;
      const uvOff = (y >> 1) * uvStride + (x >> 1);
      if (smoothenBlock(a, pic.y, yOff, width, size, size)) {
        if (needReset) {
          yv = pic.y[yOff];
          uv = pic.u[uvOff];
          vv = pic.v[uvOff];
          needReset = false;
        }
        flatten(pic.y, yOff, yv, width, size);
        flatten(pic.u, uvOff, uv, uvStride, half);
        flatten(pic.v, uvOff, vv, uvStride, half);
      } else {
        needReset = true;
      }
    }
    if (x < width) {
      smoothenBlock(a, pic.y, y * width + x, width, width - x, size);
    }
  }
  if (y < height) {
    const subHeight = height - y;
    let x = 0;
    for (; x + size <= width; x += size) {
      smoothenBlock(a, pic.y, y * width + x, width, size, subHeight);
    }
    if (x < width) {
      smoothenBlock(a, pic.y, y * width + x, width, width - x, subHeight);
    }
  }
}

/**
 * Flattens the luma of the transparent pixels in one block to the average of
 * the visible ones. Returns true if the block has no visible pixel at all.
 */
function smoothenBlock(
  a: Uint8Array,
  luma: Uint8Array,
  off: number,
  stride: number,
  width: number,
  height: number
): boolean {
  let sum = 0;
  let count = 0;
  for (let y = 0; y < height; y++) {
    const row = off + y * stride;
    for (let x = 0; x < width; x++) {
      if (a[row + x] !== 0) {
        count++;
        sum += luma[row + x];
      }
    }
  }
  if (count > 0 && count < width * height) {
    const avg = (sum / count) | 0;
    for (let y = 0; y < height; y++) {
      const row = off + y * stride;
      for (let x = 0; x < width; x++) {
        if (a[row + x] === 0) {
          luma[row + x] = avg;
        }
      }
    }
  }
  return count === 0;
}

function flatten(
  plane: Uint8Array,
  off: number,
  value: number,
  stride: number,
  size: number
): void {
  for (let y = 0; y < size; y++) {
    plane.fill(value, off + y * stride, off + y * stride + size);
  }
}

/**
 * The picture as interleaved RGBA bytes.
 *
 * The general path converts pixel by pixel through the colour machinery. An
 * 8-bit image is already stored interleaved in the order wanted, so it needs
 * at most a widening pass, and a four-channel one needs nothing at all.
 */
function rgbaBytes(image: MemoryImage): Uint8Array {
  const numChannels = image.numChannels;
  const palette = image.palette;
  const data = image.data;
  if (image.format === Format.uint8 && palette === undefined) {
    const src = data?.getBytes();
    if (src !== undefined) {
      const pixels = image.width * image.height;
      if (numChannels === 4) {
        return src;
      }
      if (numChannels === 3) {
        const out = new Uint8Array(pixels * 4);
        for (let i = 0, j = 0; i < pixels; i++, j += 3) {
          const o = i * 4;
          out[o] = src[j];
          out[o + 1] = src[j + 1];
          out[o + 2] = src[j + 2];
          out[o + 3] = 0xff;
        }
        return out;
      }
      if (numChannels === 1) {
        const out = new Uint8Array(pixels * 4);
        for (let i = 0; i < pixels; i++) {
          const v = src[i];
          const o = i * 4;
          out[o] = v;
          out[o + 1] = v;
          out[o + 2] = v;
          out[o + 3] = 0xff;
        }
        return out;
      }
    }
  }
  if (
    image.format === Format.uint8 &&
    palette instanceof PaletteUint8 &&
    data instanceof MemoryImageDataUint8 &&
    data.numChannels === 1 &&
    (palette.numChannels === 3 || palette.numChannels === 4)
  ) {
    return paletteRgba(data.data, palette);
  }
  const out = new Uint8Array(image.width * image.height * 4);
  let o = 0;
  for (const p of image) {
    out[o++] = p.r;
    out[o++] = p.g;
    out[o++] = p.b;
    out[o++] = p.a;
  }
  return out;
}

/**
 * {@link indices} expanded through {@link palette} into interleaved RGBA, byte
 * for byte what {@link MemoryImage.convert} produces for the same picture.
 *
 * An index past the end of the palette has no colour of its own. The palette
 * getters answer 0 for every channel there, alpha included, so convert gives
 * such a pixel transparent black from a four-channel palette and opaque black
 * from a three-channel one. The table is pre-filled the same way, which keeps
 * the per-pixel loop free of a range check.
 */
function paletteRgba(indices: Uint8Array, palette: PaletteUint8): Uint8Array {
  const colors = palette.data;
  const channels = palette.numChannels;
  const numColors = Math.min(Math.trunc(colors.length / channels), 256);
  const table = new Uint8Array(256 * 4);
  if (channels < 4) {
    for (let c = numColors; c < 256; c++) {
      table[4 * c + 3] = 0xff;
    }
  }
  for (let c = 0; c < numColors; c++) {
    table[4 * c] = colors[c * channels];
    table[4 * c + 1] = colors[c * channels + 1];
    table[4 * c + 2] = colors[c * channels + 2];
    table[4 * c + 3] = channels === 4 ? colors[c * channels + 3] : 0xff;
  }
  const out = new Uint8Array(indices.length * 4);
  for (let i = 0, o = 0; i < indices.length; i++, o += 4) {
    const t = 4 * indices[i];
    out[o] = table[t];
    out[o + 1] = table[t + 1];
    out[o + 2] = table[t + 2];
    out[o + 3] = table[t + 3];
  }
  return out;
}

function rowToY(
  rgba: Uint8Array,
  src: number,
  y: Uint8Array,
  dst: number,
  width: number
): void {
  let s = src;
  for (let i = 0; i < width; i++, s += 4) {
    y[dst + i] = rgbToY(rgba[s], rgba[s + 1], rgba[s + 2]);
  }
}

function rowsHaveAlpha(
  rgba: Uint8Array,
  src: number,
  width: number,
  rows: number,
  stride: number
): boolean {
  let s = src;
  for (let r = 0; r < rows; r++, s += stride) {
    for (let i = s + 3, end = s + 4 * width; i < end; i += 4) {
      if (rgba[i] !== 0xff) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Averages each 2x2 block in linear space. {@link stride} is zero on the last row of
 * an odd-height image, which makes every read hit the same row twice.
 */
function accumulateRGB(
  rgba: Uint8Array,
  src: number,
  stride: number,
  dst: Int32Array,
  width: number
): void {
  const toLinear = gammaToLinear;
  let i = 0;
  let j = src;
  for (; i < width >> 1; i++, j += 8) {
    const k = j + stride;
    dst[4 * i] = toGamma(
      toLinear[rgba[j]] +
        toLinear[rgba[j + 4]] +
        toLinear[rgba[k]] +
        toLinear[rgba[k + 4]],
      0
    );
    dst[4 * i + 1] = toGamma(
      toLinear[rgba[j + 1]] +
        toLinear[rgba[j + 5]] +
        toLinear[rgba[k + 1]] +
        toLinear[rgba[k + 5]],
      0
    );
    dst[4 * i + 2] = toGamma(
      toLinear[rgba[j + 2]] +
        toLinear[rgba[j + 6]] +
        toLinear[rgba[k + 2]] +
        toLinear[rgba[k + 6]],
      0
    );
  }
  if ((width & 1) !== 0) {
    const k = j + stride;
    dst[4 * i] = toGamma(toLinear[rgba[j]] + toLinear[rgba[k]], 1);
    dst[4 * i + 1] = toGamma(toLinear[rgba[j + 1]] + toLinear[rgba[k + 1]], 1);
    dst[4 * i + 2] = toGamma(toLinear[rgba[j + 2]] + toLinear[rgba[k + 2]], 1);
  }
}

/**
 * As {@link accumulateRGB}, but weights each pixel by its alpha, so that the colour
 * stored under a transparent pixel does not pull the visible average.
 */
function accumulateRGBA(
  rgba: Uint8Array,
  src: number,
  stride: number,
  dst: Int32Array,
  width: number
): void {
  let i = 0;
  let j = src;
  for (; i < width >> 1; i++, j += 8) {
    const k = j + stride;
    const a = rgba[j + 3] + rgba[j + 7] + rgba[k + 3] + rgba[k + 7];
    if (a === 4 * 0xff || a === 0) {
      accumulate4(rgba, j, k, dst, 4 * i);
    } else {
      dst[4 * i] = weighted(rgba, j, k, 4, a, 0);
      dst[4 * i + 1] = weighted(rgba, j, k, 4, a, 1);
      dst[4 * i + 2] = weighted(rgba, j, k, 4, a, 2);
    }
    dst[4 * i + 3] = a;
  }
  if ((width & 1) !== 0) {
    const k = j + stride;
    const a = 2 * (rgba[j + 3] + rgba[k + 3]);
    if (a === 4 * 0xff || a === 0) {
      const toLinear = gammaToLinear;
      dst[4 * i] = toGamma(toLinear[rgba[j]] + toLinear[rgba[k]], 1);
      dst[4 * i + 1] = toGamma(
        toLinear[rgba[j + 1]] + toLinear[rgba[k + 1]],
        1
      );
      dst[4 * i + 2] = toGamma(
        toLinear[rgba[j + 2]] + toLinear[rgba[k + 2]],
        1
      );
    } else {
      dst[4 * i] = weighted(rgba, j, k, 0, a, 0);
      dst[4 * i + 1] = weighted(rgba, j, k, 0, a, 1);
      dst[4 * i + 2] = weighted(rgba, j, k, 0, a, 2);
    }
    dst[4 * i + 3] = a;
  }
}

function accumulate4(
  rgba: Uint8Array,
  j: number,
  k: number,
  dst: Int32Array,
  at: number
): void {
  const toLinear = gammaToLinear;
  for (let c = 0; c < 3; c++) {
    dst[at + c] = toGamma(
      toLinear[rgba[j + c]] +
        toLinear[rgba[j + 4 + c]] +
        toLinear[rgba[k + c]] +
        toLinear[rgba[k + 4 + c]],
      0
    );
  }
}

/**
 * The alpha-weighted linear average of one channel over a 2x2 block, back in
 * gamma space. {@link step} is 0 for the half block of an odd-width image.
 */
function weighted(
  rgba: Uint8Array,
  j: number,
  k: number,
  step: number,
  a: number,
  c: number
): number {
  const toLinear = gammaToLinear;
  const sum =
    rgba[j + 3] * toLinear[rgba[j + c]] +
    rgba[j + step + 3] * toLinear[rgba[j + step + c]] +
    rgba[k + 3] * toLinear[rgba[k + c]] +
    rgba[k + step + 3] * toLinear[rgba[k + step + c]];
  return toGamma((sum * invAlpha[a]) >> (alphaFix - 2), 0);
}

function rowsToUV(
  rgb: Int32Array,
  u: Uint8Array,
  v: Uint8Array,
  dst: number,
  width: number
): void {
  for (let i = 0; i < width; i++) {
    const r = rgb[4 * i];
    const g = rgb[4 * i + 1];
    const b = rgb[4 * i + 2];
    u[dst + i] = clipUV(-9719 * r - 19081 * g + 28800 * b);
    v[dst + i] = clipUV(28800 * r - 24116 * g - 4684 * b);
  }
}
