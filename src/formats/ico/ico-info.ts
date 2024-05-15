/** @format */

import { Color } from '../../color/color.js';
import { ArrayUtils } from '../../common/array-utils.js';
import { InputBuffer } from '../../common/input-buffer.js';
import { DecodeInfo } from '../decode-info.js';
import { IcoInfoImage } from './ico-info-image.js';
import { IcoType, IcoTypeLength } from './ico-type.js';

export class IcoInfo implements DecodeInfo {
  private _width = 0;
  public get width(): number {
    return this._width;
  }

  private _height = 0;
  public get height(): number {
    return this._height;
  }

  private readonly _type: IcoType;
  public get type(): IcoType {
    return this._type;
  }

  private readonly _numFrames: number;
  public get numFrames(): number {
    return this._numFrames;
  }

  private _backgroundColor: Color | undefined = undefined;
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  private readonly _images: IcoInfoImage[];
  public get images(): IcoInfoImage[] {
    return this._images;
  }

  constructor(type: number, numFrames: number, images: IcoInfoImage[]) {
    this._type = type;
    this._numFrames = numFrames;
    this._images = images;
  }

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
