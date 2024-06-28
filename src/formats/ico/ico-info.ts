/** @format */

import { Color } from '../../color/color.js';
import { ArrayUtils } from '../../common/array-utils.js';
import { InputBuffer } from '../../common/input-buffer.js';
import { DecodeInfo } from '../decode-info.js';
import { IcoInfoImage } from './ico-info-image.js';
import { IcoType, IcoTypeLength } from './ico-type.js';

/**
 * Represents information about an ICO file.
 */
export class IcoInfo implements DecodeInfo {
  /**
   * The width of the ICO image.
   */
  private _width = 0;
  public get width(): number {
    return this._width;
  }

  /**
   * The height of the ICO image.
   */
  private _height = 0;
  public get height(): number {
    return this._height;
  }

  /**
   * The type of the ICO image.
   */
  private readonly _type: IcoType;
  public get type(): IcoType {
    return this._type;
  }

  /**
   * The number of frames in the ICO image.
   */
  private readonly _numFrames: number;
  public get numFrames(): number {
    return this._numFrames;
  }

  /**
   * The background color of the ICO image.
   */
  private _backgroundColor: Color | undefined = undefined;
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  /**
   * The images contained in the ICO file.
   */
  private readonly _images: IcoInfoImage[];
  public get images(): IcoInfoImage[] {
    return this._images;
  }

  /**
   * Constructs an instance of IcoInfo.
   * @param {number} type - The type of the ICO image.
   * @param {number} numFrames - The number of frames in the ICO image.
   * @param {IcoInfoImage[]} images - The images contained in the ICO file.
   */
  constructor(type: number, numFrames: number, images: IcoInfoImage[]) {
    this._type = type;
    this._numFrames = numFrames;
    this._images = images;
  }

  /**
   * Reads an ICO file from the input buffer.
   * @param {InputBuffer<Uint8Array>} input - The input buffer containing the ICO file data.
   * @returns {IcoInfo | undefined} An instance of IcoInfo if the file is valid, otherwise undefined.
   */
  public static read(input: InputBuffer<Uint8Array>): IcoInfo | undefined {
    if (input.readUint16() !== 0) {
      return undefined;
    }
    const t = input.readUint16();
    if (t >= IcoTypeLength) {
      return undefined;
    }
    const type = t as IcoType;
    if (type === IcoType.cur) {
      // CUR format not yet supported.
      return undefined;
    }

    const imageCount = input.readUint16();

    const images = ArrayUtils.generate<IcoInfoImage>(
      imageCount,
      (_) =>
        new IcoInfoImage({
          width: input.read(),
          height: input.read(),
          colorPalette: input.read(),
          // ignore 1 byte
          colorPlanes: (input.skip(1), input).readUint16(),
          bitsPerPixel: input.readUint16(),
          bytesSize: input.readUint32(),
          bytesOffset: input.readUint32(),
        })
    );

    return new IcoInfo(type, imageCount, images);
  }
}
