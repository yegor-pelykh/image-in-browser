/** @format */

import { MemoryImage } from '../common/memory-image';
import { RgbChannelSet } from '../common/rgb-channel-set';
import { HdrSlice } from './hdr-slice';

/**
 * A high dynamic range RGBA image stored in 16-bit or 32-bit floating-point
 * channels.
 */
export class HdrImage {
  /**
   * Red value of a sample
   */
  private static R = 'R';
  /**
   * Green value of a sample
   */
  private static G = 'G';
  /**
   * Blue value of a sample
   */
  private static B = 'B';
  /**
   * Alpha/opacity
   */
  private static A = 'A';
  /**
   * Distance of the front of a sample from the viewer
   */
  private static Z = 'Z';

  private readonly _slices: Map<string, HdrSlice> = new Map<string, HdrSlice>();
  public get slices(): Map<string, HdrSlice> {
    return this._slices;
  }

  private _red: HdrSlice | undefined = undefined;
  public get red(): HdrSlice | undefined {
    return this._red;
  }

  private _green: HdrSlice | undefined = undefined;
  public get green(): HdrSlice | undefined {
    return this._green;
  }

  private _blue: HdrSlice | undefined = undefined;
  public get blue(): HdrSlice | undefined {
    return this._blue;
  }

  private _alpha: HdrSlice | undefined = undefined;
  public get alpha(): HdrSlice | undefined {
    return this._alpha;
  }

  private _depth: HdrSlice | undefined = undefined;
  public get depth(): HdrSlice | undefined {
    return this._depth;
  }

  /**
   * Does the image have any color channels?
   */
  get hasColor(): boolean {
    return (
      this.red !== undefined ||
      this.green !== undefined ||
      this.blue !== undefined
    );
  }

  /**
   * Does the image have an alpha channel?
   */
  get hasAlpha(): boolean {
    return this.alpha !== undefined;
  }

  /**
   * Does the image have a depth channel?
   */
  get hasDepth(): boolean {
    return this.depth !== undefined;
  }

  /**
   * The width of the framebuffer.
   */
  get width(): number {
    if (this.slices.size > 0) {
      const firstSlice = this.slices.values().next().value as HdrSlice;
      return firstSlice.width;
    } else {
      return 0;
    }
  }

  /**
   * The height of the framebuffer.
   */
  get height(): number {
    if (this.slices.size > 0) {
      const firstSlice = this.slices.values().next().value as HdrSlice;
      return firstSlice.height;
    } else {
      return 0;
    }
  }

  /**
   * The number of bits per sample.
   */
  get bitsPerSample(): number {
    if (this.red !== undefined) {
      return this.red.bitsPerSample;
    } else {
      if (this.slices.size > 0) {
        const firstSlice = this.slices.values().next().value as HdrSlice;
        return firstSlice.bitsPerSample;
      } else {
        return 0;
      }
    }
  }

  get sampleFormat(): number {
    if (this.red !== undefined) {
      return this.red.format;
    } else {
      if (this.slices.size > 0) {
        const firstSlice = this.slices.values().next().value as HdrSlice;
        return firstSlice.format;
      } else {
        return 0;
      }
    }
  }

  /**
   * The number of channels used by the image
   */
  get numberOfChannels(): number {
    return this.slices.size;
  }

  /**
   * Create an RGB[A] image.
   */
  public static create(
    width: number,
    height: number,
    channels: number,
    type: number,
    bitsPerSample: number
  ): HdrImage {
    const image = new HdrImage();
    if (0 <= channels && channels <= 4) {
      const channelList = [HdrImage.R, HdrImage.G, HdrImage.B, HdrImage.A];
      for (let i = 0; i < channels; ++i) {
        image.addChannel(
          new HdrSlice({
            name: channelList[i],
            width: width,
            height: height,
            format: type,
            bitsPerSample: bitsPerSample,
          })
        );
      }
      return image;
    } else {
      return image;
    }
  }

  /**
   * Create a copy of the [other] HdrImage.
   */
  public static from(other: HdrImage): HdrImage {
    const image = new HdrImage();
    for (const [, value] of other.slices) {
      image.addChannel(HdrSlice.from(value));
    }
    return image;
  }

  /**
   * Create an HDR image from a LDR [Image] by transforming the channel values
   * to the range [0, 1].
   */
  public static fromImage(
    other: MemoryImage,
    type: number = HdrSlice.FLOAT,
    bitsPerSample = 16
  ): HdrImage {
    const image = new HdrImage();
    image.addChannel(
      new HdrSlice({
        name: HdrImage.R,
        width: other.width,
        height: other.height,
        format: type,
        bitsPerSample: bitsPerSample,
      })
    );
    image.addChannel(
      new HdrSlice({
        name: HdrImage.G,
        width: other.width,
        height: other.height,
        format: type,
        bitsPerSample: bitsPerSample,
      })
    );
    image.addChannel(
      new HdrSlice({
        name: HdrImage.B,
        width: other.width,
        height: other.height,
        format: type,
        bitsPerSample: bitsPerSample,
      })
    );
    if (other.rgbChannelSet === RgbChannelSet.rgba) {
      image.addChannel(
        new HdrSlice({
          name: HdrImage.A,
          width: other.width,
          height: other.height,
          format: type,
          bitsPerSample: bitsPerSample,
        })
      );
    }
    const rgb = other.getBytes();
    for (let y = 0, si = 0; y < other.height; ++y) {
      for (let x = 0; x < other.width; ++x) {
        image.setRed(x, y, rgb[si++] / 255);
        image.setGreen(x, y, rgb[si++] / 255);
        image.setBlue(x, y, rgb[si++] / 255);
        if (image.alpha !== undefined) {
          image.setAlpha(x, y, rgb[si++] / 255);
        }
      }
    }
    return image;
  }

