/** @format */

import { ChannelOrder, ChannelOrderLength } from '../color/channel-order.js';
import { Color } from '../color/color.js';
import { ColorUint8 } from '../color/color-uint8.js';
import { ColorUtils } from '../color/color-utils.js';
import {
  Format,
  FormatMaxValue,
  FormatType,
  getRowStride,
} from '../color/format.js';
import { ArrayUtils } from '../common/array-utils.js';
import { Interpolation } from '../common/interpolation.js';
import { MathUtils } from '../common/math-utils.js';
import { LibError } from '../error/lib-error.js';
import { ExifData } from '../exif/exif-data.js';
import { FrameType } from './frame-type.js';
import { IccProfile } from './icc-profile.js';
import { MemoryImageData } from './image-data.js';
import { MemoryImageDataFloat16 } from './image-data-float16.js';
import { MemoryImageDataFloat32 } from './image-data-float32.js';
import { MemoryImageDataFloat64 } from './image-data-float64.js';
import { MemoryImageDataInt16 } from './image-data-int16.js';
import { MemoryImageDataInt32 } from './image-data-int32.js';
import { MemoryImageDataInt8 } from './image-data-int8.js';
import { MemoryImageDataUint1 } from './image-data-uint1.js';
import { MemoryImageDataUint16 } from './image-data-uint16.js';
import { MemoryImageDataUint2 } from './image-data-uint2.js';
import { MemoryImageDataUint32 } from './image-data-uint32.js';
import { MemoryImageDataUint4 } from './image-data-uint4.js';
import { MemoryImageDataUint8 } from './image-data-uint8.js';
import { Palette } from './palette.js';
import { PaletteFloat16 } from './palette-float16.js';
import { PaletteFloat32 } from './palette-float32.js';
import { PaletteFloat64 } from './palette-float64.js';
import { PaletteInt16 } from './palette-int16.js';
import { PaletteInt32 } from './palette-int32.js';
import { PaletteInt8 } from './palette-int8.js';
import { PaletteUint16 } from './palette-uint16.js';
import { PaletteUint32 } from './palette-uint32.js';
import { PaletteUint8 } from './palette-uint8.js';
import { Pixel, UndefinedPixel } from './pixel.js';

/**
 * Interface for initializing a MemoryImage.
 */
interface MemoryImageInitializeOptions {
  /** Width of the image */
  width: number;
  /** Height of the image */
  height: number;
  /** Format of the image */
  format?: Format;
  /** Number of color channels */
  numChannels?: number;
  /** Whether the image has a palette */
  withPalette?: boolean;
  /** Format of the palette */
  paletteFormat?: Format;
  /** Palette of the image */
  palette?: Palette;
  /** EXIF data of the image */
  exifData?: ExifData;
  /** ICC profile of the image */
  iccProfile?: IccProfile;
}

/**
 * Interface for creating a MemoryImage.
 */
export interface MemoryImageCreateOptions extends MemoryImageInitializeOptions {
  /** Number of times the animation should loop */
  loopCount?: number;
  /** Type of the frame */
  frameType?: FrameType;
  /** Duration of the frame */
  frameDuration?: number;
  /** Index of the frame */
  frameIndex?: number;
  /** Background color of the image */
  backgroundColor?: Color;
  /** Text data associated with the image */
  textData?: Map<string, string>;
}

/**
 * Interface for creating a MemoryImage from bytes.
 */
export interface MemoryImageFromBytesOptions extends MemoryImageCreateOptions {
  /** Byte data of the image */
  bytes: ArrayBufferLike;
  /** Offset to start reading bytes */
  byteOffset?: number;
  /** Row stride of the image data */
  rowStride?: number;
  /** Order of the color channels */
  channelOrder?: ChannelOrder;
}

/**
 * Interface for cloning a MemoryImage.
 */
export interface MemoryImageCloneOptions {
  /** Whether to skip animation frames */
  skipAnimation?: boolean;
  /** Whether to skip pixel data */
  skipPixels?: boolean;
}

/**
 * Interface for converting a MemoryImage.
 */
export interface MemoryImageConvertOptions {
  /** Format to convert to */
  format?: Format;
  /** Number of color channels */
  numChannels?: number;
  /** Alpha value for the new format */
  alpha?: number;
  /** Whether the new image should have a palette */
  withPalette?: boolean;
  /** Whether to skip animation frames */
  skipAnimation?: boolean;
}

/**
 * Interface for color extremes in a MemoryImage.
 */
export interface MemoryImageColorExtremes {
  /** Minimum color value */
  min: number;
  /** Maximum color value */
  max: number;
}

/**
 * Interface for getting bytes from a MemoryImage.
 */
export interface MemoryImageGetBytesOptions {
  /** Order of the color channels */
  order?: ChannelOrder;
  /** Alpha value for the new format */
  alpha?: number;
}

/**
 * A MemoryImage is a container for MemoryImageData and other various metadata
 * representing an image in memory.
 */
export class MemoryImage implements Iterable<Pixel> {
  private _data?: MemoryImageData;

  /**
   * Gets the image data.
   * @returns {MemoryImageData | undefined} The image data.
   */
  public get data(): MemoryImageData | undefined {
    return this._data;
  }

  /**
   * The format of the image pixels.
   */
  public get format(): Format {
    return this._data?.format ?? Format.uint8;
  }

  /**
   * Checks if the image has a palette.
   * @returns {boolean} True if the image has a palette, otherwise false.
   */
  public get hasPalette(): boolean {
    return this._data?.palette !== undefined;
  }

  /**
   * Gets the palette of the image.
   * @returns {Palette | undefined} The palette of the image.
   */
  public get palette(): Palette | undefined {
    return this._data?.palette;
  }

  /**
   * Sets the palette of the image.
   * @param {Palette | undefined} p - The palette to set.
   */
  public set palette(p: Palette | undefined) {
    if (this._data !== undefined) {
      this._data.palette = p;
    }
  }

  /**
   * Gets the number of channels.
   * @returns {number} The number of channels.
   */
  public get numChannels(): number {
    return this.palette?.numChannels ?? this._data?.numChannels ?? 0;
  }

  /**
   * Checks if the image has animation frames.
   * @returns {boolean} True if there is more than one frame, otherwise false.
   */
  public get hasAnimation(): boolean {
    return this._frames.length > 1;
  }

  /**
   * The number of frames in this MemoryImage. A MemoryImage will have at least one
   * frame, itself, so it's considered animated if it has more than one
   * frame.
   * @returns {number} The number of frames.
   */
  public get numFrames(): number {
    return this._frames.length;
  }

  private _exifData?: ExifData;

