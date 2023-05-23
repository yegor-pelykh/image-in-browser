/** @format */

import { ChannelOrder, ChannelOrderLength } from '../color/channel-order';
import { Color } from '../color/color';
import { ColorUint8 } from '../color/color-uint8';
import { ColorUtils } from '../color/color-utils';
import {
  Format,
  FormatMaxValue,
  FormatSize,
  FormatType,
  getRowStride,
} from '../color/format';
import { ArrayUtils } from '../common/array-utils';
import { Interpolation } from '../common/interpolation';
import { MathUtils } from '../common/math-utils';
import { LibError } from '../error/lib-error';
import { ExifData } from '../exif/exif-data';
import { FrameType } from './frame-type';
import { IccProfile } from './icc-profile';
import { MemoryImageData } from './image-data';
import { MemoryImageDataFloat16 } from './image-data-float16';
import { MemoryImageDataFloat32 } from './image-data-float32';
import { MemoryImageDataFloat64 } from './image-data-float64';
import { MemoryImageDataInt16 } from './image-data-int16';
import { MemoryImageDataInt32 } from './image-data-int32';
import { MemoryImageDataInt8 } from './image-data-int8';
import { MemoryImageDataUint1 } from './image-data-uint1';
import { MemoryImageDataUint16 } from './image-data-uint16';
import { MemoryImageDataUint2 } from './image-data-uint2';
import { MemoryImageDataUint32 } from './image-data-uint32';
import { MemoryImageDataUint4 } from './image-data-uint4';
import { MemoryImageDataUint8 } from './image-data-uint8';
import { Palette } from './palette';
import { PaletteFloat16 } from './palette-float16';
import { PaletteFloat32 } from './palette-float32';
import { PaletteFloat64 } from './palette-float64';
import { PaletteInt16 } from './palette-int16';
import { PaletteInt32 } from './palette-int32';
import { PaletteInt8 } from './palette-int8';
import { PaletteUint16 } from './palette-uint16';
import { PaletteUint32 } from './palette-uint32';
import { PaletteUint8 } from './palette-uint8';
import { Pixel, UndefinedPixel } from './pixel';

interface MemoryImageInitializeOptions {
  width: number;
  height: number;
  format?: Format;
  numChannels?: number;
  withPalette?: boolean;
  paletteFormat?: Format;
  palette?: Palette;
  exifData?: ExifData;
  iccProfile?: IccProfile;
}

export interface MemoryImageCreateOptions extends MemoryImageInitializeOptions {
  loopCount?: number;
  frameType?: FrameType;
  frameDuration?: number;
  frameIndex?: number;
  backgroundColor?: Color;
  textData?: Map<string, string>;
}

export interface MemoryImageFromBytesOptions extends MemoryImageCreateOptions {
  bytes: ArrayBufferLike;
  byteOffset?: number;
  rowStride?: number;
  channelOrder?: ChannelOrder;
}

export interface MemoryImageCloneOptions {
  skipAnimation?: boolean;
  skipPixels?: boolean;
}

export interface MemoryImageConvertOptions {
  format?: Format;
  numChannels?: number;
  alpha?: number;
  withPalette?: boolean;
  skipAnimation?: boolean;
}

export interface MemoryImageColorExtremes {
  min: number;
  max: number;
}

/**
 * A MemoryImage is a container for MemoryImageData and other various metadata
 * representing an image in memory.
 */
export class MemoryImage implements Iterable<Pixel> {
  private _data?: MemoryImageData;
  public get data(): MemoryImageData | undefined {
    return this._data;
  }

  private get numPixelColors(): number {
    return this.format === Format.uint1
      ? 2
      : this.format === Format.uint2
      ? 4
      : this.format === Format.uint4
      ? 16
      : this.format === Format.uint8
      ? 256
      : 0;
  }

  /**
   * The format of the image pixels.
   */
  public get format(): Format {
    return this._data?.format ?? Format.uint8;
  }

  /**
   * Indicates whether this image has a palette.
   */
  public get hasPalette(): boolean {
    return this._data?.palette !== undefined;
  }

  /**
   * The palette if the image has one, undefined otherwise.
   */
  public get palette(): Palette | undefined {
    return this._data?.palette;
  }

  /**
   * The number of color channels for the image.
   */
  public get numChannels(): number {
    return this.palette?.numChannels ?? this._data?.numChannels ?? 0;
  }

  /**
   * Indicates whether this image is animated.
   * An image is considered animated if it has more than one frame, as the
   * first image in the frames list is the image itself.
   */
  public get hasAnimation(): boolean {
    return this._frames.length > 1;
  }