  /**
   * Get the value of the red channel at the given pixel coordinates [x], [y].
   */
  public getRed(x: number, y: number): number {
    if (this.red !== undefined) {
      return this.red.isFloat ? this.red.getFloat(x, y) : this.red.getInt(x, y);
    } else {
      return 0;
    }
  }

  /**
   * Set the value of the red channel at the given pixel coordinates [x], [y].
   */
  public setRed(x: number, y: number, c: number): void {
    if (this.red !== undefined) {
      if (this.red.isFloat) {
        this.red.setFloat(x, y, c);
      } else {
        this.red.setInt(x, y, c);
      }
    }
  }

  public setRedInt(x: number, y: number, c: number): void {
    if (this.red !== undefined) {
      this.red.setInt(x, y, c);
    }
  }

  /**
   * Get the value of the green channel at the given pixel coordinates [x], [y].
   */
  public getGreen(x: number, y: number): number {
    if (this.green !== undefined) {
      return this.green.isFloat
        ? this.green.getFloat(x, y)
        : this.green.getInt(x, y);
    } else {
      return 0;
    }
  }

  /**
   * Set the value of the green channel at the given pixel coordinates [x], [y].
   */
  public setGreen(x: number, y: number, c: number): void {
    if (this.green !== undefined) {
      if (this.green.isFloat) {
        this.green.setFloat(x, y, c);
      } else {
        this.green.setInt(x, y, c);
      }
    }
  }

  public setGreenInt(x: number, y: number, c: number): void {
    if (this.green !== undefined) {
      this.green.setInt(x, y, c);
    }
  }

  /**
   * Get the value of the blue channel at the given pixel coordinates [x], [y].
   */
  public getBlue(x: number, y: number): number {
    if (this.blue !== undefined) {
      return this.blue.isFloat
        ? this.blue.getFloat(x, y)
        : this.blue.getInt(x, y);
    } else {
      return 0;
    }
  }
  /**
   * Set the value of the blue channel at the given pixel coordinates [x], [y].
   */
  public setBlue(x: number, y: number, c: number): void {
    if (this.blue !== undefined) {
      if (this.blue.isFloat) {
        this.blue.setFloat(x, y, c);
      } else {
        this.blue.setInt(x, y, c);
      }
    }
  }

  public setBlueInt(x: number, y: number, c: number): void {
    if (this.blue !== undefined) {
      this.blue.setInt(x, y, c);
    }
  }

  /**
   * Get the value of the alpha channel at the given pixel coordinates [x], [y].
   */
  public getAlpha(x: number, y: number): number {
    if (this.alpha !== undefined) {
      return this.alpha.isFloat
        ? this.alpha.getFloat(x, y)
        : this.alpha.getInt(x, y);
    } else {
      return 0;
    }
  }

  /**
   * Set the value of the alpha channel at the given pixel coordinates [x], [y].
   */
  public setAlpha(x: number, y: number, c: number): void {
    if (this.alpha !== undefined) {
      if (this.alpha.isFloat) {
        this.alpha.setFloat(x, y, c);
      } else {
        this.alpha.setInt(x, y, c);
      }
    }
  }

  public setAlphaInt(x: number, y: number, c: number): void {
    if (this.alpha !== undefined) {
      this.alpha.setInt(x, y, c);
    }
  }

  /**
   * Get the value of the depth channel at the given pixel coordinates [x], [y].
   */
  public getDepth(x: number, y: number): number {
    if (this.depth !== undefined) {
      return this.depth.isFloat
        ? this.depth.getFloat(x, y)
        : this.depth.getInt(x, y);
    } else {
      return 0;
    }
  }

  /**
   * Set the value of the depth channel at the given pixel coordinates [x], [y].
   */
  public setDepth(x: number, y: number, c: number): void {
    if (this.depth !== undefined) {
      if (this.depth.isFloat) {
        this.depth.setFloat(x, y, c);
      } else {
        this.depth.setInt(x, y, c);
      }
    }
  }

  public setDepthInt(x: number, y: number, c: number): void {
    if (this.depth !== undefined) {
      this.depth.setInt(x, y, c);
    }
  }

  /**
   * Does this image contain the given channel?
   */
  public hasChannel(ch: string): boolean {
    return this.slices.has(ch);
  }

  /**
   * Access a framebuffer slice by name.
   */
  public getChannel(ch: string): HdrSlice | undefined {
    return this.slices.get(ch);
  }

  /**
   * Add a channel [slice] to the
   */
  public addChannel(slice: HdrSlice): void {
    const ch = slice.name;
    this.slices.set(ch, slice);
    switch (ch) {
      case HdrImage.R:
        this._red = slice;
        break;
      case HdrImage.G:
        this._green = slice;
        break;
      case HdrImage.B:
        this._blue = slice;
        break;
      case HdrImage.A:
        this._alpha = slice;
        break;
      case HdrImage.Z:
        this._depth = slice;
        break;
    }
  }

  /**
   * Convert the framebuffer to an floating-point image, as a sequence of
   * floats in RGBA order.
   */
  public toFloatRgba(): Float32Array {
    const rgba = new Float32Array(this.width * this.height * 4);
    const w = this.width;
    const h = this.height;
    for (let y = 0, di = 0; y < h; ++y) {
      for (let x = 0; x < w; ++x) {
        rgba[di++] = this.red === undefined ? 0.0 : this.red.getFloat(x, y);
        rgba[di++] = this.green === undefined ? 0.0 : this.green.getFloat(x, y);
        rgba[di++] = this.blue === undefined ? 0.0 : this.blue.getFloat(x, y);
        rgba[di++] = this.alpha === undefined ? 1.0 : this.alpha.getFloat(x, y);
      }
    }
    return rgba;
  }
}