  /**
   * The EXIF metadata for the image. If an ExifData hasn't been created
   * for the image yet, one will be added.
   * @returns {ExifData} The EXIF metadata.
   */
  public get exifData(): ExifData {
    this._exifData ??= new ExifData();
    return this._exifData;
  }

  /**
   * Sets the EXIF metadata for the image.
   * @param {ExifData} exif - The EXIF metadata to set.
   */
  public set exifData(exif: ExifData) {
    this._exifData = exif;
  }

  /**
   * The maximum value of a pixel channel, based on the format of the image.
   * If the image has a palette, this will be the maximum value of a palette
   * color channel. Float format images will have a maxChannelValue of 1,
   * though they can have values above that.
   * @returns {number} The maximum value of a pixel channel.
   */
  public get maxChannelValue(): number {
    return this._data?.maxChannelValue ?? 0;
  }

  /**
   * The maximum value of a palette index, based on the format of the image.
   * This differs from maxChannelValue in that it will not be affected by
   * the format of the palette.
   * @returns {number} The maximum value of a palette index.
   */
  public get maxIndexValue(): number {
    return this.data?.maxIndexValue ?? 0;
  }

  /**
   * Indicates whether this image supports using a palette.
   * @returns {boolean} True if the image supports using a palette, otherwise false.
   */
  public get supportsPalette(): boolean {
    return (
      this.format === Format.uint1 ||
      this.format === Format.uint2 ||
      this.format === Format.uint4 ||
      this.format === Format.uint8 ||
      this.format === Format.uint16
    );
  }

  /**
   * The width of the image in pixels.
   * @returns {number} The width of the image.
   */
  public get width(): number {
    return this.data?.width ?? 0;
  }

  /**
   * The height of the image in pixels.
   * @returns {number} The height of the image.
   */
  public get height(): number {
    return this.data?.height ?? 0;
  }

  /**
   * The general type of the format, whether it's uint data, int data, or
   * float data (regardless of precision).
   * @returns {FormatType} The format type.
   */
  public get formatType(): FormatType {
    return this.data?.formatType ?? FormatType.uint;
  }

  /**
   * Indicates whether this image is valid and has data.
   * @returns {boolean} True if the image is valid, otherwise false.
   */
  public get isValid(): boolean {
    return this._data !== undefined && this.width > 0 && this.height > 0;
  }

  /**
   * The ArrayBufferLike of the image storage data or undefined if not initialized.
   * @returns {ArrayBufferLike | undefined} The buffer of the image data.
   */
  public get buffer(): ArrayBufferLike | undefined {
    return this._data?.buffer;
  }

  /**
   * The length in bytes of the image data buffer.
   * @returns {number} The byte length of the image data buffer.
   */
  public get byteLength(): number {
    return this._data?.buffer.byteLength ?? 0;
  }

  /**
   * The length in bytes of a row of pixels in the image buffer.
   * @returns {number} The row stride of the image data buffer.
   */
  public get rowStride(): number {
    return this._data?.rowStride ?? 0;
  }

  /**
   * Indicates whether this image is a Low Dynamic Range (regular) image.
   * @returns {boolean} True if the image is a Low Dynamic Range image, otherwise false.
   */
  public get isLdrFormat(): boolean {
    return this._data?.isLdrFormat ?? false;
  }

  /**
   * Indicates whether this image is a High Dynamic Range image.
   * @returns {boolean} True if the image is a High Dynamic Range image, otherwise false.
   */
  public get isHdrFormat(): boolean {
    return this._data?.isHdrFormat ?? false;
  }

  /**
   * The number of bits per color channel.
   * @returns {number} The number of bits per color channel.
   */
  public get bitsPerChannel(): number {
    return this._data?.bitsPerChannel ?? 0;
  }

  /**
   * Indicates whether this MemoryImage has an alpha channel.
   * @returns {boolean} True if the image has an alpha channel, otherwise false.
   */
  public get hasAlpha(): boolean {
    return this.numChannels === 2 || this.numChannels === 4;
  }

  /**
   * Named non-color channels used by this image.
   */
  private _extraChannels?: Map<string, MemoryImageData>;

  private _iccProfile: IccProfile | undefined;

  /**
   * Gets the ICC profile of the image.
   * @returns {IccProfile | undefined} The ICC profile of the image.
   */
  public get iccProfile(): IccProfile | undefined {
    return this._iccProfile;
  }

  /**
   * Sets the ICC profile of the image.
   * @param {IccProfile | undefined} v - The ICC profile to set.
   */
  public set iccProfile(v: IccProfile | undefined) {
    this._iccProfile = v;
  }

  private _textData: Map<string, string> | undefined;

  /**
   * Gets the text data associated with the image.
   * @returns {Map<string, string> | undefined} The text data.
   */
  public get textData(): Map<string, string> | undefined {
    return this._textData;
  }

  private _backgroundColor?: Color;

  /**
   * The suggested background color to clear the canvas with.
   * @returns {Color | undefined} The background color.
   */
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  /**
   * Sets the background color of the image.
   * @param {Color | undefined} v - The background color to set.
   */
  public set backgroundColor(v: Color | undefined) {
    this._backgroundColor = v;
  }

  private _loopCount: number;

  /**
   * How many times should the animation loop (0 means forever)
   * @returns {number} The loop count.
   */
  public get loopCount(): number {
    return this._loopCount;
  }

  /**
   * Sets the loop count of the animation.
   * @param {number} v - The loop count to set.
   */
  public set loopCount(v: number) {
    this._loopCount = v;
  }

  private _frameType: FrameType;

  /**
   * Gets or sets how should the frames be interpreted.
   * If the frameType is FrameType.animation, the frames are part
   * of an animated sequence. If the frameType is FrameType.page,
   * the frames are the pages of a document.
   * @returns {FrameType} The frame type.
   */
  public get frameType(): FrameType {
    return this._frameType;
  }

  /**
   * Sets the frame type of the image.
   * @param {FrameType} v - The frame type to set.
   */
  public set frameType(v: FrameType) {
    this._frameType = v;
  }

  /**
   * The list of sub-frames for the image, if it's an animation. An image
   * is considered animated if it has more than one frame, as the first
   * frame will be the image itself.
   * @returns {MemoryImage[]} The list of sub-frames.
   */
  private _frames: MemoryImage[] = [];

  /**
   * Gets the frames of the image.
   * @returns {MemoryImage[]} The frames of the image.
   */
  public get frames(): MemoryImage[] {
    return this._frames;
  }

  private _frameDuration: number;

  /**
   * How long this frame should be displayed, in milliseconds.
   * A duration of 0 indicates no delay and the next frame will be drawn
   * as quickly as it can.
   * @returns {number} The frame duration.
   */
  public get frameDuration(): number {
    return this._frameDuration;
  }

