/** @format */

import { Color } from '../../color/color.js';
import { ColorUtils } from '../../color/color-utils.js';
import { InputBuffer } from '../../common/input-buffer.js';
import { MathUtils } from '../../common/math-utils.js';
import { LibError } from '../../error/lib-error.js';
import { MemoryImage } from '../../image/image.js';
import { Pixel } from '../../image/pixel.js';
import { DecodeInfo } from '../decode-info.js';
import { PsdBlendMode } from './psd-blend-mode.js';
import { PsdChannel } from './psd-channel.js';
import { PsdColorMode } from './psd-color-mode.js';
import { PsdImageResource } from './psd-image-resource.js';
import { PsdLayer } from './psd-layer.js';

/**
 * Represents a PSD image and provides methods to decode and render it.
 */
export class PsdImage implements DecodeInfo {
  /**
   * PSD file signature '8BPS'.
   */
  public static readonly psdSignature: number = 0x38425053;

  /**
   * Resource block signature '8BIM'.
   */
  public static readonly resourceBlockSignature: number = 0x3842494d;

  private _input: InputBuffer<Uint8Array> | undefined;
  public get input(): InputBuffer<Uint8Array> | undefined {
    return this._input;
  }

  private _imageData: InputBuffer<Uint8Array> | undefined;
  private _imageResourceData: InputBuffer<Uint8Array> | undefined;
  private _layerAndMaskData: InputBuffer<Uint8Array> | undefined;

  private _width: number = 0;
  public get width(): number {
    return this._width;
  }

  private _height: number = 0;
  public get height(): number {
    return this._height;
  }

  private readonly _backgroundColor: Color | undefined = undefined;
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  /**
   * The number of frames that can be decoded.
   */
  private readonly _numFrames: number = 1;
  public get numFrames(): number {
    return this._numFrames;
  }

  private _signature: number | undefined;
  public get signature(): number | undefined {
    return this._signature;
  }

  private _version: number | undefined;
  public get version(): number | undefined {
    return this._version;
  }

  private _channels!: number;
  public get channels(): number {
    return this._channels;
  }

  private _depth!: number;
  public get depth(): number {
    return this._depth;
  }

  private _colorMode: PsdColorMode | undefined;
  public get colorMode(): PsdColorMode | undefined {
    return this._colorMode;
  }

  private _layers!: PsdLayer[];
  public get layers(): PsdLayer[] {
    return this._layers;
  }

  private _mergeImageChannels!: PsdChannel[];
  public get mergeImageChannels(): PsdChannel[] {
    return this._mergeImageChannels;
  }

  private _mergedImage: MemoryImage | undefined;
  public get mergedImage(): MemoryImage | undefined {
    return this._mergedImage;
  }

  private readonly _imageResources: Map<number, PsdImageResource> = new Map();
  public get imageResources(): Map<number, PsdImageResource> {
    return this._imageResources;
  }

  private _hasAlpha: boolean = false;
  public get hasAlpha(): boolean {
    return this._hasAlpha;
  }

  public get isValid(): boolean {
    return this._signature === PsdImage.psdSignature;
  }

  /**
   * Constructs a PsdImage instance from the given byte array.
   * @param {Uint8Array} bytes - The byte array representing the PSD file.
   */
  constructor(bytes: Uint8Array) {
    this._input = new InputBuffer<Uint8Array>({
      buffer: bytes,
      bigEndian: true,
    });

    this.readHeader();
    if (!this.isValid) {
      return;
    }

    let len = this._input.readUint32();
    this._input.readRange(len);

    len = this._input.readUint32();
    this._imageResourceData = this._input.readRange(len);

    len = this._input.readUint32();
    this._layerAndMaskData = this._input.readRange(len);

    this._imageData = this._input.readRange(this._input.length);
  }

  /**
   * Blends two values using the lighten blend mode.
   * @param {number} a - The first value.
   * @param {number} b - The second value.
   * @returns {number} The blended value.
   */
  private static blendLighten(a: number, b: number): number {
    return Math.max(a, b);
  }