  /**
   * The number of frames in this MemoryImage. A MemoryImage will have at least one
   * frame, itself, so it's considered animated if it has more than one
   * frame.
   */
  public get numFrames(): number {
    return this._frames.length;
  }

  private _exifData?: ExifData;
  /**
   * The EXIF metadata for the image. If an ExifData hasn't been created
   * for the image yet, one will be added.
   */
  public get exifData(): ExifData {
    this._exifData ??= new ExifData();
    return this._exifData;
  }
  public set exifData(exif: ExifData) {
    this._exifData = exif;
  }

  /**
   * The maximum value of a pixel channel, based on the format of the image.
   * If the image has a **palette**, this will be the maximum value of a palette
   * color channel. Float format images will have a **maxChannelValue** of 1,
   * though they can have values above that.
   */
  public get maxChannelValue(): number {
    return this._data?.maxChannelValue ?? 0;
  }

  /**
   * The maximum value of a palette index, based on the format of the image.
   * This differs from **maxChannelValue** in that it will not be affected by
   * the format of the **palette**.
   */
  public get maxIndexValue(): number {
    return this.data?.maxIndexValue ?? 0;
  }

  /**
   * Indicates whether this image supports using a palette.
   */
  public get supportsPalette(): boolean {
    return (
      this.format === Format.uint1 ||
      this.format === Format.uint2 ||
      this.format === Format.uint4 ||
      this.format === Format.uint8
    );
  }

  /**
   * The width of the image in pixels.
   */
  public get width(): number {
    return this.data?.width ?? 0;
  }

  /**
   * The height of the image in pixels.
   */
  public get height(): number {
    return this.data?.height ?? 0;
  }

  /**
   * The general type of the format, whether it's uint data, int data, or
   * float data (regardless of precision).
   */
  public get formatType(): FormatType {
    return this.data?.formatType ?? FormatType.uint;
  }

  /**
   * Indicates whether this image is valid and has data.
   */
  public get isValid(): boolean {
    return this._data !== undefined && this.width > 0 && this.height > 0;
  }

  /**
   * The ArrayBufferLike of the image storage data or undefined if not initialized.
   */
  public get buffer(): ArrayBufferLike | undefined {
    return this._data?.buffer;
  }

  /**
   * The length in bytes of the image data buffer.
   */
  public get byteLength(): number {
    return this._data?.buffer.byteLength ?? 0;
  }

  /**
   * The length in bytes of a row of pixels in the image buffer.
   */
  public get rowStride(): number {
    return this._data?.rowStride ?? 0;
  }

  /**
   * Indicates whether this image is a Low Dynamic Range (regular) image.
   */
  public get isLdrFormat(): boolean {
    return this._data?.isLdrFormat ?? false;
  }

  /**
   * Indicates whether this image is a High Dynamic Range image.
   */
  public get isHdrFormat(): boolean {
    return this._data?.isHdrFormat ?? false;
  }

  /**
   * The number of bits per color channel.
   */
  public get bitsPerChannel(): number {
    return this._data?.bitsPerChannel ?? 0;
  }

  /**
   * Indicates whether this MemoryImage has an alpha channel.
   */
  public get hasAlpha(): boolean {
    return this.numChannels === 4;
  }

  /**
   * Named non-color channels used by this image.
   */
  private _extraChannels?: Map<string, MemoryImageData>;

  private _iccProfile: IccProfile | undefined;
  public get iccProfile(): IccProfile | undefined {
    return this._iccProfile;
  }
  public set iccProfile(v: IccProfile | undefined) {
    this._iccProfile = v;
  }

  private _textData: Map<string, string> | undefined;
  public get textData(): Map<string, string> | undefined {
    return this._textData;
  }

