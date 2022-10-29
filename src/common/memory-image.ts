/** @format */

import { ExifData } from './exif_data';
import { ICCProfileData } from './icc_profile_data';
import { Interpolation } from '../formats/util/interpolation';
import { ListUtils } from './list-utils';
import { ColorUtils } from './color-utils';
import { RgbChannelSet } from './rgb-channel-set';
import { DisposeMode } from './dispose-mode';
import { BlendMode } from './blend-mode';
import { ColorModel } from './color-model';
import { ImageError } from '../error/image-error';

export interface RgbMemoryImageInitOptions {
  width: number;
  height: number;
  exifData?: ExifData;
  iccProfile?: ICCProfileData;
  textData?: Map<string, string>;
}

export interface MemoryImageInitOptions extends RgbMemoryImageInitOptions {
  rgbChannelSet?: RgbChannelSet;
  data?: Uint32Array;
}

export interface MemoryImageInitOptionsColorModel {
  width: number;
  height: number;
  data: Uint8Array;
  rgbChannelSet?: RgbChannelSet;
  exifData?: ExifData;
  iccProfile?: ICCProfileData;
  textData?: Map<string, string>;
  colorModel?: ColorModel;
}

/**
 * An image buffer where pixels are encoded into 32-bit unsigned ints (Uint32).
 *
 * Pixels are stored in 32-bit unsigned integers in #AARRGGBB format.
 * You can use [getBytes] to access the pixel data at the byte (channel) level,
 * optionally providing the format to get the image data as. You can use the
 * letious color functions, such as [getRed], [getGreen], [getBlue], and [getAlpha]
 * to access the individual channels of a given pixel color.
 *
 * If this image is a frame of an animation as decoded by the [decodeFrame]
 * method of [Decoder], then the [xOffset], [yOffset], [width] and [height]
 * determine the area of the canvas this image should be drawn into,
 * as some frames of an animation only modify part of the canvas (recording
 * the part of the frame that actually changes). The [decodeAnimation] method
 * will always return the fully composed animation, so these coordinate
 * properties are not used.
 */
export class MemoryImage {
  /**
   * Pixels are encoded into 4-byte Uint32 integers in #AABBGGRR channel order.
   */
  private readonly _data: Uint32Array;
  public get data(): Uint32Array {
    return this._data;
  }

  /**
   * x position at which to render the frame. This is used for frames
   * in an animation, such as from an animated GIF.
   */
  private _xOffset = 0;
  public get xOffset(): number {
    return this._xOffset;
  }

  /**
   * y position at which to render the frame. This is used for frames
   * in an animation, such as from an animated GIF.
   */
  private _yOffset = 0;
  public get yOffset(): number {
    return this._yOffset;
  }

  /**
   * How long this frame should be displayed, in milliseconds.
   * A duration of 0 indicates no delay and the next frame will be drawn
   * as quickly as it can.
   */
  private _duration = 0;
  public set duration(v: number) {
    this._duration = v;
  }
  public get duration(): number {
    return this._duration;
  }

  /**
   * Defines what should be done to the canvas when drawing this frame
   *  in an animation.
   */
  private _disposeMethod: DisposeMode = DisposeMode.clear;
  public get disposeMethod(): DisposeMode {
    return this._disposeMethod;
  }

  /**
   * Defines the blending method (alpha compositing) to use when drawing this
   * frame in an animation.
   */
  private _blendMethod: BlendMode = BlendMode.over;
  public get blendMethod(): BlendMode {
    return this._blendMethod;
  }

  /**
   * The channels used by this image, indicating whether the alpha channel
   * is used or not. All images have an implicit alpha channel due to the
   * image data being stored in a Uint32, but some images, such as those
   * decoded from a Jpeg, don't use the alpha channel. This allows
   * image encoders that support both rgb and rgba formats, to know which
   * one it should use.
   */
  private _rgbChannelSet: RgbChannelSet;
  public get rgbChannelSet(): RgbChannelSet {
    return this._rgbChannelSet;
  }