  /**
   * Blends two values using the darken blend mode.
   * @param {number} a - The first value.
   * @param {number} b - The second value.
   * @returns {number} The blended value.
   */
  private static blendDarken(a: number, b: number): number {
    return Math.min(a, b);
  }

  /**
   * Blends two values using the multiply blend mode.
   * @param {number} a - The first value.
   * @param {number} b - The second value.
   * @returns {number} The blended value.
   */
  private static blendMultiply(a: number, b: number): number {
    return (a * b) >> 8;
  }

  /**
   * Blends two values using the overlay blend mode.
   * @param {number} a - The first value.
   * @param {number} b - The second value.
   * @param {number} aAlpha - The alpha value of the first value.
   * @param {number} bAlpha - The alpha value of the second value.
   * @returns {number} The blended value.
   */
  private static blendOverlay(
    a: number,
    b: number,
    aAlpha: number,
    bAlpha: number
  ): number {
    const x = a / 255;
    const y = b / 255;
    const aa = aAlpha / 255;
    const ba = bAlpha / 255;

    let z: number = 0;
    if (2 * x < aa) {
      z = 2 * y * x + y * (1 - aa) + x * (1 - ba);
    } else {
      z = ba * aa - 2 * (aa - x) * (ba - y) + y * (1 - aa) + x * (1 - ba);
    }

    return MathUtils.clampInt255(z * 255);
  }

  /**
   * Blends two values using the color burn blend mode.
   * @param {number} a - The first value.
   * @param {number} b - The second value.
   * @returns {number} The blended value.
   */
  private static blendColorBurn(a: number, b: number): number {
    if (b === 0) {
      // We don't want to divide by zero
      return 0;
    }
    const c = Math.trunc(255 * (1 - (1 - a / 255) / (b / 255)));
    return MathUtils.clampInt255(c);
  }

  /**
   * Blends two values using the linear burn blend mode.
   * @param {number} a - The first value.
   * @param {number} b - The second value.
   * @returns {number} The blended value.
   */
  private static blendLinearBurn(a: number, b: number): number {
    return MathUtils.clampInt255(a + b - 255);
  }

  /**
   * Blends two values using the screen blend mode.
   * @param {number} a - The first value.
   * @param {number} b - The second value.
   * @returns {number} The blended value.
   */
  private static blendScreen(a: number, b: number): number {
    return MathUtils.clampInt255(255 - (255 - b) * (255 - a));
  }

  /**
   * Blends two values using the color dodge blend mode.
   * @param {number} a - The first value.
   * @param {number} b - The second value.
   * @returns {number} The blended value.
   */
  private static blendColorDodge(a: number, b: number): number {
    if (b === 255) {
      return 255;
    }
    return MathUtils.clampInt255((a / 255 / (1 - b / 255)) * 255);
  }

  /**
   * Blends two values using the linear dodge blend mode.
   * @param {number} a - The first value.
   * @param {number} b - The second value.
   * @returns {number} The blended value.
   */
  private static blendLinearDodge(a: number, b: number): number {
    return b + a > 255 ? 0xff : a + b;
  }

  /**
   * Blends two values using the soft light blend mode.
   * @param {number} a - The first value.
   * @param {number} b - The second value.
   * @returns {number} The blended value.
   */
  private static blendSoftLight(a: number, b: number): number {
    const aa = a / 255;
    const bb = b / 255;
    return Math.round(
      255 * ((1 - bb) * bb * aa + bb * (1 - (1 - bb) * (1 - aa)))
    );
  }

  /**
   * Blends two values using the hard light blend mode.
   * @param {number} bottom - The bottom value.
   * @param {number} top - The top value.
   * @returns {number} The blended value.
   */
  private static blendHardLight(bottom: number, top: number): number {
    const a = top / 255;
    const b = bottom / 255;
    if (b < 0.5) {
      return Math.round(255 * 2 * a * b);
    } else {
      return Math.round(255 * (1 - 2 * (1 - a) * (1 - b)));
    }
  }

