/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { WebPInfo } from './webp-info';

export class WebPInfoInternal extends WebPInfo {
  private _frameCount: number = 0;
  public get frameCount(): number {
    return this._frameCount;
  }
  public set frameCount(v: number) {
    this._frameCount = v;
  }

  private _frame: number = 0;
  public get frame(): number {
    return this._frame;
  }
  public set frame(v: number) {
    this._frame = v;
  }

  private _alphaData?: InputBuffer<Uint8Array>;
  public get alphaData(): InputBuffer<Uint8Array> | undefined {
    return this._alphaData;
  }
  public set alphaData(v: InputBuffer<Uint8Array> | undefined) {
    this._alphaData = v;
  }

  private _alphaSize: number = 0;
  public get alphaSize(): number {
    return this._alphaSize;
  }
  public set alphaSize(v: number) {
    this._alphaSize = v;
  }

  private _vp8Position: number = 0;
  public get vp8Position(): number {
    return this._vp8Position;
  }
  public set vp8Position(v: number) {
    this._vp8Position = v;
  }

  private _vp8Size: number = 0;
  public get vp8Size(): number {
    return this._vp8Size;
  }
  public set vp8Size(v: number) {
    this._vp8Size = v;
  }
}