  /**
   * EXIF data decoded from an image file.
   */
  private _exifData: ExifData;
  public get exifData(): ExifData {
    return this._exifData;
  }

  /**
   * ICC color profile read from an image file.
   */
  private _iccProfile?: ICCProfileData;
  public set iccProfile(v: ICCProfileData | undefined) {
    this._iccProfile = v;
  }
  public get iccProfile(): ICCProfileData | undefined {
    return this._iccProfile;
  }

  /**
   * Some formats, like PNG, can encode and decode text data with the image.
   */
  private _textData?: Map<string, string>;
  public get textData(): Map<string, string> | undefined {
    return this._textData;
  }

  /**
   * Width of the image.
   */
  private readonly _width: number;
  public get width(): number {
    return this._width;
  }

  /**
   * Height of the image.
   */
  private readonly _height: number;
  public get height(): number {
    return this._height;
  }

  /**
   * The number of channels used by this Image. While all images
   * are stored internally with 4 bytes, some images, such as those
   * loaded from a Jpeg, don't use the 4th (alpha) channel.
   */
  public get numberOfChannels(): number {
    return this.rgbChannelSet === RgbChannelSet.rgba ? 4 : 3;
  }

  /**
   * The size of the image buffer.
   */
  public get length(): number {
    return this.data.length;
  }

  /**
   * Create an image with the given dimensions and format.
   */
  constructor(options: MemoryImageInitOptions) {
    this._width = options.width;
    this._height = options.height;
    this._rgbChannelSet = options.rgbChannelSet ?? RgbChannelSet.rgba;
    this._exifData = ExifData.from(options.exifData);
    this._iccProfile = options.iccProfile;
    this._textData = options.textData;
    this._data =
      options.data ?? new Uint32Array(options.width * options.height);
  }

  private static convertData(
    width: number,
    height: number,
    bytes: Uint8Array | Uint32Array,
    colorModel: ColorModel
  ): Uint32Array {
    if (colorModel === ColorModel.rgba) {
      return bytes instanceof Uint32Array
        ? ListUtils.copyUint32(bytes)
        : ListUtils.copyUint32(new Uint32Array(bytes.buffer));
    }
    const input =
      bytes instanceof Uint32Array ? new Uint8Array(bytes.buffer) : bytes;

    const data = new Uint32Array(width * height);
    const rgba = new Uint8Array(data.buffer);

    switch (colorModel) {
      case ColorModel.bgra:
        for (let i = 0, len = input.length; i < len; i += 4) {
          rgba[i + 0] = input[i + 2];
          rgba[i + 1] = input[i + 1];
          rgba[i + 2] = input[i + 0];
          rgba[i + 3] = input[i + 3];
        }
        break;
      case ColorModel.abgr:
        for (let i = 0, len = input.length; i < len; i += 4) {
          rgba[i + 0] = input[i + 3];
          rgba[i + 1] = input[i + 2];
          rgba[i + 2] = input[i + 1];
          rgba[i + 3] = input[i + 0];
        }
        break;
      case ColorModel.argb:
        for (let i = 0, len = input.length; i < len; i += 4) {
          rgba[i + 0] = input[i + 1];
          rgba[i + 1] = input[i + 2];
          rgba[i + 2] = input[i + 3];
          rgba[i + 3] = input[i + 0];
        }
        break;
      case ColorModel.bgr:
        for (let i = 0, j = 0, len = input.length; j < len; i += 4, j += 3) {
          rgba[i + 0] = input[j + 2];
          rgba[i + 1] = input[j + 1];
          rgba[i + 2] = input[j + 0];
          rgba[i + 3] = 255;
        }
        break;
      case ColorModel.rgb:
        for (let i = 0, j = 0, len = input.length; j < len; i += 4, j += 3) {
          rgba[i + 0] = input[j + 0];
          rgba[i + 1] = input[j + 1];
          rgba[i + 2] = input[j + 2];
          rgba[i + 3] = 255;
        }
        break;
      case ColorModel.luminance:
        for (let i = 0, j = 0, len = input.length; j < len; i += 4, ++j) {
          rgba[i + 0] = input[j];
          rgba[i + 1] = input[j];
          rgba[i + 2] = input[j];
          rgba[i + 3] = 255;
        }
        break;
    }
    return data;
  }