  /**
   * Blends two values using the vivid light blend mode.
   * @param {number} bottom - The bottom value.
   * @param {number} top - The top value.
   * @returns {number} The blended value.
   */
  private static blendVividLight(bottom: number, top: number): number {
    if (top < 128) {
      return this.blendColorBurn(bottom, 2 * top);
    } else {
      return this.blendColorDodge(bottom, 2 * (top - 128));
    }
  }

  /**
   * Blends two values using the linear light blend mode.
   * @param {number} bottom - The bottom value.
   * @param {number} top - The top value.
   * @returns {number} The blended value.
   */
  private static blendLinearLight(bottom: number, top: number): number {
    if (top < 128) {
      return this.blendLinearBurn(bottom, 2 * top);
    } else {
      return this.blendLinearDodge(bottom, 2 * (top - 128));
    }
  }

  /**
   * Blends two values using the pin light blend mode.
   * @param {number} bottom - The bottom value.
   * @param {number} top - The top value.
   * @returns {number} The blended value.
   */
  private static blendPinLight(bottom: number, top: number): number {
    return top < 128
      ? this.blendDarken(bottom, 2 * top)
      : this.blendLighten(bottom, 2 * (top - 128));
  }

  /**
   * Blends two values using the hard mix blend mode.
   * @param {number} bottom - The bottom value.
   * @param {number} top - The top value.
   * @returns {number} The blended value.
   */
  private static blendHardMix(bottom: number, top: number): number {
    return top < 255 - bottom ? 0 : 255;
  }

  /**
   * Blends two values using the difference blend mode.
   * @param {number} bottom - The bottom value.
   * @param {number} top - The top value.
   * @returns {number} The blended value.
   */
  private static blendDifference(bottom: number, top: number): number {
    return Math.abs(top - bottom);
  }

  /**
   * Blends two values using the exclusion blend mode.
   * @param {number} bottom - The bottom value.
   * @param {number} top - The top value.
   * @returns {number} The blended value.
   */
  private static blendExclusion(bottom: number, top: number): number {
    return Math.round(top + bottom - (2 * top * bottom) / 255);
  }

  /**
   * Reads a channel value from the data.
   * @param {Uint8Array} data - The data array.
   * @param {number} si - The start index.
   * @param {number} ns - The number of samples.
   * @returns {number} The channel value.
   */
  private static ch(
    data: Uint8Array | undefined,
    si: number,
    ns: number
  ): number {
    return data === undefined
      ? 0
      : ns === 1
        ? data[si]
        : ((data[si] << 8) | data[si + 1]) >> 8;
  }

