/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { DecodeInfo } from '../decode-info';
import { IcoInfoImage } from './ico-info-image';

const TYPE_ICO = 1;
const TYPE_CUR = 2;

export class IcoInfo implements DecodeInfo {
  private readonly _type?: number;
  public get type(): number | undefined {
    return this._type;
  }

  private readonly _images?: IcoInfoImage[];
  public get images(): IcoInfoImage[] | undefined {
    return this._images;
  }

  private readonly _numFrames: number;
  public get numFrames(): number {
    return this._numFrames;
  }

  private _width = 0;
  public get width(): number {
    return this._width;
  }

  private _height = 0;
  public get height(): number {
    return this._height;
  }

  private _backgroundColor = 0xffffffff;
  public get backgroundColor(): number {
    return this._backgroundColor;
  }

  constructor(numFrames: number, type?: number, images?: IcoInfoImage[]) {
    this._numFrames = numFrames;
    this._type = type;
    this._images = images;
  }

  public static read(input: InputBuffer): IcoInfo | undefined {
    if (input.readUint16() !== 0) {
      return undefined;
    }
    const type = input.readUint16();
    if (![TYPE_ICO, TYPE_CUR].includes(type)) {
      return undefined;
    }
    if (type === TYPE_CUR) {
      // We currently do not support CUR format.
      return undefined;
    }
    const imageCount = input.readUint16();
    const images: IcoInfoImage[] = [];
    for (let i = 0; i < imageCount; i++) {
      const width = input.readByte();
      const height = input.readByte();
      const colorPalette = input.readByte();
      input.skip(1);
      const colorPlanes = input.readUint16();
      const bitsPerPixel = input.readUint16();
      const bytesSize = input.readUint32();
      const bytesOffset = input.readUint32();

      const image = new IcoInfoImage(
        width,
        height,
        colorPalette,
        bytesSize,
        bytesOffset,
        colorPlanes,
        bitsPerPixel
      );
      images.push(image);
    }
    return new IcoInfo(imageCount, type, images);
  }
}