  public static rgb(options: RgbMemoryImageInitOptions): MemoryImage {
    const opt = {
      ...options,
      rgbChannelSet: RgbChannelSet.rgb,
    } as MemoryImageInitOptions;
    return new MemoryImage(opt);
  }

  public static from(other: MemoryImage): MemoryImage {
    const result = new MemoryImage({
      width: other._width,
      height: other._height,
      rgbChannelSet: other._rgbChannelSet,
      exifData: ExifData.from(other._exifData),
      iccProfile: other._iccProfile,
      textData:
        other._textData !== undefined ? new Map(other._textData) : undefined,
      data: ListUtils.copyUint32(other._data),
    });
    result._xOffset = other._xOffset;
    result._yOffset = other._yOffset;
    result._duration = other._duration;
    result._disposeMethod = other._disposeMethod;
    result._blendMethod = other._blendMethod;
    return result;
  }

  /**
   *
   * [format] defines the order of color channels in [bytes].
   * The length of [bytes] should be (width * height) * format-byte-count,
   * where format-byte-count is 1, 3, or 4 depending on the number of
   * channels in the format (luminance, rgb, rgba, etc).
   *
   * The native format of an image is Format.rgba. If another format
   * is specified, the input data will be converted to rgba to store
   * in the Image.
   */
  public static fromBytes(
    options: MemoryImageInitOptionsColorModel
  ): MemoryImage {
    options.rgbChannelSet ??= RgbChannelSet.rgba;
    options.colorModel ??= ColorModel.rgba;
    const data = this.convertData(
      options.width,
      options.height,
      options.data,
      options.colorModel
    );
    const result = new MemoryImage({
      width: options.width,
      height: options.height,
      rgbChannelSet: options.rgbChannelSet,
      exifData: options.exifData,
      iccProfile: options.iccProfile,
      textData: options.textData,
      data: data,
    });
    return result;
  }

  /**
   * Clone this image.
   * */
  public clone(): MemoryImage {
    return MemoryImage.from(this);
  }

  /**
   * Get the bytes from the image. You can use this to access the
   * color channels directly, or to pass it to something like an
   * Html canvas context.
   *
   * Specifying the [format] will convert the image data to the specified
   * format. Images are stored internally in Format.rgba format; any
   * other format will require a conversion.
   *
   * For example, given an Html Canvas, you could draw this image into the
   * canvas:
   * Html.ImageData d = context2D.createImageData(image.width, image.height);
   * d.data.setRange(0, image.length, image.getBytes(format: Format.rgba));
   * context2D.putImageData(data, 0, 0);
   */
  public getBytes(colorModel: ColorModel = ColorModel.rgba): Uint8Array {
    const rgba = new Uint8Array(this._data.buffer);
    switch (colorModel) {
      case ColorModel.rgba:
        return rgba;
      case ColorModel.bgra: {
        const bytes = new Uint8Array(this._width * this._height * 4);
        for (let i = 0, len = bytes.length; i < len; i += 4) {
          bytes[i + 0] = rgba[i + 2];
          bytes[i + 1] = rgba[i + 1];
          bytes[i + 2] = rgba[i + 0];
          bytes[i + 3] = rgba[i + 3];
        }
        return bytes;
      }
      case ColorModel.abgr: {
        const bytes = new Uint8Array(this._width * this._height * 4);
        for (let i = 0, len = bytes.length; i < len; i += 4) {
          bytes[i + 0] = rgba[i + 3];
          bytes[i + 1] = rgba[i + 2];
          bytes[i + 2] = rgba[i + 1];
          bytes[i + 3] = rgba[i + 0];
        }
        return bytes;
      }
      case ColorModel.argb: {
        const bytes = new Uint8Array(this._width * this._height * 4);
        for (let i = 0, len = bytes.length; i < len; i += 4) {
          bytes[i + 0] = rgba[i + 3];
          bytes[i + 1] = rgba[i + 0];
          bytes[i + 2] = rgba[i + 1];
          bytes[i + 3] = rgba[i + 2];
        }
        return bytes;
      }
      case ColorModel.rgb: {
        const bytes = new Uint8Array(this._width * this._height * 3);
        for (let i = 0, j = 0, len = bytes.length; j < len; i += 4, j += 3) {
          bytes[j + 0] = rgba[i + 0];
          bytes[j + 1] = rgba[i + 1];
          bytes[j + 2] = rgba[i + 2];
        }
        return bytes;
      }
      case ColorModel.bgr: {
        const bytes = new Uint8Array(this._width * this._height * 3);
        for (let i = 0, j = 0, len = bytes.length; j < len; i += 4, j += 3) {
          bytes[j + 0] = rgba[i + 2];
          bytes[j + 1] = rgba[i + 1];
          bytes[j + 2] = rgba[i + 0];
        }
        return bytes;
      }
      case ColorModel.luminance: {
        const bytes = new Uint8Array(this._width * this._height);
        for (let i = 0, len = this.length; i < len; ++i) {
          bytes[i] = ColorUtils.getLuminance(this._data[i]);
        }
        return bytes;
      }
    }
    throw new ImageError('Unknown color model');
  }