  /**
   * Sets the frame duration of the image.
   * @param {number} v - The frame duration to set.
   */
  public set frameDuration(v: number) {
    this._frameDuration = v;
  }

  /**
   * Index of this image in the parent animations frame list.
   * @returns {number} The frame index.
   */
  private _frameIndex: number;

  /**
   * Gets the frame index of the image.
   * @returns {number} The frame index.
   */
  public get frameIndex(): number {
    return this._frameIndex;
  }

  /**
   * Sets the frame index of the image.
   * @param {number} v - The frame index to set.
   */
  public set frameIndex(v: number) {
    this._frameIndex = v;
  }

  /**
   * Constructs a new MemoryImage.
   * @param {MemoryImageCreateOptions} [opt] - The options for creating the MemoryImage.
   */
  constructor(opt?: MemoryImageCreateOptions) {
    if (opt !== undefined) {
      this._loopCount = opt.loopCount ?? 0;
      this._frameType = opt.frameType ?? FrameType.sequence;
      this._frameDuration = opt.frameDuration ?? 0;
      this._frameIndex = opt.frameIndex ?? 0;
      this._backgroundColor = opt.backgroundColor;
      this._textData = opt.textData;
      this._frames.push(this);
      this.initialize({
        width: opt.width,
        height: opt.height,
        format: opt.format ?? Format.uint8,
        numChannels: opt.numChannels ?? 3,
        withPalette: opt.withPalette ?? false,
        paletteFormat: opt.paletteFormat ?? Format.uint8,
        palette: opt.palette,
        exifData: opt.exifData,
        iccProfile: opt.iccProfile,
      });
    } else {
      // create an empty image
      this._loopCount = 0;
      this._frameType = FrameType.sequence;
      this._frameDuration = 0;
      this._frameIndex = 0;
    }
  }

  /**
   * Gets the number of pixel colors based on the format.
   * @param {Format} format - The format of the image.
   * @returns {number} The number of pixel colors.
   */
  private static getNumPixelColors(format: Format): number {
    return format === Format.uint1
      ? 2
      : format === Format.uint2
        ? 4
        : format === Format.uint4
          ? 16
          : format === Format.uint8
            ? 256
            : format === Format.uint16
              ? 65536
              : 0;
  }

  /**
   * Creates a resized MemoryImage from another MemoryImage.
   * @param {MemoryImage} other - The other MemoryImage to resize.
   * @param {number} width - The width of the new image.
   * @param {number} height - The height of the new image.
   * @param {boolean} [skipAnimation=false] - Whether to skip animation frames.
   * @returns {MemoryImage} The resized MemoryImage.
   */
  public static fromResized(
    other: MemoryImage,
    width: number,
    height: number,
    skipAnimation = false
  ): MemoryImage {
    const image = new MemoryImage({
      width: width,
      height: height,
      loopCount: other._loopCount,
      frameType: other._frameType,
      frameDuration: other._frameDuration,
      frameIndex: other._frameIndex,
      backgroundColor: other._backgroundColor?.clone(),
      format: other.format,
      numChannels: other.numChannels,
      withPalette: other.hasPalette,
      paletteFormat: other.palette?.format,
      palette: other.palette,
      exifData: other._exifData?.clone(),
      iccProfile: other._iccProfile?.clone(),
      textData:
        other._textData !== undefined
          ? new Map<string, string>(other._textData)
          : undefined,
    });

    if (other._extraChannels !== undefined) {
      image._extraChannels = new Map<string, MemoryImageData>(
        other._extraChannels
      );
    }

    if (!skipAnimation) {
      const numFrames = other.numFrames;
      for (let fi = 1; fi < numFrames; ++fi) {
        const frame = other._frames[fi];
        image.addFrame(MemoryImage.fromResized(frame, width, height));
      }
    }

    return image;
  }

  /**
   * Creates a copy of the given **other** MemoryImage.
   */
  public static from(
    other: MemoryImage,
    skipAnimation = false,
    skipPixels = false
  ): MemoryImage {
    const image = new MemoryImage();
    image._data = other.data?.clone(skipPixels);
    image._exifData = other._exifData?.clone();
    image._iccProfile = other.iccProfile?.clone();
    image._frameType = other.frameType;
    image._loopCount = other._loopCount;
    image._backgroundColor = other._backgroundColor?.clone();
    image._frameDuration = other._frameDuration;
    image._frameIndex = other._frameIndex;
    if (other._extraChannels !== undefined) {
      image._extraChannels = new Map<string, MemoryImageData>(
        other._extraChannels
      );
    }
    if (other._textData !== undefined) {
      image._textData = new Map<string, string>(other.textData);
    }
    image._frames.push(image);
    if (!skipAnimation && other.hasAnimation) {
      const numFrames = other.numFrames;
      for (let fi = 1; fi < numFrames; ++fi) {
        const frame = other._frames[fi];
        image.addFrame(MemoryImage.from(frame));
      }
    }
    return image;
  }