  /**
   * Creates an image from the given channels.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {PsdChannel[]} channelList - The list of channels.
   * @param {PsdColorMode} [colorMode] - The color mode.
   * @param {number} [bitDepth] - The bit depth.
   * @returns {MemoryImage} The created image.
   * @throws {LibError} If the bit depth is unsupported or the color mode is unhandled.
   */
  public static createImageFromChannels(
    width: number,
    height: number,
    channelList: PsdChannel[],
    colorMode?: PsdColorMode,
    bitDepth?: number
  ): MemoryImage {
    const channels = new Map<number, PsdChannel>();
    for (const ch of channelList) {
      channels.set(ch.id, ch);
    }

    const numChannels = channelList.length;
    const ns = bitDepth === 8 ? 1 : bitDepth === 16 ? 2 : -1;

    const output = new MemoryImage({
      width: width,
      height: height,
      numChannels: numChannels,
    });

    if (ns === -1) {
      throw new LibError(`PSD: unsupported bit depth: ${bitDepth}`);
    }

    const channel0 = channels.get(0);
    const channel1 = channels.get(1);
    const channel2 = channels.get(2);
    const channel_1 = channels.get(-1);

    let si = -ns;
    for (const p of output) {
      si += ns;
      switch (colorMode) {
        case PsdColorMode.rgb: {
          p.r = this.ch(channel0!.data, si, ns);
          p.g = this.ch(channel1!.data, si, ns);
          p.b = this.ch(channel2!.data, si, ns);
          p.a = numChannels >= 4 ? this.ch(channel_1!.data, si, ns) : 255;

          if (p.a !== 0) {
            // Photoshop/Gimp blend the image against white (argh!),
            // which is not what we want for compositing. Invert the blend
            // operation to try and undo the damage.
            p.r = ((p.r + p.a - 255) * 255) / p.a;
            p.g = ((p.g + p.a - 255) * 255) / p.a;
            p.b = ((p.b + p.a - 255) * 255) / p.a;
          }
          break;
        }
        case PsdColorMode.lab: {
          const L = (this.ch(channel0!.data, si, ns) * 100) >> 8;
          const a = this.ch(channel1!.data, si, ns) - 128;
          const b = this.ch(channel2!.data, si, ns) - 128;
          const alpha =
            numChannels >= 4 ? this.ch(channel_1!.data, si, ns) : 255;
          const rgb = ColorUtils.labToRgb(L, a, b);
          p.r = rgb[0];
          p.g = rgb[1];
          p.b = rgb[2];
          p.a = alpha;
          break;
        }
        case PsdColorMode.grayscale: {
          const gray = this.ch(channel0!.data, si, ns);
          const alpha =
            numChannels >= 2 ? this.ch(channel_1!.data, si, ns) : 255;
          p.r = gray;
          p.g = gray;
          p.b = gray;
          p.a = alpha;
          break;
        }
        case PsdColorMode.cmyk: {
          const c = this.ch(channel0!.data, si, ns);
          const m = this.ch(channel1!.data, si, ns);
          const y = this.ch(channel2!.data, si, ns);
          const k = this.ch(
            channels.get(numChannels === 4 ? -1 : 3)!.data,
            si,
            ns
          );
          const alpha =
            numChannels >= 5 ? this.ch(channel_1!.data, si, ns) : 255;
          const rgb = ColorUtils.cmykToRgb(255 - c, 255 - m, 255 - y, 255 - k);
          p.r = rgb[0];
          p.g = rgb[1];
          p.b = rgb[2];
          p.a = alpha;
          break;
        }
        default:
          throw new LibError(`Unhandled color mode: ${colorMode}`);
      }
    }

    return output;
  }

