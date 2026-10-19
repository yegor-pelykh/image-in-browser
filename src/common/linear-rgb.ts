/** @format */

import { Color } from '../color/color.js';
import { ColorFloat32 } from '../color/color-float32.js';
import { ColorUtils } from '../color/color-utils.js';
import { Format, FormatType } from '../color/format.js';
import { MemoryImage } from '../image/image.js';
import { MemoryImageDataFloat32 } from '../image/image-data-float32.js';
import { MemoryImageDataUint8 } from '../image/image-data-uint8.js';
import { MathUtils } from './math-utils.js';

// Operations that average colors, such as blurring and resizing, can
// optionally average the light the colors represent rather than their stored
// sRGB values. They do so on a float32 working copy of the image holding
// linear values, made with linearRgbCopy, and convert the result back with
// srgbCopy or writeSrgb. Alpha is a coverage, not a color, so it's copied
// as is.

// sRGB uint8 value -> linear light.
const toLinear8 = new Float32Array(
  Array.from({ length: 256 }, (_v, v) => ColorUtils.srgbToLinear(v / 255))
);

// midpoints8[k] is the linear value halfway, in sRGB, between the uint8
// values k and k + 1, so a linear value encodes to the number of midpoints
// below it: the nearest uint8 value. That makes uint8 -> linear -> uint8
// exact.
const midpoints8 = new Float64Array(
  Array.from({ length: 255 }, (_v, k) =>
    ColorUtils.srgbToLinear((k + 0.5) / 255)
  )
);

/**
 * Returns the nearest uint8 sRGB value of a normalized linear light value.
 * @param {number} v - The normalized linear light value.
 * @returns {number} The uint8 sRGB value.
 */