  /**
   * Create an image from raw data in **bytes**.
   *
   * **format** defines the data type of pixel channel values. _Format.uint8_
   * is the most typical format for images, where each pixel value is an
   * unsigned byte with values in the range [0, 255].
   *
   * **rowStride** is the row stride, in bytes, of the source data **bytes**.
   * This may be different than the rowStride of the MemoryImage, as some data
   * sources align rows to different byte alignments and include padding.
   *
   * **byteOffset** can be specified to start reading the **bytes**
   * data starting from that value.
   *
   * **numChannels** can be used to specify the number of pixel channels in the
   * **bytes** data, defaulting to 3.
   *
   * **order** can be used if the source **bytes** has a different channel order
   * than RGBA. _ChannelOrder.bgra_ will rearrange the color channels from
   * BGRA to what MemoryImage wants, RGBA.
   *
   */
  public static fromBytes(opt: MemoryImageFromBytesOptions): MemoryImage {
    const byteOffset = opt.byteOffset ?? 0;

    const image = new MemoryImage();
    image._loopCount = opt.loopCount ?? 0;
    image._frameType = opt.frameType ?? FrameType.sequence;
    image._frameDuration = opt.frameDuration ?? 0;
    image._frameIndex = opt.frameIndex ?? 0;
    image._backgroundColor = opt.backgroundColor;
    image._textData = opt.textData;
    image._frames.push(image);

    const format = opt.format ?? Format.uint8;
    const withPalette = opt.withPalette ?? false;
    const paletteFormat = opt.paletteFormat ?? Format.uint8;
    const numChannels =
      opt.numChannels ??
      (opt.channelOrder !== undefined
        ? ChannelOrderLength.get(opt.channelOrder)!
        : 3);

    if (numChannels < 0 || numChannels > 4) {
      throw new LibError('A MemoryImage can only have 1-4 channels.');
    }

    let channelOrder =
      opt.channelOrder ??
      (numChannels === 3
        ? ChannelOrder.rgb
        : numChannels === 4
          ? ChannelOrder.rgba
          : numChannels === 1
            ? ChannelOrder.red
            : ChannelOrder.grayAlpha);

    if (numChannels === 1) {
      // There is only one channel order
      channelOrder = ChannelOrder.red;
    } else if (numChannels === 2) {
      // There is only one channel order
      channelOrder = ChannelOrder.grayAlpha;
    } else if (numChannels === 3) {
      if (
        channelOrder !== ChannelOrder.rgb &&
        channelOrder !== ChannelOrder.bgr
      ) {
        // The user asked for a channel order that conflicts with the number
        // of channels.
        channelOrder = ChannelOrder.rgb;
      }
    } else if (numChannels === 4) {
      if (
        channelOrder !== ChannelOrder.bgra &&
        channelOrder !== ChannelOrder.rgba &&
        channelOrder !== ChannelOrder.abgr &&
        channelOrder !== ChannelOrder.argb
      ) {
        // The user asked for a channel order that conflicts with the number
        // of channels.
        channelOrder = ChannelOrder.rgba;
      }
    }

    image.initialize({
      width: opt.width,
      height: opt.height,
      format: format,
      numChannels: numChannels,
      withPalette: withPalette,
      paletteFormat: paletteFormat,
      palette: opt.palette,
      exifData: opt.exifData,
      iccProfile: opt.iccProfile,
    });

    if (image.data !== undefined) {
      const toBytes = image.data.toUint8Array();
      const fromBytes = new Uint8Array(opt.bytes, byteOffset);

      const rowStride =
        opt.rowStride ?? getRowStride(opt.width, numChannels, format);
      const dataStride = image.data.rowStride;
      const stride = Math.min(rowStride, dataStride);

      let dOff = 0;
      let bOff = 0;
      for (
        let y = 0;
        y < opt.height;
        ++y, bOff += rowStride, dOff += dataStride
      ) {
        ArrayUtils.copyRange(fromBytes, bOff, toBytes, dOff, stride);
      }

      if (numChannels === 3 && channelOrder === ChannelOrder.bgr) {
        for (const p of image) {
          const r = p.r;
          p.r = p.b;
          p.b = r;
        }
      } else if (numChannels === 4 && channelOrder === ChannelOrder.abgr) {
        for (const p of image) {
          const r = p.r;
          const g = p.g;
          const b = p.b;
          const a = p.a;
          p.r = a;
          p.g = b;
          p.b = g;
          p.a = r;
        }
      } else if (numChannels === 4 && channelOrder === ChannelOrder.argb) {
        for (const p of image) {
          const r = p.r;
          const g = p.g;
          const b = p.b;
          const a = p.a;
          p.r = a;
          p.g = r;
          p.b = g;
          p.a = b;
        }
      } else if (numChannels === 4 && channelOrder === ChannelOrder.bgra) {
        for (const p of image) {
          const r = p.r;
          const g = p.g;
          const b = p.b;
          const a = p.a;
          p.r = b;
          p.g = g;
          p.b = r;
          p.a = a;
        }
      }
    }
    return image;
  }

  /**
   * Initializes the memory image with the provided options.
   *
   * @param {MemoryImageInitializeOptions} opt - The options for initializing the memory image.
   * @param {Format} [opt.format] - The format of the image. Defaults to `Format.uint8`.
   * @param {number} [opt.numChannels] - The number of channels in the image. Defaults to 3.
   * @param {boolean} [opt.withPalette] - Whether to use a palette. Defaults to `false`.
   * @param {Format} [opt.paletteFormat] - The format of the palette. Defaults to `Format.uint8`.
   * @param {ICCProfile} [opt.iccProfile] - The ICC profile for the image.
   * @param {ExifData} [opt.exifData] - The EXIF data for the image.
   * @param {Palette} [opt.palette] - The palette for the image.
   * @param {number} opt.width - The width of the image.
   * @param {number} opt.height - The height of the image.
   */
  private initialize(opt: MemoryImageInitializeOptions): void {
    const format = opt.format ?? Format.uint8;
    const numChannels = opt.numChannels ?? 3;
    const withPalette = opt.withPalette ?? false;
    const paletteFormat = opt.paletteFormat ?? Format.uint8;

    this._iccProfile = opt.iccProfile;

    if (opt.exifData !== undefined) {
      this._exifData = opt.exifData.clone();
    }

    const palette =
      opt.palette ??
      (withPalette && this.supportsPalette
        ? this.createPalette(format, paletteFormat, numChannels)
        : undefined);

    this.createImageData(opt.width, opt.height, format, numChannels, palette);
  }

  /**
   * Creates image data based on the specified parameters.
   *
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {Format} format - The format of the image data.
   * @param {number} numChannels - The number of channels in the image data.
   * @param {Palette} [palette] - Optional palette for indexed formats.
   */
  private createImageData(
    width: number,
    height: number,
    format: Format,
    numChannels: number,
    palette?: Palette
  ): void {
    switch (format) {
      case Format.uint1:
        if (palette === undefined) {
          this._data = new MemoryImageDataUint1(width, height, numChannels);
        } else {
          this._data = MemoryImageDataUint1.palette(width, height, palette);
        }
        break;
      case Format.uint2:
        if (palette === undefined) {
          this._data = new MemoryImageDataUint2(width, height, numChannels);
        } else {
          this._data = MemoryImageDataUint2.palette(width, height, palette);
        }
        break;
      case Format.uint4:
        if (palette === undefined) {
          this._data = new MemoryImageDataUint4(width, height, numChannels);
        } else {
          this._data = MemoryImageDataUint4.palette(width, height, palette);
        }
        break;
      case Format.uint8:
        if (palette === undefined) {
          this._data = new MemoryImageDataUint8(width, height, numChannels);
        } else {
          this._data = MemoryImageDataUint8.palette(width, height, palette);
        }
        break;
      case Format.uint16:
        if (palette === undefined) {
          this._data = new MemoryImageDataUint16(width, height, numChannels);
        } else {
          this._data = MemoryImageDataUint16.palette(width, height, palette);
        }
        break;
      case Format.uint32:
        this._data = new MemoryImageDataUint32(width, height, numChannels);
        break;
      case Format.int8:
        this._data = new MemoryImageDataInt8(width, height, numChannels);
        break;
      case Format.int16:
        this._data = new MemoryImageDataInt16(width, height, numChannels);
        break;
      case Format.int32:
        this._data = new MemoryImageDataInt32(width, height, numChannels);
        break;
      case Format.float16:
        this._data = new MemoryImageDataFloat16(width, height, numChannels);
        break;
      case Format.float32:
        this._data = new MemoryImageDataFloat32(width, height, numChannels);
        break;
      case Format.float64:
        this._data = new MemoryImageDataFloat64(width, height, numChannels);
        break;
    }
  }