  /**
   * Blends two pixels using the specified blend mode and opacity.
   *
   * @param {number} ar - The red component of the first pixel.
   * @param {number} ag - The green component of the first pixel.
   * @param {number} ab - The blue component of the first pixel.
   * @param {number} aa - The alpha component of the first pixel.
   * @param {number} br - The red component of the second pixel.
   * @param {number} bg - The green component of the second pixel.
   * @param {number} bb - The blue component of the second pixel.
   * @param {number} ba - The alpha component of the second pixel.
   * @param {number} blendMode - The blend mode to use.
   * @param {number} opacity - The opacity to use.
   * @param {Pixel} p - The pixel to store the result.
   */
  private blend(
    ar: number,
    ag: number,
    ab: number,
    aa: number,
    br: number,
    bg: number,
    bb: number,
    ba: number,
    blendMode: number,
    opacity: number,
    p: Pixel
  ): void {
    let r = br;
    let g = bg;
    let b = bb;
    let a = ba;
    const da = (ba / 255) * opacity;

    switch (blendMode) {
      case PsdBlendMode.passThrough:
        r = ar;
        g = ag;
        b = ab;
        a = aa;
        break;
      case PsdBlendMode.normal:
        break;
      case PsdBlendMode.dissolve:
        break;
      case PsdBlendMode.darken:
        r = PsdImage.blendDarken(ar, br);
        g = PsdImage.blendDarken(ag, bg);
        b = PsdImage.blendDarken(ab, bb);
        break;
      case PsdBlendMode.multiply:
        r = PsdImage.blendMultiply(ar, br);
        g = PsdImage.blendMultiply(ag, bg);
        b = PsdImage.blendMultiply(ab, bb);
        break;
      case PsdBlendMode.colorBurn:
        r = PsdImage.blendColorBurn(ar, br);
        g = PsdImage.blendColorBurn(ag, bg);
        b = PsdImage.blendColorBurn(ab, bb);
        break;
      case PsdBlendMode.linearBurn:
        r = PsdImage.blendLinearBurn(ar, br);
        g = PsdImage.blendLinearBurn(ag, bg);
        b = PsdImage.blendLinearBurn(ab, bb);
        break;
      case PsdBlendMode.darkenColor:
        break;
      case PsdBlendMode.lighten:
        r = PsdImage.blendLighten(ar, br);
        g = PsdImage.blendLighten(ag, bg);
        b = PsdImage.blendLighten(ab, bb);
        break;
      case PsdBlendMode.screen:
        r = PsdImage.blendScreen(ar, br);
        g = PsdImage.blendScreen(ag, bg);
        b = PsdImage.blendScreen(ab, bb);
        break;
      case PsdBlendMode.colorDodge:
        r = PsdImage.blendColorDodge(ar, br);
        g = PsdImage.blendColorDodge(ag, bg);
        b = PsdImage.blendColorDodge(ab, bb);
        break;
      case PsdBlendMode.linearDodge:
        r = PsdImage.blendLinearDodge(ar, br);
        g = PsdImage.blendLinearDodge(ag, bg);
        b = PsdImage.blendLinearDodge(ab, bb);
        break;
      case PsdBlendMode.lighterColor:
        break;
      case PsdBlendMode.overlay:
        r = PsdImage.blendOverlay(ar, br, aa, ba);
        g = PsdImage.blendOverlay(ag, bg, aa, ba);
        b = PsdImage.blendOverlay(ab, bb, aa, ba);
        break;
      case PsdBlendMode.softLight:
        r = PsdImage.blendSoftLight(ar, br);
        g = PsdImage.blendSoftLight(ag, bg);
        b = PsdImage.blendSoftLight(ab, bb);
        break;
      case PsdBlendMode.hardLight:
        r = PsdImage.blendHardLight(ar, br);
        g = PsdImage.blendHardLight(ag, bg);
        b = PsdImage.blendHardLight(ab, bb);
        break;
      case PsdBlendMode.vividLight:
        r = PsdImage.blendVividLight(ar, br);
        g = PsdImage.blendVividLight(ag, bg);
        b = PsdImage.blendVividLight(ab, bb);
        break;
      case PsdBlendMode.linearLight:
        r = PsdImage.blendLinearLight(ar, br);
        g = PsdImage.blendLinearLight(ag, bg);
        b = PsdImage.blendLinearLight(ab, bb);
        break;
      case PsdBlendMode.pinLight:
        r = PsdImage.blendPinLight(ar, br);
        g = PsdImage.blendPinLight(ag, bg);
        b = PsdImage.blendPinLight(ab, bb);
        break;
      case PsdBlendMode.hardMix:
        r = PsdImage.blendHardMix(ar, br);
        g = PsdImage.blendHardMix(ag, bg);
        b = PsdImage.blendHardMix(ab, bb);
        break;
      case PsdBlendMode.difference:
        r = PsdImage.blendDifference(ar, br);
        g = PsdImage.blendDifference(ag, bg);
        b = PsdImage.blendDifference(ab, bb);
        break;
      case PsdBlendMode.exclusion:
        r = PsdImage.blendExclusion(ar, br);
        g = PsdImage.blendExclusion(ag, bg);
        b = PsdImage.blendExclusion(ab, bb);
        break;
      case PsdBlendMode.subtract:
        break;
      case PsdBlendMode.divide:
        break;
      case PsdBlendMode.hue:
        break;
      case PsdBlendMode.saturation:
        break;
      case PsdBlendMode.color:
        break;
      case PsdBlendMode.luminosity:
        break;
    }

    p.r = Math.trunc(ar * (1 - da) + r * da);
    p.g = Math.trunc(ag * (1 - da) + g * da);
    p.b = Math.trunc(ab * (1 - da) + b * da);
    p.a = Math.trunc(aa * (1 - da) + a * da);
  }