  /**
   * Set all of the pixels of the image to the given [color].
   */
  public fill(color: number): MemoryImage {
    this._data.fill(color);
    return this;
  }

  /**
   * Set all of the empty pixels (for png's) of the image to the given [color].
   */
  public fillBackground(color: number): void {
    // Loop all pixels
    for (let i = 0; i < this.length; i++) {
      // Value 0 means null pixel
      if (this._data[i] === 0) {
        // Set the pixel to the given color
        this._data[i] = color;
      }
    }
  }

  /**
   * Add the colors of [other] to the pixels of this image.
   */
  public addImage(other: MemoryImage): MemoryImage {
    const h = Math.min(this._height, other._height);
    const w = Math.min(this._width, other._width);
    for (let y = 0; y < h; ++y) {
      for (let x = 0; x < w; ++x) {
        const c1 = this.getPixel(x, y);
        const r1 = ColorUtils.getRed(c1);
        const g1 = ColorUtils.getGreen(c1);
        const b1 = ColorUtils.getBlue(c1);
        const a1 = ColorUtils.getAlpha(c1);

        const c2 = other.getPixel(x, y);
        const r2 = ColorUtils.getRed(c2);
        const g2 = ColorUtils.getGreen(c2);
        const b2 = ColorUtils.getBlue(c2);
        const a2 = ColorUtils.getAlpha(c2);

        this.setPixel(
          x,
          y,
          ColorUtils.getColor(r1 + r2, g1 + g2, b1 + b2, a1 + a2)
        );
      }
    }
    return this;
  }

  /**
   * Subtract the colors of [other] from the pixels of this image.
   */
  public subtractImage(other: MemoryImage): MemoryImage {
    const h = Math.min(this._height, other._height);
    const w = Math.min(this._width, other._width);
    for (let y = 0; y < h; ++y) {
      for (let x = 0; x < w; ++x) {
        const c1 = this.getPixel(x, y);
        const r1 = ColorUtils.getRed(c1);
        const g1 = ColorUtils.getGreen(c1);
        const b1 = ColorUtils.getBlue(c1);
        const a1 = ColorUtils.getAlpha(c1);

        const c2 = other.getPixel(x, y);
        const r2 = ColorUtils.getRed(c2);
        const g2 = ColorUtils.getGreen(c2);
        const b2 = ColorUtils.getBlue(c2);
        const a2 = ColorUtils.getAlpha(c2);

        this.setPixel(
          x,
          y,
          ColorUtils.getColor(r1 - r2, g1 - g2, b1 - b2, a1 - a2)
        );
      }
    }
    return this;
  }