  /**
   * Creates a palette based on the specified format and palette format.
   *
   * @param {Format} format - The format of the image.
   * @param {Format} paletteFormat - The format of the palette to be created.
   * @param {number} numChannels - The number of color channels in the palette.
   * @returns {Palette | undefined} A Palette object of the specified format, or undefined if the format is not supported.
   * @throws {LibError} If the palette format is unknown.
   */
  private createPalette(
    format: Format,
    paletteFormat: Format,
    numChannels: number
  ): Palette | undefined {
    switch (paletteFormat) {
      case Format.uint1:
        return undefined;
      case Format.uint2:
        return undefined;
      case Format.uint4:
        return undefined;
      case Format.uint8:
        return new PaletteUint8(
          MemoryImage.getNumPixelColors(format),
          numChannels
        );
      case Format.uint16:
        return new PaletteUint16(
          MemoryImage.getNumPixelColors(format),
          numChannels
        );
      case Format.uint32:
        return new PaletteUint32(
          MemoryImage.getNumPixelColors(format),
          numChannels
        );
      case Format.int8:
        return new PaletteInt8(
          MemoryImage.getNumPixelColors(format),
          numChannels
        );
      case Format.int16:
        return new PaletteInt16(
          MemoryImage.getNumPixelColors(format),
          numChannels
        );
      case Format.int32:
        return new PaletteInt32(
          MemoryImage.getNumPixelColors(format),
          numChannels
        );
      case Format.float16:
        return new PaletteFloat16(
          MemoryImage.getNumPixelColors(format),
          numChannels
        );
      case Format.float32:
        return new PaletteFloat32(
          MemoryImage.getNumPixelColors(format),
          numChannels
        );
      case Format.float64:
        return new PaletteFloat64(
          MemoryImage.getNumPixelColors(format),
          numChannels
        );
    }
    throw new LibError('Unknown palette format.');
  }

  /**
   * Adds a frame to the current image sequence.
   * If no image is provided, a new MemoryImage is created from the current instance.
   *
   * @param {MemoryImage} [image] - The image to be added as a frame. If not provided, a new MemoryImage is created.
   * @returns {MemoryImage} The added or newly created MemoryImage.
   */
  public addFrame(image?: MemoryImage): MemoryImage {
    const img = image ?? MemoryImage.from(this, true, true);
    img._frameIndex = this._frames.length;
    if (this._frames[this._frames.length - 1] !== img) {
      this._frames.push(img);
    }
    return img;
  }

  /**
   * Retrieves the frame at the specified index.
   *
   * @param {number} index - The index of the frame to retrieve.
   * @returns {MemoryImage} The MemoryImage object at the specified index.
   */
  public getFrame(index: number): MemoryImage {
    return this._frames[index];
  }

  /**
   * Creates a clone of the current MemoryImage instance.
   *
   * @param {MemoryImageCloneOptions} [opt] - Optional parameters for cloning.
   * @param {boolean} [opt.skipAnimation=false] - If true, skips cloning the animation data.
   * @param {boolean} [opt.skipPixels=false] - If true, skips cloning the pixel data.
   * @returns {MemoryImage} A new MemoryImage instance that is a clone of the current instance.
   */
  public clone(opt?: MemoryImageCloneOptions): MemoryImage {
    const skipAnimation = opt?.skipAnimation ?? false;
    const skipPixels = opt?.skipPixels ?? false;
    return MemoryImage.from(this, skipAnimation, skipPixels);
  }

  /**
   * Checks if an extra channel with the given name exists.
   *
   * @param {string} name - The name of the channel to check.
   * @returns {boolean} Returns true if the extra channel exists, otherwise false.
   */
  public hasExtraChannel(name: string): boolean {
    return this._extraChannels !== undefined && this._extraChannels.has(name);
  }

  /**
   * Retrieves the extra channel data by its name.
   *
   * @param {string} name - The name of the extra channel to retrieve.
   * @returns {MemoryImageData | undefined} The data of the extra channel if it exists, otherwise undefined.
   */
  public getExtraChannel(name: string): MemoryImageData | undefined {
    return this._extraChannels !== undefined
      ? this._extraChannels.get(name)
      : undefined;
  }

  /**
   * Sets or removes an extra channel with the given name and data.
   *
   * @param {string} name - The name of the extra channel.
   * @param {MemoryImageData} [data] - Optional. The data to be associated with the extra channel. If undefined, the extra channel will be removed.
   */
  public setExtraChannel(name: string, data?: MemoryImageData): void {
    if (this._extraChannels === undefined && data === undefined) {
      return;
    }

    this._extraChannels ??= new Map<string, MemoryImageData>();

    if (data === undefined) {
      this._extraChannels.delete(name);
    } else {
      this._extraChannels.set(name, data);
    }

    if (this._extraChannels.size === 0) {
      this._extraChannels = undefined;
    }
  }

  /**
   * Retrieves an iterator for a range of pixels within the specified rectangular area.
   *
   * @param {number} x - The x-coordinate of the top-left corner of the rectangular area.
   * @param {number} y - The y-coordinate of the top-left corner of the rectangular area.
   * @param {number} width - The width of the rectangular area.
   * @param {number} height - The height of the rectangular area.
   * @returns {Iterator<Pixel>} An iterator for the pixels within the specified range.
   */
  public getRange(
    x: number,
    y: number,
    width: number,
    height: number
  ): Iterator<Pixel> {
    return this.data!.getRange(x, y, width, height);
  }

  /**
   * Converts the image storage data to a Uint8Array.
   *
   * @returns {Uint8Array} The Uint8Array representation of the image storage data.
   */
  public toUint8Array(): Uint8Array {
    return (
      this._data?.toUint8Array() ??
      (this.buffer !== undefined
        ? new Uint8Array(this.buffer)
        : new Uint8Array())
    );
  }

  /**
   * Retrieves the byte representation of the image.
   *
   * @param {MemoryImageGetBytesOptions} [opt] - Optional parameters for getting bytes.
   * @param {string} [opt.order] - The order of the channels.
   * @param {boolean} [opt.alpha] - Whether to include the alpha channel.
   * @returns {Uint8Array} The byte array representation of the image.
   */
  public getBytes(opt?: MemoryImageGetBytesOptions): Uint8Array {
    const order = opt?.order;
    const alpha = opt?.alpha;

    if (order !== undefined) {
      const length = ChannelOrderLength.get(order);
      if (length !== this.numChannels) {
        const self = this.convert({
          numChannels: length,
          alpha: alpha,
        });
        return (
          self.data?.getBytes({
            order: order,
            inPlace: true,
          }) ?? this.toUint8Array()
        );
      } else {
        return (
          this.data?.getBytes({
            order: order,
            inPlace: false,
          }) ?? this.toUint8Array()
        );
      }
    } else {
      return (
        this.data?.getBytes({
          order: order,
        }) ?? this.toUint8Array()
      );
    }
  }