  /**
   * Reads the header information from the input stream and initializes
   * the corresponding properties of the class. This includes reading
   * the signature, version, channels, dimensions, depth, and color mode.
   * If the version is not 1 or the padding is not all zeros, the signature
   * is set to 0 to indicate an invalid header.
   */
  private readHeader(): void {
    this._signature = this._input!.readUint32();
    this._version = this._input!.readUint16();

    // version should be 1 (2 for PSB files).
    if (this.version !== 1) {
      this._signature = 0;
      return;
    }

    // padding should be all 0's
    const padding = this._input!.readRange(6);
    for (let i = 0; i < 6; ++i) {
      if (padding.get(i) !== 0) {
        this._signature = 0;
        return;
      }
    }

    this._channels = this._input!.readUint16();
    this._height = this._input!.readUint32();
    this._width = this._input!.readUint32();
    this._depth = this._input!.readUint16();
    this._colorMode = this._input!.readUint16() as PsdColorMode;
  }

  /**
   * Reads the color mode data.
   *
   * This method currently does not support indexed and duotone images.
   * TODO: Add support for indexed and duotone images.
   */
  private readColorModeData(): void {}

  private readImageResources(): void {
    this._imageResourceData!.rewind();
    while (!this._imageResourceData!.isEOS) {
      const blockSignature = this._imageResourceData!.readUint32();
      const blockId = this._imageResourceData!.readUint16();

      let len = this._imageResourceData!.read();
      const blockName = this._imageResourceData!.readString(len);
      // name string is padded to an even size
      if ((len & 1) === 0) {
        this._imageResourceData!.skip(1);
      }

      len = this._imageResourceData!.readUint32();
      const blockData = this._imageResourceData!.readRange(len);
      // blocks are padded to an even length.
      if ((len & 1) === 1) {
        this._imageResourceData!.skip(1);
      }

      if (blockSignature === PsdImage.resourceBlockSignature) {
        this._imageResources.set(
          blockId,
          new PsdImageResource(blockId, blockName, blockData)
        );
      }
    }
  }

  private readLayerAndMaskData(): void {
    this._layerAndMaskData!.rewind();
    let len = this._layerAndMaskData!.readUint32();
    if ((len & 1) !== 0) {
      len++;
    }

    const layerData = this._layerAndMaskData!.readRange(len);

    this._layers = [];
    if (len > 0) {
      let count = layerData.readInt16();
      // If it is a negative number, its absolute value is the number of
      // layers and the first alpha channel contains the transparency data for
      // the merged result.
      if (count < 0) {
        this._hasAlpha = true;
        count = -count;
      }

      for (let i = 0; i < count; ++i) {
        const layer = new PsdLayer(layerData);
        this._layers.push(layer);
      }
    }

    for (let i = 0; i < this._layers.length; ++i) {
      this._layers[i].readImageData(layerData, this);
    }

    // Global layer mask info
    len = this._layerAndMaskData!.readUint32();
    const maskData = this._layerAndMaskData!.readRange(len);
    if (len > 0) {
      // let colorSpace: number =
      maskData.readUint16();
      // let rc: number =
      maskData.readUint16();
      // let gc: number =
      maskData.readUint16();
      // let bc: number =
      maskData.readUint16();
      // let ac: number =
      maskData.readUint16();
      // 0-100
      // let opacity: number =
      maskData.readUint16();
      // let kind: number =
      maskData.read();
    }
  }