  /**
   * Multiply the colors of [other] with the pixels of this image.
   */
  public multiplyImage(other: MemoryImage): MemoryImage {
    const h = Math.min(this._height, other._height);
    const w = Math.min(this._width, other._width);
    for (let y = 0; y < h; ++y) {
      for (let x = 0; x < w; ++x) {
        const c1 = this.getPixel(x, y);
        const r1 = ColorUtils.getRed(c1);
        const g1 = ColorUtils.getGreen(c1);
        const b1 = ColorUtils.getBlue(c1);
        const a1 = ColorUtils.getAlpha(c1);

        const c2 = other.getPixel(x, y);
        const r2 = ColorUtils.getRed(c2);
        const g2 = ColorUtils.getGreen(c2);
        const b2 = ColorUtils.getBlue(c2);
        const a2 = ColorUtils.getAlpha(c2);

        this.setPixel(
          x,
          y,
          ColorUtils.getColor(r1 * r2, g1 * g2, b1 * b2, a1 * a2)
        );
      }
    }
    return this;
  }

  /**
   * OR the colors of [other] to the pixels of this image.
   */
  public orImage(other: MemoryImage): MemoryImage {
    const h = Math.min(this._height, other._height);
    const w = Math.min(this._width, other._width);
    for (let y = 0; y < h; ++y) {
      for (let x = 0; x < w; ++x) {
        const c1 = this.getPixel(x, y);
        const r1 = ColorUtils.getRed(c1);
        const g1 = ColorUtils.getGreen(c1);
        const b1 = ColorUtils.getBlue(c1);
        const a1 = ColorUtils.getAlpha(c1);

        const c2 = other.getPixel(x, y);
        const r2 = ColorUtils.getRed(c2);
        const g2 = ColorUtils.getGreen(c2);
        const b2 = ColorUtils.getBlue(c2);
        const a2 = ColorUtils.getAlpha(c2);

        this.setPixel(
          x,
          y,
          ColorUtils.getColor(r1 | r2, g1 | g2, b1 | b2, a1 | a2)
        );
      }
    }
    return this;
  }

  /**
   * AND the colors of [other] with the pixels of this image.
   */
  public andImage(other: MemoryImage): MemoryImage {
    const h = Math.min(this._height, other._height);
    const w = Math.min(this._width, other._width);
    for (let y = 0; y < h; ++y) {
      for (let x = 0; x < w; ++x) {
        const c1 = this.getPixel(x, y);
        const r1 = ColorUtils.getRed(c1);
        const g1 = ColorUtils.getGreen(c1);
        const b1 = ColorUtils.getBlue(c1);
        const a1 = ColorUtils.getAlpha(c1);

        const c2 = other.getPixel(x, y);
        const r2 = ColorUtils.getRed(c2);
        const g2 = ColorUtils.getGreen(c2);
        const b2 = ColorUtils.getBlue(c2);
        const a2 = ColorUtils.getAlpha(c2);

        this.setPixel(
          x,
          y,
          ColorUtils.getColor(r1 & r2, g1 & g2, b1 & b2, a1 & a2)
        );
      }
    }
    return this;
  }

  /**
   * Modula the colors of [other] with the pixels of this image.
   */
  public modImage(other: MemoryImage): MemoryImage {
    const h = Math.min(this._height, other._height);
    const w = Math.min(this._width, other._width);
    for (let y = 0; y < h; ++y) {
      for (let x = 0; x < w; ++x) {
        const c1 = this.getPixel(x, y);
        const r1 = ColorUtils.getRed(c1);
        const g1 = ColorUtils.getGreen(c1);
        const b1 = ColorUtils.getBlue(c1);
        const a1 = ColorUtils.getAlpha(c1);

        const c2 = other.getPixel(x, y);
        const r2 = ColorUtils.getRed(c2);
        const g2 = ColorUtils.getGreen(c2);
        const b2 = ColorUtils.getBlue(c2);
        const a2 = ColorUtils.getAlpha(c2);

        this.setPixel(
          x,
          y,
          ColorUtils.getColor(r1 % r2, g1 % g2, b1 % b2, a1 % a2)
        );
      }
    }
    return this;
  }