  /**
   * Remaps the color channels of the pixels based on the specified order.
   *
   * @param {ChannelOrder} order - The desired channel order to remap the pixels to.
   *
   * The method supports the following channel orders:
   *
   * For 4-channel images (RGBA):
   *   - ChannelOrder.abgr: Swaps RGBA to ABGR.
   *   - ChannelOrder.argb: Swaps RGBA to ARGB.
   *   - ChannelOrder.bgra: Swaps RGBA to BGRA.
   *
   * For 3-channel images (RGB):
   *   - ChannelOrder.bgr: Swaps RGB to BGR.
   */
  public remapChannels(order: ChannelOrder): void {
    if (this.numChannels === 4) {
      if (
        order === ChannelOrder.abgr ||
        order === ChannelOrder.argb ||
        order === ChannelOrder.bgra
      ) {
        if (order === ChannelOrder.abgr) {
          for (const p of this) {
            const r = p.r;
            const g = p.g;
            const b = p.b;
            const a = p.a;
            p.r = a;
            p.g = b;
            p.b = g;
            p.a = r;
          }
        } else if (order === ChannelOrder.argb) {
          for (const p of this) {
            const r = p.r;
            const g = p.g;
            const b = p.b;
            const a = p.a;
            p.r = a;
            p.g = r;
            p.b = g;
            p.a = b;
          }
        } else if (order === ChannelOrder.bgra) {
          for (const p of this) {
            const r = p.r;
            const g = p.g;
            const b = p.b;
            const a = p.a;
            p.r = b;
            p.g = g;
            p.b = r;
            p.a = a;
          }
        }
      }
    } else if (this.numChannels === 3) {
      if (order === ChannelOrder.bgr) {
        for (const p of this) {
          const r = p.r;
          p.r = p.b;
          p.b = r;
        }
      }
    }
  }

  /**
   * Checks if the given coordinates (x, y) are within the bounds of the defined width and height.
   *
   * @param {number} x - The x-coordinate to check.
   * @param {number} y - The y-coordinate to check.
   * @returns {boolean} True if the coordinates are within bounds, false otherwise.
   */
  public isBoundsSafe(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  /**
   * Retrieves a color based on the provided RGBA values with the format
   * and number of channels of the image.
   *
   * @param {number} r - The red component of the color (0-255).
   * @param {number} g - The green component of the color (0-255).
   * @param {number} b - The blue component of the color (0-255).
   * @param {number} [a] - The optional alpha component of the color (0-255). If not provided, a default value may be used.
   * @returns {Color} The color object corresponding to the provided RGBA values. If the color cannot be retrieved, a default color is returned.
   */
  public getColor(r: number, g: number, b: number, a?: number): Color {
    return this._data?.getColor(r, g, b, a) ?? new ColorUint8(0);
  }

  /**
   * Retrieves the pixel at the specified coordinates.
   *
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Pixel} [pixel] - Optional. An existing Pixel object to populate with the pixel data.
   * @returns {Pixel} The pixel at the specified coordinates, or UndefinedPixel if the data is not available.
   */
  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    return this._data?.getPixel(x, y, pixel) ?? UndefinedPixel;
  }