  /**
   * Reads and merges image data.
   * This method handles different compression types and constructs the merged image.
   */
  private readMergeImageData(): void {
    this._imageData!.rewind();
    const compression = this._imageData!.readUint16();

    let lineLengths: Uint16Array | undefined = undefined;
    if (compression === PsdChannel.compressRle) {
      const numLines = this._height * this._channels;
      lineLengths = new Uint16Array(numLines);
      for (let i = 0; i < numLines; ++i) {
        lineLengths[i] = this._imageData!.readUint16();
      }
    }

    this._mergeImageChannels = [];
    for (let i = 0; i < this._channels; ++i) {
      this._mergeImageChannels.push(
        PsdChannel.read({
          input: this._imageData!,
          id: i === 3 ? -1 : i,
          width: this._width,
          height: this._height,
          bitDepth: this._depth,
          compression: compression,
          planeNumber: i,
          lineLengths: lineLengths,
        })
      );
    }

    this._mergedImage = PsdImage.createImageFromChannels(
      this._width,
      this._height,
      this._mergeImageChannels,
      this._colorMode,
      this._depth
    );
  }

  /**
   * Decode the raw psd structure without rendering the output image.
   * Use renderImage to render the output image.
   *
   * @returns {boolean} Returns true if the decoding is successful, otherwise false.
   */
  public decode(): boolean {
    if (!this.isValid || this._input === undefined) {
      return false;
    }

    // Color Mode Data Block:
    // Indexed and duotone images have palette data in colorData...
    this.readColorModeData();

    // Image Resource Block:
    // Image resources are used to store non-pixel data associated with images,
    // such as pen tool paths.
    this.readImageResources();

    this.readLayerAndMaskData();

    this.readMergeImageData();

    this._input = undefined;
    this._imageResourceData = undefined;
    this._layerAndMaskData = undefined;
    this._imageData = undefined;

    return true;
  }

  /**
   * Decodes an image and returns a MemoryImage object.
   * If the decoding process fails, it returns undefined.
   *
   * @returns {MemoryImage | undefined} The decoded MemoryImage object or undefined if decoding fails.
   */
  public decodeImage(): MemoryImage | undefined {
    if (!this.decode()) {
      return undefined;
    }

    return this.renderImage();
  }

  /**
   * Renders the composite image by blending all visible layers.
   *
   * @returns {MemoryImage} The final merged image.
   */
  public renderImage(): MemoryImage {
    if (this._mergedImage !== undefined) {
      return this._mergedImage!;
    }

    this._mergedImage = new MemoryImage({
      width: this._width,
      height: this._height,
      numChannels: 4,
    });
    this._mergedImage.clear();

    for (let li = 0; li < this._layers.length; ++li) {
      const layer = this._layers[li];
      if (!layer.isVisible) {
        continue;
      }

      const opacity = layer.opacity / 255;
      const blendMode = layer.blendMode;

      const src = layer.layerImage;

      for (let y = 0, sy = layer.top!; y < layer.height; ++y, ++sy) {
        const dy = layer.top! + y;
        for (let x = 0, sx = layer.left!; x < layer.width; ++x, ++sx) {
          const srcP = src.getPixel(x, y);
          const br = Math.trunc(srcP.r);
          const bg = Math.trunc(srcP.g);
          const bb = Math.trunc(srcP.b);
          const ba = Math.trunc(srcP.a);

          if (sx! >= 0 && sx < this._width && sy >= 0 && sy < this._height) {
            const dx = layer.left! + x;
            const p = this._mergedImage!.getPixel(dx, dy);
            const ar = Math.trunc(p.r);
            const ag = Math.trunc(p.g);
            const ab = Math.trunc(p.b);
            const aa = Math.trunc(p.a);

            this.blend(ar, ag, ab, aa, br, bg, bb, ba, blendMode, opacity, p);
          }
        }
      }
    }

    return this._mergedImage;
  }
}