  /**
   * Get a pixel from the buffer. No range checking is done.\
   */
  public getPixelByIndex(index: number): number {
    return this._data[index];
  }

  /**
   * Set a pixel in the buffer. No range checking is done.
   */
  public setPixelByIndex(index: number, color: number): void {
    this._data[index] = color;
  }

  /**
   * Get the buffer index for the [x], [y] pixel coordinates.
   * No range checking is done.
   */
  public getBufferIndex(x: number, y: number): number {
    return y * this._width + x;
  }

  /**
   * Is the given [x], [y] pixel coordinates within the resolution of the image.
   */
  public boundsSafe(x: number, y: number): boolean {
    return x >= 0 && x < this._width && y >= 0 && y < this._height;
  }

  /**
   * Get the pixel from the given [x], [y] coordinate. Color is encoded in a
   * Uint32 as #AABBGGRR. No range checking is done.
   */
  public getPixel(x: number, y: number): number {
    const index = this.getBufferIndex(x, y);
    return this._data[index];
  }

  /**
   * Get the pixel from the given [x], [y] coordinate. Color is encoded in a
   * Uint32 as #AABBGGRR. If the pixel coordinates are out of bounds, 0 is
   * returned.
   */
  public getPixelSafe(x: number, y: number): number {
    const index = this.getBufferIndex(x, y);
    return this.boundsSafe(x, y) ? this._data[index] : 0;
  }

  /**
   * Get the pixel using the given [interpolation] type for non-integer pixel
   * coordinates.
   */
  public getPixelInterpolate(
    fx: number,
    fy: number,
    interpolation: Interpolation = Interpolation.linear
  ): number {
    if (interpolation === Interpolation.cubic) {
      return this.getPixelCubic(fx, fy);
    } else if (interpolation === Interpolation.linear) {
      return this.getPixelLinear(fx, fy);
    }
    return this.getPixelSafe(Math.trunc(fx), Math.trunc(fy));
  }

  /**
   * Get the pixel using linear interpolation for non-integer pixel
   * coordinates.
   */
  public getPixelLinear(fx: number, fy: number): number {
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
      return Math.trunc(
        icc + dx * (inc - icc + dy * (icc + inn - icn - inc)) + dy * (icn - icc)
      );
    };

    const icc = this.getPixelSafe(x, y);
    const icn = ny >= this._height ? icc : this.getPixelSafe(x, ny);
    const inc = nx >= this._width ? icc : this.getPixelSafe(nx, y);
    const inn =
      nx >= this._width || ny >= this._height ? icc : this.getPixelSafe(nx, ny);