  /**
   * Retrieves a pixel from the specified coordinates safely.
   * If the coordinates are out of bounds, it returns an UndefinedPixel.
   *
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Pixel} [pixel] - An optional pixel object to be populated with the pixel data.
   * @returns {Pixel} The pixel at the specified coordinates, or UndefinedPixel if out of bounds.
   */
  public getPixelSafe(x: number, y: number, pixel?: Pixel): Pixel {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return UndefinedPixel;
    }
    return this.getPixel(x, y, pixel);
  }

  /**
   * Retrieves a pixel from the image, ensuring the coordinates are clamped within the image boundaries.
   *
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Pixel} [pixel] - Optional. An existing Pixel object to populate with the pixel data.
   * @returns {Pixel} The Pixel object at the clamped coordinates.
   */
  public getPixelClamped(x: number, y: number, pixel?: Pixel): Pixel {
    const _x = MathUtils.clamp(x, 0, this.width - 1);
    const _y = MathUtils.clamp(y, 0, this.height - 1);
    return this.getPixel(_x, _y, pixel);
  }

  /**
   * Retrieves the pixel index at the specified (x, y) coordinates.
   *
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @returns {number} The index of the pixel, truncated to an integer. Returns 0 if the index is undefined.
   */
  public getPixelIndex(x: number, y: number): number {
    const index = this._data?.getPixel(x, y).index;
    return index !== undefined ? Math.trunc(index) : 0;
  }

  /**
   * Retrieves the interpolated pixel color at the specified coordinates.
   *
   * @param {number} fx - The x-coordinate.
   * @param {number} fy - The y-coordinate.
   * @param {Interpolation} [interpolation=Interpolation.linear] - The interpolation method to use (default is Interpolation.linear).
   * @returns {Color} The interpolated color at the specified coordinates.
   * @throws {LibError} If an unknown interpolation mode is provided.
   */
  public getPixelInterpolate(
    fx: number,
    fy: number,
    interpolation = Interpolation.linear
  ): Color {
    switch (interpolation) {
      case Interpolation.nearest:
        return this.getPixelSafe(Math.trunc(fx), Math.trunc(fy));
      case Interpolation.linear:
      case Interpolation.average:
        return this.getPixelLinear(fx, fy);
      case Interpolation.cubic:
        return this.getPixelCubic(fx, fy);
    }
    throw new LibError('Unknown Interpolation mode.');
  }

  /**
   * Retrieves the color of a pixel using bilinear interpolation.
   *
   * @param {number} fx - The x-coordinate of the pixel in floating-point.
   * @param {number} fy - The y-coordinate of the pixel in floating-point.
   * @returns {Color} The interpolated color at the specified coordinates.
   */
  public getPixelLinear(fx: number, fy: number): Color {
    const x = Math.trunc(fx) - (fx >= 0 ? 0 : 1);
    const nx = x + 1;
    const y = Math.trunc(fy) - (fy >= 0 ? 0 : 1);
    const ny = y + 1;
    const dx = fx - x;
    const dy = fy - y;

    /**
     * Performs linear interpolation between four color components.
     *
     * @param {number} icc - The color component at (x, y).
     * @param {number} inc - The color component at (nx, y).
     * @param {number} icn - The color component at (x, ny).
     * @param {number} inn - The color component at (nx, ny).
     * @returns {number} The interpolated color component.
     */
    const linear = (
      icc: number,
      inc: number,
      icn: number,
      inn: number
    ): number => {
      return (
        icc + dx * (inc - icc + dy * (icc + inn - icn - inc)) + dy * (icn - icc)
      );
    };

    const icc = this.getPixelSafe(x, y);
    const icn = ny >= this.height ? icc : this.getPixelSafe(x, ny);
    const inc = nx >= this.width ? icc : this.getPixelSafe(nx, y);
    const inn =
      nx >= this.width || ny >= this.height ? icc : this.getPixelSafe(nx, ny);

    return this.getColor(
      linear(icc.r, inc.r, icn.r, inn.r),
      linear(icc.g, inc.g, icn.g, inn.g),
      linear(icc.b, inc.b, icn.b, inn.b),
      linear(icc.a, inc.a, icn.a, inn.a)
    );
  }

  /**
   * Performs cubic interpolation to get the color of a pixel at a given floating-point coordinate.
   *
   * @param {number} fx - The x-coordinate of the pixel in floating-point.
   * @param {number} fy - The y-coordinate of the pixel in floating-point.
   * @returns {Color} The interpolated color at the given coordinates.
   */
  public getPixelCubic(fx: number, fy: number): Color {
    const x = Math.trunc(fx) - (fx >= 0 ? 0 : 1);
    const px = x - 1;
    const nx = x + 1;
    const ax = x + 2;
    const y = Math.trunc(fy) - (fy >= 0 ? 0 : 1);
    const py = y - 1;
    const ny = y + 1;
    const ay = y + 2;

    const dx = fx - x;
    const dy = fy - y;

    /**
     * Computes the cubic interpolation for a given set of points and a delta value.
     *
     * @param {number} dx - The delta value for interpolation.
     * @param {number} ipp - The intensity of the previous previous point.
     * @param {number} icp - The intensity of the current previous point.
     * @param {number} inp - The intensity of the next point.
     * @param {number} iap - The intensity of the after next point.
     * @returns {number} The interpolated intensity.
     */
    const cubic = (
      dx: number,
      ipp: number,
      icp: number,
      inp: number,
      iap: number
    ): number => {
      return (
        icp +
        0.5 *
          (dx * (-ipp + inp) +
            dx * dx * (2 * ipp - 5 * icp + 4 * inp - iap) +
            dx * dx * dx * (-ipp + 3 * icp - 3 * inp + iap))
      );
    };

    const icc = this.getPixelSafe(x, y);

    const ipp = px < 0 || py < 0 ? icc : this.getPixelSafe(px, py);
    const icp = px < 0 ? icc : this.getPixelSafe(x, py);
    const inp = py < 0 || nx >= this.width ? icc : this.getPixelSafe(nx, py);
    const iap = ax >= this.width || py < 0 ? icc : this.getPixelSafe(ax, py);

    const ip0 = cubic(dx, ipp.r, icp.r, inp.r, iap.r);
    const ip1 = cubic(dx, ipp.g, icp.g, inp.g, iap.g);
    const ip2 = cubic(dx, ipp.b, icp.b, inp.b, iap.b);
    const ip3 = cubic(dx, ipp.a, icp.a, inp.a, iap.a);

    const ipc = px < 0 ? icc : this.getPixelSafe(px, y);
    const inc = nx >= this.width ? icc : this.getPixelSafe(nx, y);
    const iac = ax >= this.width ? icc : this.getPixelSafe(ax, y);

    const ic0 = cubic(dx, ipc.r, icc.r, inc.r, iac.r);
    const ic1 = cubic(dx, ipc.g, icc.g, inc.g, iac.g);
    const ic2 = cubic(dx, ipc.b, icc.b, inc.b, iac.b);
    const ic3 = cubic(dx, ipc.a, icc.a, inc.a, iac.a);

    const ipn = px < 0 || ny >= this.height ? icc : this.getPixelSafe(px, ny);
    const icn = ny >= this.height ? icc : this.getPixelSafe(x, ny);
    const inn =
      nx >= this.width || ny >= this.height ? icc : this.getPixelSafe(nx, ny);
    const ian =
      ax >= this.width || ny >= this.height ? icc : this.getPixelSafe(ax, ny);

    const in0 = cubic(dx, ipn.r, icn.r, inn.r, ian.r);
    const in1 = cubic(dx, ipn.g, icn.g, inn.g, ian.g);
    const in2 = cubic(dx, ipn.b, icn.b, inn.b, ian.b);
    const in3 = cubic(dx, ipn.a, icn.a, inn.a, ian.a);

    const ipa = px < 0 || ay >= this.height ? icc : this.getPixelSafe(px, ay);
    const ica = ay >= this.height ? icc : this.getPixelSafe(x, ay);
    const ina =
      nx >= this.width || ay >= this.height ? icc : this.getPixelSafe(nx, ay);
    const iaa =
      ax >= this.width || ay >= this.height ? icc : this.getPixelSafe(ax, ay);

    const ia0 = cubic(dx, ipa.r, ica.r, ina.r, iaa.r);
    const ia1 = cubic(dx, ipa.g, ica.g, ina.g, iaa.g);
    const ia2 = cubic(dx, ipa.b, ica.b, ina.b, iaa.b);
    const ia3 = cubic(dx, ipa.a, ica.a, ina.a, iaa.a);

    const c0 = cubic(dy, ip0, ic0, in0, ia0);
    const c1 = cubic(dy, ip1, ic1, in1, ia1);
    const c2 = cubic(dy, ip2, ic2, in2, ia2);
    const c3 = cubic(dy, ip3, ic3, in3, ia3);

    return this.getColor(
      Math.trunc(c0),
      Math.trunc(c1),
      Math.trunc(c2),
      Math.trunc(c3)
    );
  }

  /**
   * Sets the pixel at the specified (x, y) coordinates to the given color or pixel.
   *
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {Color | Pixel} c - The color or pixel to set. Can be an instance of Color or Pixel.
   */
  public setPixel(x: number, y: number, c: Color | Pixel): void {
    // TODO: improve the class check for being a Pixel
    if ('image' in c && 'index' in c) {
      if (c.image.hasPalette) {
        if (this.hasPalette) {
          this.setPixelIndex(x, y, c.index);
          return;
        }
      }
    }
    this._data?.setPixelRgba(x, y, c.r, c.g, c.b, c.a);
  }

  /**
   * Sets the pixel index at the specified (x, y) coordinates.
   *
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} i - The index value to set for the pixel.
   */
  public setPixelIndex(x: number, y: number, i: number): void {
    this._data?.setPixelR(x, y, i);
  }

  /**
   * Set the red (or index) color channel of a pixel.
   *
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} i - The intensity value for the red color channel.
   */
  public setPixelR(x: number, y: number, i: number): void {
    this._data?.setPixelR(x, y, i);
  }

  /**
   * Sets the RGB value of a specific pixel in the image data.
   *
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red component of the pixel (0-255).
   * @param {number} g - The green component of the pixel (0-255).
   * @param {number} b - The blue component of the pixel (0-255).
   */
  public setPixelRgb(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number
  ): void {
    this._data?.setPixelRgb(x, y, r, g, b);
  }

  /**
   * Sets the RGBA value of a specific pixel in the image data.
   *
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number} r - The red component of the pixel (0-255).
   * @param {number} g - The green component of the pixel (0-255).
   * @param {number} b - The blue component of the pixel (0-255).
   * @param {number} a - The alpha (transparency) component of the pixel (0-255).
   */
  public setPixelRgba(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number
  ): void {
    this._data?.setPixelRgba(x, y, r, g, b, a);
  }

  /**
   * Clears the current data with an optional color.
   *
   * @param {Color} [color] - The optional color to clear the data with.
   */
  public clear(color?: Color): void {
    this._data?.clear(color);
  }

  /**
   * Convert this image to a new format or number of channels.
   * If the new number of channels is 4 and the current image does
   * not have an alpha channel, then the given alpha value will be used
   * to set the new alpha channel. If alpha is not provided, then the
   * maxChannelValue will be used to set the alpha. If withPalette is
   * true, and to target format and numChannels has fewer than 256 colors,
   * then the new image will be converted to use a palette.
   *
   * @param {MemoryImageConvertOptions} opt - Options for the image conversion.
   * @param {Format} [opt.format] - The target format for the image.
   * @param {number} [opt.numChannels] - The number of channels for the image.
   * @param {number} [opt.alpha] - The alpha value to use if adding an alpha channel.
   * @param {boolean} [opt.withPalette] - Whether to use a palette for the image.
   * @param {boolean} [opt.skipAnimation] - Whether to skip animation frames.
   * @returns {MemoryImage} The converted memory image.
   */
  public convert(opt: MemoryImageConvertOptions): MemoryImage {
    const format = opt.format ?? this.format;
    const numChannels = opt.numChannels ?? this.numChannels;
    const alpha = opt.alpha ?? FormatMaxValue.get(format);
    let withPalette = opt.withPalette ?? false;
    const skipAnimation = opt.skipAnimation ?? false;

    if (
      (withPalette &&
        (numChannels >= 4 ||
          !(
            format === Format.uint1 ||
            format === Format.uint2 ||
            format === Format.uint4 ||
            (format === Format.uint8 && numChannels === 1)
          ))) ||
      (format < Format.uint8 && this.format >= Format.uint8)
    ) {
      withPalette = false;
    }

    if (
      format === this.format &&
      numChannels === this.numChannels &&
      ((!withPalette && this.palette === undefined) ||
        (withPalette && this.palette !== undefined))
    ) {
      // Same format and number of channels
      return MemoryImage.from(this);
    }

    let firstFrame: MemoryImage | undefined = undefined;
    for (const frame of this._frames) {
      const newImage = new MemoryImage({
        width: frame.width,
        height: frame.height,
        format: format,
        numChannels: numChannels,
        withPalette: withPalette,
        exifData: frame._exifData?.clone(),
        iccProfile: frame._iccProfile?.clone(),
        backgroundColor: frame._backgroundColor?.clone(),
        frameType: frame._frameType,
        loopCount: frame._loopCount,
        frameDuration: frame._frameDuration,
        textData:
          frame._textData !== undefined
            ? new Map<string, string>(frame.textData)
            : undefined,
      });

      if (firstFrame !== undefined) {
        firstFrame.addFrame(newImage);
      } else {
        firstFrame = newImage;
      }

      const pal = newImage.palette;
      const f = newImage.palette?.format ?? format;
      if (pal !== undefined) {
        const usedColors = new Map<number, number>();
        let numColors = 0;
        const op = frame.getPixel(0, 0);
        let c: Color | undefined = undefined;
        for (const np of newImage) {
          const nr = Math.floor(op.rNormalized * 255);
          const ng = Math.floor(op.gNormalized * 255);
          const nb = Math.floor(op.bNormalized * 255);
          const h = ColorUtils.rgbaToUint32(nr, ng, nb, 0);
          if (usedColors.has(h)) {
            np.index = usedColors.get(h)!;
          } else {
            usedColors.set(h, numColors);
            np.index = numColors;
            c = ColorUtils.convertColor({
              from: op,
              to: c,
              format: f,
              numChannels: numChannels,
              alpha: alpha,
            });
            pal.setRgb(numColors, c.r, c.g, c.b);
            numColors++;
          }
          op.next();
        }
      } else {
        const op = frame.getPixel(0, 0);
        for (const np of newImage) {
          ColorUtils.convertColor({
            from: op,
            to: np,
            alpha: alpha,
          });
          op.next();
        }
      }

      if (skipAnimation) {
        break;
      }
    }

    return firstFrame!;
  }

  /**
   * Add text metadata to the image.
   * @param {Map<string, string>} data - A map containing key-value pairs of text metadata.
   */
  public addTextData(data: Map<string, string>): void {
    this._textData ??= new Map<string, string>();
    for (const [key, value] of data) {
      this._textData.set(key, value);
    }
  }

  /**
   * Calculates the minimum and maximum color channel values from the image.
   *
   * @returns {MemoryImageColorExtremes} An object containing the minimum and maximum color channel values.
   */
  public getColorExtremes(): MemoryImageColorExtremes {
    let first = true;
    let min = 0;
    let max = 0;
    for (const p of this) {
      for (let i = 0; i < p.length; i++) {
        const c = p.getChannel(i);
        if (first || c < min) {
          min = c;
        }
        if (first || c > max) {
          max = c;
        }
      }
      first = false;
    }
    return {
      min: min,
      max: max,
    };
  }

  /**
   * Returns a string representation of the image.
   * The string includes the class name and the values of width, height, format, and number of channels.
   *
   * @returns {string} A string representation of the object.
   */
  public toString(): string {
    return `${this.constructor.name} (w: ${this.width}, h: ${this.height}, f: ${
      Format[this.format]
    }, ch: ${this.numChannels})`;
  }

  /**
   * Returns an iterator for the Pixel data.
   *
   * @returns {Iterator<Pixel>} An iterator for the Pixel data.
   */
  public [Symbol.iterator](): Iterator<Pixel> {
    return this._data !== undefined
      ? this._data[Symbol.iterator]()
      : {
          next: () =>
            <IteratorResult<Pixel>>{
              done: true,
              value: UndefinedPixel,
            },
        };
  }
}