  private _backgroundColor?: Color;
  /**
   * The suggested background color to clear the canvas with.
   */
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }
  public set backgroundColor(v: Color | undefined) {
    this._backgroundColor = v;
  }

  private _loopCount: number;
  /**
   * How many times should the animation loop (0 means forever)
   */
  public get loopCount(): number {
    return this._loopCount;
  }
  public set loopCount(v: number) {
    this._loopCount = v;
  }

  private _frameType: FrameType;
  /**
   * Gets or sets how should the frames be interpreted.
   * If the **frameType** is _FrameType.animation_, the frames are part
   * of an animated sequence. If the **frameType** is _FrameType.page_,
   * the frames are the pages of a document.
   */
  public get frameType(): FrameType {
    return this._frameType;
  }
  public set frameType(v: FrameType) {
    this._frameType = v;
  }

  /**
   * The list of sub-frames for the image, if it's an animation. An image
   * is considered animated if it has more than one frame, as the first
   * frame will be the image itself.
   */
  private _frames: MemoryImage[] = [];
  public get frames(): MemoryImage[] {
    return this._frames;
  }

  private _frameDuration: number;
  /**
   * How long this frame should be displayed, in milliseconds.
   * A duration of 0 indicates no delay and the next frame will be drawn
   * as quickly as it can.
   */
  public get frameDuration(): number {
    return this._frameDuration;
  }
  public set frameDuration(v: number) {
    this._frameDuration = v;
  }

  /**
   * Index of this image in the parent animations frame list.
   */
  private _frameIndex: number;
  public get frameIndex(): number {
    return this._frameIndex;
  }

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
   * **format** defines the order of color channels in **bytes**.
   * An HTML canvas element stores colors in _Format.rgba_ format;
   * a MemoryImage object stores colors in _Format.rgba_ format.
   *
   * **rowStride** is the row stride, in bytes, of the source data **bytes**.
   * This may be different than the rowStride of the MemoryImage, as some data
   * sources align rows to different byte alignments and include padding.
   *
   * **order** can be used if the source **bytes** has a different channel order
   * than RGBA. _ChannelOrder.bgra_ will rearrange the color channels from
   * BGRA to what MemoryImage wants, RGBA.
   *
   * If **numChannels** and **order** are not provided, a default of 3 for
   * **numChannels** and _ChannelOrder.rgba_ for **order** will be assumed.
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
        ArrayUtils.copyRange(fromBytes, bOff, bOff + stride, toBytes, dOff);
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

  private initialize(opt: MemoryImageInitializeOptions): void {
    const format = opt.format ?? Format.uint8;
    const numChannels = opt.numChannels ?? 3;
    const withPalette = opt.withPalette ?? false;
    const paletteFormat = opt.paletteFormat ?? Format.uint8;

    if (numChannels < 1 || numChannels > 4) {
      throw new LibError(
        `Invalid number of channels for image (${numChannels}). Must be between 1 and 4.`
      );
    }

    this._iccProfile = opt.iccProfile;

    if (opt.exifData !== undefined) {
      this._exifData = opt.exifData.clone();
    }

    const palette =
      opt.palette ??
      (withPalette && this.supportsPalette
        ? this.createPalette(paletteFormat, numChannels)
        : undefined);

    this.createImageData(opt.width, opt.height, format, numChannels, palette);
  }

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
        this._data = new MemoryImageDataUint16(width, height, numChannels);
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

  private createPalette(
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
        return new PaletteUint8(this.numPixelColors, numChannels);
      case Format.uint16:
        return new PaletteUint16(this.numPixelColors, numChannels);
      case Format.uint32:
        return new PaletteUint32(this.numPixelColors, numChannels);
      case Format.int8:
        return new PaletteInt8(this.numPixelColors, numChannels);
      case Format.int16:
        return new PaletteInt16(this.numPixelColors, numChannels);
      case Format.int32:
        return new PaletteInt32(this.numPixelColors, numChannels);
      case Format.float16:
        return new PaletteFloat16(this.numPixelColors, numChannels);
      case Format.float32:
        return new PaletteFloat32(this.numPixelColors, numChannels);
      case Format.float64:
        return new PaletteFloat64(this.numPixelColors, numChannels);
    }
    throw new LibError('Unknown palette format.');
  }

  /**
   * Add a frame to the animation of this MemoryImage.
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
   * Get a frame from this image. If the MemoryImage is not animated, this
   * MemoryImage will be returned; otherwise the particular frame MemoryImage will
   * be returned.
   */
  public getFrame(index: number): MemoryImage {
    return this._frames[index];
  }

  /**
   * Create a copy of this image.
   */
  public clone(opt?: MemoryImageCloneOptions): MemoryImage {
    const skipAnimation = opt?.skipAnimation ?? false;
    const skipPixels = opt?.skipPixels ?? false;
    return MemoryImage.from(this, skipAnimation, skipPixels);
  }

  public hasExtraChannel(name: string): boolean {
    return this._extraChannels !== undefined && this._extraChannels.has(name);
  }

  public getExtraChannel(name: string): MemoryImageData | undefined {
    return this._extraChannels !== undefined
      ? this._extraChannels.get(name)
      : undefined;
  }

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
   * Returns a pixel iterator for iterating over a rectangular range of pixels
   * in the image.
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
   * Get a Uint8Array view of the image storage data.
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
   * Similar to **toUint8Array**, but will convert the channels of the image pixels
   * to the given **order**. If that happens, the returned bytes will be a copy
   * and not a direct view of the image data.
   */
  public getBytes(order?: ChannelOrder): Uint8Array {
    return this._data?.getBytes(order) ?? this.toUint8Array();
  }

  /**
   * Remap the color channels to the given **order**. Normally MemoryImage color
   * channels are stored in rgba order for 4 channel images, and
   * rgb order for 3 channel images. This method lets you re-arrange the
   * color channels in-place without needing to clone the image for preparing
   * image data for external usage that requires alternative channel ordering.
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
   * Returns true if the given pixel coordinates is within the dimensions
   * of the image.
   */
  public isBoundsSafe(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  /**
   * Create a Color object with the format and number of channels of the
   * image.
   */
  public getColor(r: number, g: number, b: number, a?: number): Color {
    return this._data?.getColor(r, g, b, a) ?? new ColorUint8(0);
  }

  /**
   * Return the Pixel at the given coordinates **x**,**y**. If **pixel** is provided,
   * it will be updated and returned rather than allocating a new Pixel.
   */
  public getPixel(x: number, y: number, pixel?: Pixel): Pixel {
    return this._data?.getPixel(x, y, pixel) ?? UndefinedPixel;
  }

  /**
   * Get the pixel from the given **x**, **y** coordinate. If the pixel coordinates
   * are out of bounds, PixelUndefined is returned.
   */
  public getPixelSafe(x: number, y: number, pixel?: Pixel): Pixel {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return UndefinedPixel;
    }
    return this.getPixel(x, y, pixel);
  }

  /**
   * Get the pixel from the given **x**, **y** coordinate. If the pixel coordinates
   * are out of range of the image, they will be clamped to the resolution.
   */
  public getPixelClamped(x: number, y: number, pixel?: Pixel): Pixel {
    const _x = MathUtils.clamp(x, 0, this.width - 1);
    const _y = MathUtils.clamp(y, 0, this.height - 1);
    return this.getPixel(_x, _y, pixel);
  }

  /**
   * Get the pixel using the given **interpolation** type for non-integer pixel
   * coordinates.
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
   * Get the pixel using linear interpolation for non-integer pixel
   * coordinates.
   */
  public getPixelLinear(fx: number, fy: number): Color {
    const x = Math.trunc(fx) - (fx >= 0 ? 0 : 1);
    const nx = x + 1;
    const y = Math.trunc(fy) - (fy >= 0 ? 0 : 1);
    const ny = y + 1;
    const dx = fx - x;
    const dy = fy - y;

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
   * Get the pixel using cubic interpolation for non-integer pixel
   * coordinates.
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
   * Set the color of the pixel at the given coordinates to the color of the
   * given Color **c**.
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
   * Set the index value for palette images, or the red channel otherwise.
   */
  public setPixelIndex(x: number, y: number, i: number): void {
    this._data?.setPixelR(x, y, i);
  }

  /**
   * Set the red (or index) color channel of a pixel.
   */
  public setPixelR(x: number, y: number, i: number): void {
    this._data?.setPixelR(x, y, i);
  }

  /**
   * Set the color of the Pixel at the given coordinates to the given
   * color values **r**, **g**, **b**.
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
   * Set the color of the Pixel at the given coordinates to the given
   * color values **r**, **g**, **b**, and **a**.
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
   * Set all pixels in the image to the given **color**. If no color is provided
   * the image will be initialized to 0.
   */
  public clear(color?: Color): void {
    this._data?.clear(color);
  }

  /**
   * Convert this image to a new **format** or number of channels, **numChannels**.
   * If the new number of channels is 4 and the current image does
   * not have an alpha channel, then the given **alpha** value will be used
   * to set the new alpha channel. If **alpha** is not provided, then the
   * **maxChannelValue** will be used to set the alpha. If **withPalette** is
   * true, and to target format and **numChannels** has fewer than 256 colors,
   * then the new image will be converted to use a palette.
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
   */
  public addTextData(data: Map<string, string>): void {
    this._textData ??= new Map<string, string>();
    for (const [key, value] of data) {
      this._textData.set(key, value);
    }
  }

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

  public toString(): string {
    return `${this.constructor.name} (w: ${this.width}, h: ${this.height}, f: ${
      Format[this.format]
    }, ch: ${this.numChannels})`;
  }

  /**
   * Returns a pixel iterator for iterating over all of the pixels in the
   * image.
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
