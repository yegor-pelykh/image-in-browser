/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { LibError } from '../../error/lib-error.js';
import { MemoryImage } from '../../image/image.js';
import { PsdBevelEffect } from './effect/psd-bevel-effect.js';
import { PsdDropShadowEffect } from './effect/psd-drop-shadow-effect.js';
import { PsdEffect } from './effect/psd-effect.js';
import { PsdInnerGlowEffect } from './effect/psd-inner-glow-effect.js';
import { PsdInnerShadowEffect } from './effect/psd-inner-shadow-effect.js';
import { PsdOuterGlowEffect } from './effect/psd-outer-glow-effect.js';
import { PsdSolidFillEffect } from './effect/psd-solid-fill-effect.js';
import { PsdLayerAdditionalData } from './layer-data/psd-layer-additional-data.js';
import { PsdLayerData } from './layer-data/psd-layer-data.js';
import { PsdLayerDataFactory } from './layer-data/psd-layer-data-factory.js';
import { PsdLayerSectionDivider } from './layer-data/psd-layer-section-divider.js';
import { PsdBlendingRanges } from './psd-blending-ranges.js';
import { PsdChannel } from './psd-channel.js';
import { PsdFlag } from './psd-flag.js';
import { PsdImage } from './psd-image.js';
import { PsdMask } from './psd-mask.js';

/**
 * Represents a layer in a PSD file.
 */
export class PsdLayer {
  /**
   * The signature for PSD layers.
   */
  public static readonly signature: number = 0x3842494d;

  private _top: number | undefined;
  /**
   * Gets the top position of the layer.
   */
  public get top(): number | undefined {
    return this._top;
  }

  private _left: number | undefined;
  /**
   * Gets the left position of the layer.
   */
  public get left(): number | undefined {
    return this._left;
  }

  private _bottom: number;
  /**
   * Gets the bottom position of the layer.
   */
  public get bottom(): number {
    return this._bottom;
  }

  private _right: number;
  /**
   * Gets the right position of the layer.
   */
  public get right(): number {
    return this._right;
  }

  private _width: number;
  /**
   * Gets the width of the layer.
   */
  public get width(): number {
    return this._width;
  }

  private _height: number;
  /**
   * Gets the height of the layer.
   */
  public get height(): number {
    return this._height;
  }

  private _blendMode: number;
  /**
   * Gets the blend mode of the layer.
   */
  public get blendMode(): number {
    return this._blendMode;
  }

  private _opacity: number;
  /**
   * Gets the opacity of the layer.
   */
  public get opacity(): number {
    return this._opacity;
  }

  private _clipping: number | undefined;
  /**
   * Gets the clipping value of the layer.
   */
  public get clipping(): number | undefined {
    return this._clipping;
  }

  private _flags: number;
  /**
   * Gets the flags of the layer.
   */
  public get flags(): number {
    return this._flags;
  }

  private _compression: number | undefined;
  /**
   * Gets the compression value of the layer.
   */
  public get compression(): number | undefined {
    return this._compression;
  }

  private _name: string | undefined;
  /**
   * Gets the name of the layer.
   */
  public get name(): string | undefined {
    return this._name;
  }

  private _channels: PsdChannel[];
  /**
   * Gets the channels of the layer.
   */
  public get channels(): PsdChannel[] {
    return this._channels;
  }

  private _mask: PsdMask | undefined;
  /**
   * Gets the mask of the layer.
   */
  public get mask(): PsdMask | undefined {
    return this._mask;
  }

  private _blendingRanges: PsdBlendingRanges | undefined;
  /**
   * Gets the blending ranges of the layer.
   */
  public get blendingRanges(): PsdBlendingRanges | undefined {
    return this._blendingRanges;
  }

  private _additionalData: Map<string, PsdLayerData> = new Map();
  /**
   * Gets the additional data of the layer.
   */
  public get additionalData(): Map<string, PsdLayerData> {
    return this._additionalData;
  }

  private _children: PsdLayer[] = [];
  /**
   * Gets the children layers.
   */
  public get children(): PsdLayer[] {
    return this._children;
  }

  private _parent: PsdLayer | undefined;
  /**
   * Gets the parent layer.
   */
  public get parent(): PsdLayer | undefined {
    return this._parent;
  }

  private _layerImage!: MemoryImage;
  /**
   * Gets the image of the layer.
   */
  public get layerImage(): MemoryImage {
    return this._layerImage;
  }

  private _effects: PsdEffect[] = [];
  /**
   * Gets the effects applied to the layer.
   */
  public get effects(): PsdEffect[] {
    return this._effects;
  }

  /**
   * Checks if the layer is visible.
   */
  public get isVisible(): boolean {
    return (this._flags & PsdFlag.hidden) === 0;
  }

  /**
   * Checks if the layer is a folder.
   */
  public get type(): number {
    if (this._additionalData.has(PsdLayerSectionDivider.tagName)) {
      const section = this._additionalData.get(
        PsdLayerSectionDivider.tagName
      ) as PsdLayerSectionDivider;
      return section.type;
    }
    return PsdLayerSectionDivider.normal;
  }