    return ColorUtils.getColor(
      linear(
        ColorUtils.getRed(icc),
        ColorUtils.getRed(inc),
        ColorUtils.getRed(icn),
        ColorUtils.getRed(inn)
      ),
      linear(
        ColorUtils.getGreen(icc),
        ColorUtils.getGreen(inc),
        ColorUtils.getGreen(icn),
        ColorUtils.getGreen(inn)
      ),
      linear(
        ColorUtils.getBlue(icc),
        ColorUtils.getBlue(inc),
        ColorUtils.getBlue(icn),
        ColorUtils.getBlue(inn)
      ),
      linear(
        ColorUtils.getAlpha(icc),
        ColorUtils.getAlpha(inc),
        ColorUtils.getAlpha(icn),
        ColorUtils.getAlpha(inn)
      )
    );
  }

  /**
   * Get the pixel using cubic interpolation for non-integer pixel
   * coordinates.
   */
  public getPixelCubic(fx: number, fy: number): number {
    const x = Math.trunc(fx) - (fx >= 0.0 ? 0 : 1);
    const px = x - 1;
    const nx = x + 1;
    const ax = x + 2;
    const y = Math.trunc(fy) - (fy >= 0.0 ? 0 : 1);
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
            (dx * (dx * (2 * ipp)) - 5 * icp + 4 * inp - iap) +
            dx * (dx * (dx * (-ipp + 3 * icp - 3 * inp + iap))))
      );
    };

    const icc = this.getPixelSafe(x, y);

    const ipp = px < 0 || py < 0 ? icc : this.getPixelSafe(px, py);
    const icp = px < 0 ? icc : this.getPixelSafe(x, py);
    const inp = py < 0 || nx >= this._width ? icc : this.getPixelSafe(nx, py);
    const iap = ax >= this._width || py < 0 ? icc : this.getPixelSafe(ax, py);

    const ip0 = cubic(
      dx,
      ColorUtils.getRed(ipp),
      ColorUtils.getRed(icp),
      ColorUtils.getRed(inp),
      ColorUtils.getRed(iap)
    );

    const ip1 = cubic(
      dx,
      ColorUtils.getGreen(ipp),
      ColorUtils.getGreen(icp),
      ColorUtils.getGreen(inp),
      ColorUtils.getGreen(iap)
    );
    const ip2 = cubic(
      dx,
      ColorUtils.getBlue(ipp),
      ColorUtils.getBlue(icp),
      ColorUtils.getBlue(inp),
      ColorUtils.getBlue(iap)
    );
    const ip3 = cubic(
      dx,
      ColorUtils.getAlpha(ipp),
      ColorUtils.getAlpha(icp),
      ColorUtils.getAlpha(inp),
      ColorUtils.getAlpha(iap)
    );

    const ipc = px < 0 ? icc : this.getPixelSafe(px, y);
    const inc = nx >= this._width ? icc : this.getPixelSafe(nx, y);
    const iac = ax >= this._width ? icc : this.getPixelSafe(ax, y);

    const Ic0 = cubic(
      dx,
      ColorUtils.getRed(ipc),
      ColorUtils.getRed(icc),
      ColorUtils.getRed(inc),
      ColorUtils.getRed(iac)
    );
    const Ic1 = cubic(
      dx,
      ColorUtils.getGreen(ipc),
      ColorUtils.getGreen(icc),
      ColorUtils.getGreen(inc),
      ColorUtils.getGreen(iac)
    );
    const Ic2 = cubic(
      dx,
      ColorUtils.getBlue(ipc),
      ColorUtils.getBlue(icc),
      ColorUtils.getBlue(inc),
      ColorUtils.getBlue(iac)
    );
    const Ic3 = cubic(
      dx,
      ColorUtils.getAlpha(ipc),
      ColorUtils.getAlpha(icc),
      ColorUtils.getAlpha(inc),
      ColorUtils.getAlpha(iac)
    );

    const ipn = px < 0 || ny >= this._height ? icc : this.getPixelSafe(px, ny);
    const icn = ny >= this._height ? icc : this.getPixelSafe(x, ny);
    const inn =
      nx >= this._width || ny >= this._height ? icc : this.getPixelSafe(nx, ny);
    const ian =
      ax >= this._width || ny >= this._height ? icc : this.getPixelSafe(ax, ny);

    const in0 = cubic(
      dx,
      ColorUtils.getRed(ipn),
      ColorUtils.getRed(icn),
      ColorUtils.getRed(inn),
      ColorUtils.getRed(ian)
    );
    const in1 = cubic(
      dx,
      ColorUtils.getGreen(ipn),
      ColorUtils.getGreen(icn),
      ColorUtils.getGreen(inn),
      ColorUtils.getGreen(ian)
    );
    const in2 = cubic(
      dx,
      ColorUtils.getBlue(ipn),
      ColorUtils.getBlue(icn),
      ColorUtils.getBlue(inn),
      ColorUtils.getBlue(ian)
    );
    const in3 = cubic(
      dx,
      ColorUtils.getAlpha(ipn),
      ColorUtils.getAlpha(icn),
      ColorUtils.getAlpha(inn),
      ColorUtils.getAlpha(ian)
    );

    const ipa = px < 0 || ay >= this._height ? icc : this.getPixelSafe(px, ay);
    const ica = ay >= this._height ? icc : this.getPixelSafe(x, ay);
    const ina =
      nx >= this._width || ay >= this._height ? icc : this.getPixelSafe(nx, ay);
    const iaa =
      ax >= this._width || ay >= this._height ? icc : this.getPixelSafe(ax, ay);

    const ia0 = cubic(
      dx,
      ColorUtils.getRed(ipa),
      ColorUtils.getRed(ica),
      ColorUtils.getRed(ina),
      ColorUtils.getRed(iaa)
    );
    const ia1 = cubic(
      dx,
      ColorUtils.getGreen(ipa),
      ColorUtils.getGreen(ica),
      ColorUtils.getGreen(ina),
      ColorUtils.getGreen(iaa)
    );
    const ia2 = cubic(
      dx,
      ColorUtils.getBlue(ipa),
      ColorUtils.getBlue(ica),
      ColorUtils.getBlue(ina),
      ColorUtils.getBlue(iaa)
    );
    const ia3 = cubic(
      dx,
      ColorUtils.getAlpha(ipa),
      ColorUtils.getAlpha(ica),
      ColorUtils.getAlpha(ina),
      ColorUtils.getAlpha(iaa)
    );

    const c0 = cubic(dy, ip0, Ic0, in0, ia0);
    const c1 = cubic(dy, ip1, Ic1, in1, ia1);
    const c2 = cubic(dy, ip2, Ic2, in2, ia2);
    const c3 = cubic(dy, ip3, Ic3, in3, ia3);

    return ColorUtils.getColor(
      Math.trunc(c0),
      Math.trunc(c1),
      Math.trunc(c2),
      Math.trunc(c3)
    );
  }

  /**
   * Set the pixel at the given [x], [y] coordinate to the [color].
   * No range checking is done.
   */
  public setPixel(x: number, y: number, color: number): void {
    const index = this.getBufferIndex(x, y);
    this._data[index] = color;
  }

  /**
   * Set the pixel at the given [x], [y] coordinate to the [color].
   * If the pixel coordinates are out of bounds, nothing is done.
   */
  public setPixelSafe(x: number, y: number, color: number): void {
    if (this.boundsSafe(x, y)) {
      const index = this.getBufferIndex(x, y);
      this._data[index] = color;
    }
  }

  /**
   * Set the pixel at the given [x], [y] coordinate to the color
   * [r], [g], [b], [a].
   *
   * This simply replaces the existing color, it does not do any alpha
   * blending. Use [drawPixel] for that. No range checking is done.
   */
  public setPixelRgba(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a = 0xff
  ): void {
    const index = this.getBufferIndex(x, y);
    this._data[index] = ColorUtils.getColor(r, g, b, a);
  }

  /**
   * Return the average gray value of the image.
   */
  public getWhiteBalance(asDouble = false) {
    const len = this._data.length;
    let r = 0.0;
    let g = 0.0;
    let b = 0.0;
    let t = 1;
    for (let i = 0; i < len; ++i) {
      r += (ColorUtils.getRed(this._data[i]) - r) / t;
      g += (ColorUtils.getGreen(this._data[i]) - g) / t;
      b += (ColorUtils.getBlue(this._data[i]) - b) / t;
      ++t;
    }
    const averageGray = (r + g + b) / 3.0;
    return asDouble ? averageGray : Math.trunc(averageGray);
  }

  public addTextData(data: Map<string, string>): void {
    if (this._textData === undefined) {
      this._textData = new Map<string, string>();
    }
    for (const [key, value] of data) {
      this._textData.set(key, value);
    }
  }
}
