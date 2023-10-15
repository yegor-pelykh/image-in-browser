/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { GifColorMap } from './gif-color-map';

export class GifImageDesc {
  private readonly _x: number;
  public get x(): number {
    return this._x;
  }

  private readonly _y: number;
  public get y(): number {
    return this._y;
  }

  private readonly _width: number;
  public get width(): number {
    return this._width;
  }

  private readonly _height: number;
  public get height(): number {
    return this._height;
  }

  private readonly _interlaced: boolean;
  public get interlaced(): boolean {
    return this._interlaced;
  }

  private _colorMap?: GifColorMap;
  public get colorMap(): GifColorMap | undefined {
    return this._colorMap;
  }
  public set colorMap(v: GifColorMap | undefined) {
    this._colorMap = v;
  }

  private _duration = 80;
  public set duration(v: number) {
    this._duration = v;
  }
  public get duration(): number {
    return this._duration;
  }

  private _disposal: number = 0;
  public set disposal(v: number) {
    this._disposal = v;
  }
  public get disposal(): number {
    return this._disposal;
  }

  /**
   * The position in the file after the ImageDesc for this frame.
   */
  protected _inputPosition: number;
  public get inputPosition(): number {
    return this._inputPosition;
  }

  constructor(input: InputBuffer<Uint8Array>) {
    this._x = input.readUint16();
    this._y = input.readUint16();
    this._width = input.readUint16();
    this._height = input.readUint16();

    const b = input.read();
    const bitsPerPixel = (b & 0x07) + 1;

    this._interlaced = (b & 0x40) !== 0;

    if ((b & 0x80) !== 0) {
      this._colorMap = new GifColorMap(1 << bitsPerPixel);
      for (let i = 0; i < this._colorMap.numColors; ++i) {
        this._colorMap.setColor(i, input.read(), input.read(), input.read());
      }
    }

    this._inputPosition = input.position;
  }
}