  /**
   * Initializes a new instance of the PsdLayer class.
   * @param {InputBuffer<Uint8Array>} input - The input buffer to read the layer data from.
   * @throws {LibError} If the PSD layer signature is invalid.
   * @throws {LibError} If the PSD layer data is invalid.
   */
  constructor(input: InputBuffer<Uint8Array>) {
    this._top = input.readInt32();
    this._left = input.readInt32();
    this._bottom = input.readInt32();
    this._right = input.readInt32();
    this._width = this._right - this._left;
    this._height = this._bottom - this._top;

    this._channels = [];
    const numChannels = input.readUint16();
    for (let i = 0; i < numChannels; ++i) {
      const id = input.readInt16();
      const len = input.readUint32();
      this._channels.push(new PsdChannel(id, len));
    }

    const sig = input.readUint32();
    if (sig !== PsdLayer.signature) {
      throw new LibError(`Invalid PSD layer signature: ${sig.toString(16)}`);
    }

    this._blendMode = input.readUint32();
    this._opacity = input.read();
    this._clipping = input.read();
    this._flags = input.read();

    // should be 0
    const filler = input.read();
    if (filler !== 0) {
      throw new LibError('Invalid PSD layer data');
    }

    let len = input.readUint32();
    const extra = input.readRange(len);

    if (len > 0) {
      // Mask Data
      len = extra.readUint32();
      if (len > 0) {
        const maskData = extra.readRange(len);
        this._mask = new PsdMask(maskData);
      }

      // Layer Blending Ranges
      len = extra.readUint32();
      if (len > 0) {
        const data = extra.readRange(len);
        this._blendingRanges = new PsdBlendingRanges(data);
      }

      // Layer name
      len = extra.read();
      this._name = extra.readString(len);
      // Layer name is padded to a multiple of 4 bytes.
      const padding = 4 - (len % 4) - 1;
      if (padding > 0) {
        extra.skip(padding);
      }

      // Additional layer sections
      while (!extra.isEOS) {
        const sig = extra.readUint32();
        if (sig !== PsdLayer.signature) {
          throw new LibError(
            `PSD invalid signature for layer additional data: ${sig.toString(16)}`
          );
        }

        const tag = extra.readString(4);

        len = extra.readUint32();
        const data = extra.readRange(len);
        // pad to an even byte count.
        if ((len & 1) === 1) {
          extra.skip(1);
        }

        this._additionalData.set(
          tag,
          PsdLayerDataFactory.createLayerData(tag, data)
        );

        // Layer effects data
        if (tag === 'lrFX') {
          const fxData = this._additionalData.get(
            'lrFX'
          ) as PsdLayerAdditionalData;
          const data = InputBuffer.from(fxData.data);
          /* let version: number = */
          data.readUint16();
          const numFx = data.readUint16();

          for (let j = 0; j < numFx; ++j) {
            // 8BIM
            /* let tag: string = */
            data.readString(4);
            const fxTag = data.readString(4);
            const size = data.readUint32();

            if (fxTag === 'dsdw') {
              const version = data.readUint32();
              const blur = data.readUint32();
              const intensity = data.readUint32();
              const angle = data.readUint32();
              const distance = data.readUint32();
              const color = [
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
              ];
              const blendMode = data.readString(8);
              const enabled = data.read() !== 0;
              const globalAngle = data.read() !== 0;
              const opacity = data.read();
              const nativeColor = [
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
              ];
              this._effects.push(
                new PsdDropShadowEffect({
                  version: version,
                  blur: blur,
                  intensity: intensity,
                  angle: angle,
                  distance: distance,
                  color: color,
                  blendMode: blendMode,
                  enabled: enabled,
                  globalAngle: globalAngle,
                  opacity: opacity,
                  nativeColor: nativeColor,
                })
              );
            } else if (fxTag === 'isdw') {
              const version = data.readUint32();
              const blur = data.readUint32();
              const intensity = data.readUint32();
              const angle = data.readUint32();
              const distance = data.readUint32();
              const color = [
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
              ];
              const blendMode = data.readString(8);
              const enabled = data.read() !== 0;
              const globalAngle = data.read() !== 0;
              const opacity = data.read();
              const nativeColor = [
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
              ];
              this._effects.push(
                new PsdInnerShadowEffect({
                  version: version,
                  blur: blur,
                  intensity: intensity,
                  angle: angle,
                  distance: distance,
                  color: color,
                  blendMode: blendMode,
                  enabled: enabled,
                  globalAngle: globalAngle,
                  opacity: opacity,
                  nativeColor: nativeColor,
                })
              );
            } else if (fxTag === 'oglw') {
              const version = data.readUint32();
              const blur = data.readUint32();
              const intensity = data.readUint32();
              const color = [
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
              ];
              const blendMode = data.readString(8);
              const enabled = data.read() !== 0;
              const opacity = data.read();
              let nativeColor: number[] | undefined = undefined;
              if (version === 2) {
                nativeColor = [
                  data.readUint16(),
                  data.readUint16(),
                  data.readUint16(),
                  data.readUint16(),
                  data.readUint16(),
                ];
              }
              this._effects.push(
                new PsdOuterGlowEffect({
                  version: version,
                  blur: blur,
                  intensity: intensity,
                  color: color,
                  blendMode: blendMode,
                  enabled: enabled,
                  opacity: opacity,
                  nativeColor: nativeColor,
                })
              );
            } else if (fxTag === 'iglw') {
              const version = data.readUint32();
              const blur = data.readUint32();
              const intensity = data.readUint32();
              const color = [
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
              ];
              const blendMode = data.readString(8);
              const enabled = data.read() !== 0;
              const opacity = data.read();
              let invert: boolean | undefined = undefined;
              let nativeColor: number[] | undefined = undefined;
              if (version === 2) {
                invert = data.read() !== 0;
                nativeColor = [
                  data.readUint16(),
                  data.readUint16(),
                  data.readUint16(),
                  data.readUint16(),
                  data.readUint16(),
                ];
              }
              this._effects.push(
                new PsdInnerGlowEffect({
                  version: version,
                  blur: blur,
                  intensity: intensity,
                  color: color,
                  blendMode: blendMode,
                  enabled: enabled,
                  opacity: opacity,
                  invert: invert,
                  nativeColor: nativeColor,
                })
              );
            } else if (fxTag === 'bevl') {
              const version = data.readUint32();
              const angle = data.readUint32();
              const strength = data.readUint32();
              const blur = data.readUint32();
              const highlightBlendMode = data.readString(8);
              const shadowBlendMode = data.readString(8);
              const highlightColor = [
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
              ];
              const shadowColor = [
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
              ];
              const bevelStyle = data.read();
              const highlightOpacity = data.read();
              const shadowOpacity = data.read();
              const enabled = data.read() !== 0;
              const globalAngle = data.read() !== 0;
              const upOrDown = data.read();
              let realHighlightColor: number[] | undefined = undefined;
              let realShadowColor: number[] | undefined = undefined;
              if (version === 2) {
                realHighlightColor = [
                  data.readUint16(),
                  data.readUint16(),
                  data.readUint16(),
                  data.readUint16(),
                  data.readUint16(),
                ];
                realShadowColor = [
                  data.readUint16(),
                  data.readUint16(),
                  data.readUint16(),
                  data.readUint16(),
                  data.readUint16(),
                ];
              }
              this._effects.push(
                new PsdBevelEffect({
                  version: version,
                  angle: angle,
                  strength: strength,
                  blur: blur,
                  highlightBlendMode: highlightBlendMode,
                  shadowBlendMode: shadowBlendMode,
                  highlightColor: highlightColor,
                  shadowColor: shadowColor,
                  bevelStyle: bevelStyle,
                  highlightOpacity: highlightOpacity,
                  shadowOpacity: shadowOpacity,
                  enabled: enabled,
                  globalAngle: globalAngle,
                  upOrDown: upOrDown,
                  realHighlightColor: realHighlightColor,
                  realShadowColor: realShadowColor,
                })
              );
            } else if (fxTag === 'sofi') {
              const version = data.readUint32();
              const blendMode = data.readString(4);
              const color = [
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
              ];
              const opacity = data.read();
              const enabled = data.read() !== 0;
              const nativeColor = [
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
                data.readUint16(),
              ];
              this._effects.push(
                new PsdSolidFillEffect({
                  version: version,
                  blendMode: blendMode,
                  color: color,
                  opacity: opacity,
                  enabled: enabled,
                  nativeColor: nativeColor,
                })
              );
            } else {
              data.skip(size);
            }
          }
        }
      }
    }
  }

  /**
   * Gets the channel for the given id.
   * @param {number} id - The id of the channel.
   * @returns {PsdChannel | undefined} The channel with the given id, or undefined if not found.
   */
  public getChannel(id: number): PsdChannel | undefined {
    for (let i = 0; i < this._channels.length; ++i) {
      if (this._channels[i].id === id) {
        return this._channels[i];
      }
    }
    return undefined;
  }

  /**
   * Reads the image data for the layer.
   * @param {InputBuffer<Uint8Array>} input - The input buffer to read the image data from.
   * @param {PsdImage} psd - The PSD image containing the layer.
   */
  public readImageData(input: InputBuffer<Uint8Array>, psd: PsdImage): void {
    for (let i = 0; i < this._channels.length; ++i) {
      this._channels[i].readPlane({
        input: input,
        width: this._width,
        height: this._height,
        bitDepth: psd.depth,
      });
    }
    this._layerImage = PsdImage.createImageFromChannels(
      this._width,
      this._height,
      this._channels,
      psd.colorMode,
      psd.depth
    );
  }
}