function linearToSrgb8(v: number): number {
  let lo = 0;
  let hi = 255;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (v > midpoints8[mid]) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

/**
 * Returns the alpha channel index of a color with **numChannels** channels,
 * or -1 if it has no alpha channel.
 * @param {number} numChannels - The number of channels.
 * @returns {number} The alpha channel index, or -1.
 */
function alphaChannel(numChannels: number): number {
  return numChannels === 2 || numChannels === 4 ? numChannels - 1 : -1;
}

/**
 * Creates an empty image with the size and metadata of **frame**.
 * @param {MemoryImage} frame - The image to copy the size and metadata from.
 * @param {Format} format - The format of the new image.
 * @param {number} numChannels - The number of channels of the new image.
 * @returns {MemoryImage} The new image.
 */
function emptyLike(
  frame: MemoryImage,
  format: Format,
  numChannels: number
): MemoryImage {
  return new MemoryImage({
    width: frame.width,
    height: frame.height,
    format: format,
    numChannels: numChannels,
    exifData: frame.hasExif ? frame.exifData.clone() : undefined,
    iccProfile: frame.iccProfile?.clone(),
    backgroundColor: frame.backgroundColor?.clone(),
    frameType: frame.frameType,
    loopCount: frame.loopCount,
    frameDuration: frame.frameDuration,
    textData:
      frame.textData !== undefined ? new Map(frame.textData) : undefined,
  });
}

/**
 * Returns **c**, taken as sRGB, as a float32 color holding linear light, for
 * use with an image made by {@link linearRgbCopy}.
 * @param {Color} [c] - The sRGB color.
 * @returns {Color | undefined} The linear light color, or undefined.
 */
export function linearColor(c?: Color): Color | undefined {
  return c === undefined
    ? undefined
    : ColorFloat32.rgba(
        ColorUtils.srgbToLinear(c.rNormalized),
        ColorUtils.srgbToLinear(c.gNormalized),
        ColorUtils.srgbToLinear(c.bNormalized),
        c.aNormalized
      );
}

/**
 * Returns a float32 copy of **src**, with its colors, taken as sRGB, converted
 * to normalized linear light. A palette is expanded. With **noAnimation**, only
 * the first frame is copied.
 * @param {MemoryImage} src - The image to copy.
 * @param {boolean} [noAnimation=false] - Whether to copy only the first frame.
 * @returns {MemoryImage} The linear light copy.
 */
export function linearRgbCopy(
  src: MemoryImage,
  noAnimation = false
): MemoryImage {
  let first: MemoryImage | undefined = undefined;
  for (const frame of noAnimation ? [src] : src.frames) {
    const nc = frame.numChannels;
    const alpha = alphaChannel(nc);
    const out = emptyLike(frame, Format.float32, nc);
    const dst = (out.data as MemoryImageDataFloat32).data;
    const data = frame.data;
    if (data instanceof MemoryImageDataUint8 && !frame.hasPalette) {
      const bytes = data.data;
      const n = frame.width * frame.height * nc;
      for (let i = 0, c = 0; i < n; ++i) {
        const v = bytes[i];
        dst[i] = c === alpha ? v / 255 : toLinear8[v];
        if (++c === nc) {
          c = 0;
        }
      }
    } else {
      let i = 0;
      for (const p of frame) {
        const max = p.maxChannelValue;
        for (let c = 0; c < nc; ++c, ++i) {
          const v = p.getChannel(c) / max;
          dst[i] = c === alpha ? v : ColorUtils.srgbToLinear(v);
        }
      }
    }
    if (first === undefined) {
      first = out;
    } else {
      first.addFrame(out);
    }
  }
  return first!;
}

/**
 * Runs **filter**, which modifies an image in place, on a linear light copy of
 * **src** and writes the result back into **src**. Returns **src**, or for an
 * image with a palette, which can't hold the result, a new image.
 * @param {MemoryImage} src - The image to filter.
 * @param {(linear: MemoryImage) => MemoryImage} filter - The filter to run on the linear copy.
 * @returns {MemoryImage} The filtered image.
 */
export function filterLinear(
  src: MemoryImage,
  filter: (linear: MemoryImage) => MemoryImage
): MemoryImage {
  const linear = filter(linearRgbCopy(src));
  if (src.hasPalette) {
    return srgbCopy(linear, src.format);
  }
  writeSrgb(linear, src);
  return src;
}

/**
 * Returns a copy of **linear**, made by {@link linearRgbCopy} or an operation
 * on such a copy, with its colors converted back to sRGB and stored as
 * **format**.
 * @param {MemoryImage} linear - The linear light image.
 * @param {Format} format - The format of the returned image.
 * @returns {MemoryImage} The sRGB copy.
 */
export function srgbCopy(linear: MemoryImage, format: Format): MemoryImage {
  let first: MemoryImage | undefined = undefined;
  for (const frame of linear.frames) {
    const out = emptyLike(frame, format, frame.numChannels);
    writeSrgbFrame(frame, out);
    if (first === undefined) {
      first = out;
    } else {
      first.addFrame(out);
    }
  }
  return first!;
}

/**
 * Writes **linear**, made by {@link linearRgbCopy} from **dst**, back into
 * **dst**, with its colors converted back to sRGB. **dst** must not have a
 * palette.
 * @param {MemoryImage} linear - The linear light image.
 * @param {MemoryImage} dst - The image to write into.
 */
export function writeSrgb(linear: MemoryImage, dst: MemoryImage): void {
  for (let i = 0; i < dst.numFrames; ++i) {
    writeSrgbFrame(linear.frames[i], dst.frames[i]);
  }
}

/**
 * Writes the single frame **linear** into the frame **dst**, which has the same
 * size and number of channels, with its colors converted back to sRGB.
 * @param {MemoryImage} linear - The linear light frame.
 * @param {MemoryImage} dst - The frame to write into.
 */
export function writeSrgbFrame(linear: MemoryImage, dst: MemoryImage): void {
  const nc = linear.numChannels;
  const alpha = alphaChannel(nc);
  const src = (linear.data as MemoryImageDataFloat32).data;
  const data = dst.data;
  if (data instanceof MemoryImageDataUint8) {
    const bytes = data.data;
    const n = linear.width * linear.height * nc;
    for (let i = 0, c = 0; i < n; ++i) {
      const v = src[i];
      bytes[i] =
        c === alpha
          ? Math.round(MathUtils.clamp(v * 255, 0, 255))
          : linearToSrgb8(v);
      if (++c === nc) {
        c = 0;
      }
    }
    return;
  }
  const type = dst.formatType;
  const isFloat = type === FormatType.float;
  const lo = type === FormatType.int ? -1.0 : 0.0;
  let i = 0;
  for (const p of dst) {
    const max = p.maxChannelValue;
    for (let c = 0; c < nc; ++c, ++i) {
      let v = src[i];
      if (c !== alpha) {
        v = ColorUtils.linearToSrgb(v);
      }
      p.setChannel(
        c,
        isFloat ? v * max : Math.round(MathUtils.clamp(v, lo, 1.0) * max)
      );
    }
  }
}
