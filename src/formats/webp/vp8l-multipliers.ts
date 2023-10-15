/** @format */

import { BitUtils } from '../../common/bit-utils';

export class VP8LMultipliers {
  private readonly _data = new Uint8Array(3);

  public get greenToRed(): number {
    return this._data[0];
  }
  public set greenToRed(v: number) {
    this._data[0] = v;
  }

  public get greenToBlue(): number {
    return this._data[1];
  }
  public set greenToBlue(v: number) {
    this._data[1] = v;
  }

  public get redToBlue(): number {
    return this._data[2];
  }
  public set redToBlue(v: number) {
    this._data[2] = v;
  }

  public get colorCode(): number {
    return (
      0xff000000 | (this._data[2] << 16) | (this._data[1] << 8) | this._data[0]
    );
  }
  public set colorCode(v: number) {
    this._data[0] = (v >>> 0) & 0xff;
    this._data[1] = (v >>> 8) & 0xff;
    this._data[2] = (v >>> 16) & 0xff;
  }

  public clear(): void {
    this._data[0] = 0;
    this._data[1] = 0;
    this._data[2] = 0;
  }

  public transformColor(argb: number, inverse: boolean): number {
    const green = (argb >>> 8) & 0xff;
    const red = (argb >>> 16) & 0xff;
    let newRed = red;
    let newBlue = argb & 0xff;

    if (inverse) {
      const g = this.colorTransformDelta(this.greenToRed, green);
      newRed = (newRed + g) & 0xffffffff;
      newRed &= 0xff;
      newBlue =
        (newBlue + this.colorTransformDelta(this.greenToBlue, green)) &
        0xffffffff;
      newBlue =
        (newBlue + this.colorTransformDelta(this.redToBlue, newRed)) &
        0xffffffff;
      newBlue &= 0xff;
    } else {
      newRed -= this.colorTransformDelta(this.greenToRed, green);
      newRed &= 0xff;
      newBlue -= this.colorTransformDelta(this.greenToBlue, green);
      newBlue -= this.colorTransformDelta(this.redToBlue, red);
      newBlue &= 0xff;
    }

    const c = (argb & 0xff00ff00) | ((newRed << 16) & 0xffffffff) | newBlue;
    return c;
  }

  public colorTransformDelta(colorPred: number, color: number): number {
    const a = BitUtils.uint8ToInt8(colorPred);
    const b = BitUtils.uint8ToInt8(color);
    const d = BitUtils.int32ToUint32(a * b);
    return d >>> 5;
  }
}
