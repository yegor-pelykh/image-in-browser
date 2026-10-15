/** @format */

import { MathUtils } from '../common/math-utils.js';
import { OutputBuffer } from '../common/output-buffer.js';
import { Color } from '../color/color.js';
import { LibError } from '../error/lib-error.js';
import { IccProfile } from '../image/icc-profile.js';
import { IccProfileCompression } from '../image/icc-profile-compression.js';
import { MemoryImage } from '../image/image.js';
import { checkEncode } from './check-encode.js';
import { Encoder, EncoderEncodeOptions } from './encoder.js';
import { VP8Config } from './webp/vp8-config.js';
import { encodeVP8 } from './webp/vp8-encoder.js';
import { VP8LEncoder } from './webp/vp8l-encoder.js';
import {
  WebPChunk,
  animChunkData,
  anmfChunkData,
  buildRiff,
  vp8xChunkData,
  vp8xFlags,
} from './webp/webp-chunk.js';

/**
 * Encode an image to the WebP format (losslessly by default).
 *
 * **{@link lossless} is on by default**, and it makes {@link quality}, {@link method} and
 * {@link alphaQuality} do nothing, so an encoder built with a quality alone will
 * quietly ignore it.
 *
 * Lossless uses the VP8L bitstream, lossy the VP8 one, wrapped either way in a
 * RIFF/WebP container. Animation, an ICC profile and EXIF are carried in the
 * extended format when the image has them.
 */
export class WebPEncoder implements Encoder {
  /**
   * Whether to preserve the colour under fully transparent pixels.
   */
  private readonly _exact: boolean;

  /**
   * Whether to reproduce the image exactly.
   */
  private readonly _lossless: boolean;

  /**
   * Between 0 and 100, how much the lossy encoder may discard.
   */
  private readonly _quality: number;

  /**
   * How much work the lossy encoder puts into each block, 0 to 6.
   */
  private readonly _method: number;

  /**
   * Between 0 and 100, how exactly the alpha plane is kept.
   */
  private readonly _alphaQuality: number;

  /**
   * Creates a WebPEncoder with the given options.
   */
  constructor(
    exact: boolean = true,
    lossless: boolean = true,
    quality: number = 75,
    method: number = 4,
    alphaQuality: number = 100
  ) {
    this._exact = exact;
    this._lossless = lossless;
    this._quality = quality;
    this._method = method;
    this._alphaQuality = alphaQuality;
  }

  /**
   * Indicates whether the encoder supports animation.
   */
  public get supportsAnimation(): boolean {
    return true;
  }

  /**
   * Encodes the given image into a WebP file.
   */
  public encode(opt: EncoderEncodeOptions): Uint8Array {
    checkEncode(opt.image);
    const image = opt.image;
    const singleFrame = (opt as { singleFrame?: boolean }).singleFrame ?? false;
    const animate = !singleFrame && image.hasAnimation;
    if (animate) {
      WebPEncoder.checkFramesFitCanvas(image);
    }
    const exif = WebPEncoder.exifBytes(image);
    const icc = WebPEncoder.iccBytes(image);

    const frame = this.encodeFrame(image);
    // A lossy bitstream cannot carry transparency itself, so a picture that
    // has any needs the extended format even with no metadata at all.
    const hasAlphaChunk = frame.length > 1;

    // Nothing but pixels: the simple container is smaller, and is what every
    // reader handles.
    if (!animate && exif === undefined && icc === undefined && !hasAlphaChunk) {
      return buildRiff(frame);
    }

    const chunks: WebPChunk[] = [
      new WebPChunk(
        'VP8X',
        vp8xChunkData(
          vp8xFlags(
            icc !== undefined,
            hasAlphaChunk || WebPEncoder.hasTransparency(image),
            exif !== undefined,
            false,
            animate
          ),
          image.width,
          image.height
        )
      ),
    ];

    if (icc !== undefined) {
      chunks.push(new WebPChunk('ICCP', icc));
    }

    if (animate) {
      const bg = image.backgroundColor;
      chunks.push(
        new WebPChunk(
          'ANIM',
          animChunkData(
            WebPEncoder.channel8(bg, (c) => c.r),
            WebPEncoder.channel8(bg, (c) => c.g),
            WebPEncoder.channel8(bg, (c) => c.b),
            WebPEncoder.channel8(bg, (c) => c.a),
            image.loopCount
          )
        )
      );
      for (const f of image.frames) {
        chunks.push(
          new WebPChunk(
            'ANMF',
            anmfChunkData(
              0,
              0,
              f.width,
              f.height,
              f.frameDuration,
              true,
              false,
              f === image ? frame : this.encodeFrame(f)
            )
          )
        );
      }
    } else {
      chunks.push(...frame);
    }

    if (exif !== undefined) {
      chunks.push(new WebPChunk('EXIF', exif));
    }
    return buildRiff(chunks);
  }

  /**
   * The chunks that carry one frame: its bitstream, preceded by an alpha
   * plane when the bitstream is lossy and the frame has transparency.
   */
  private encodeFrame(frame: MemoryImage): WebPChunk[] {
    if (this._lossless) {
      return [
        new WebPChunk(
          'VP8L',
          new VP8LEncoder({ exact: this._exact }).encodeVP8L(frame)
        ),
      ];
    }
    const coded = encodeVP8(
      frame,
      new VP8Config({
        quality: this._quality,
        method: this._method,
        exact: this._exact,
        alphaQuality: this._alphaQuality,
      })
    );
    const alpha = coded.alpha;
    const chunks: WebPChunk[] = [];
    if (alpha !== undefined) {
      chunks.push(new WebPChunk('ALPH', alpha));
    }
    chunks.push(new WebPChunk('VP8 ', coded.bitstream));
    return chunks;
  }

  /**
   * libwebp's demuxer rejects the whole file when a frame overruns the
   * canvas, rather than skipping that one frame.
   */
  private static checkFramesFitCanvas(image: MemoryImage): void {
    for (let i = 0; i < image.frames.length; i++) {
      const f = image.frames[i];
      if (f.width > image.width || f.height > image.height) {
        throw new LibError(
          `WebP animation frames must fit the ${image.width}x${image.height} canvas, but frame ${i} is ${f.width}x${f.height}.`
        );
      }
    }
  }

  /**
   * One channel of {@link color}, scaled rather than truncated.
   */
  private static channel8(
    color: Color | undefined,
    channel: (c: Color) => number
  ): number {
    if (color === undefined) {
      return 0;
    }
    const max = color.maxChannelValue;
    const value = channel(color);
    return MathUtils.clampInt255(
      Math.round(max === 255 ? value : (value * 255) / max)
    );
  }

  /**
   * Returns the ICC profile bytes, decompressing if necessary.
   */
  private static iccBytes(image: MemoryImage): Uint8Array | undefined {
    const profile = image.iccProfile;
    if (profile === undefined) {
      return undefined;
    }
    return profile.compression === IccProfileCompression.none
      ? profile.data
      : IccProfile.from(profile).decompressed();
  }

  /**
   * Whether any frame has a pixel that is not fully opaque.
   */
  private static hasTransparency(image: MemoryImage): boolean {
    for (const frame of image.frames) {
      if (!frame.hasAlpha) {
        continue;
      }
      for (const p of frame) {
        if (p.a !== p.maxChannelValue) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Returns the EXIF data bytes, if any.
   */
  private static exifBytes(image: MemoryImage): Uint8Array | undefined {
    if (image.exifData.isEmpty) {
      return undefined;
    }
    const out = new OutputBuffer();
    image.exifData.write(out);
    return out.getBytes();
  }
}
