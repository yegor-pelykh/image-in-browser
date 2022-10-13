/** @format */

import { BmpInfo } from '../bmp/bmp-info';

export class IcoBmpInfo extends BmpInfo {
  public get height(): number {
    return Math.floor(this._height / 2);
  }

  public get ignoreAlphaChannel(): boolean {
    return this.headerSize === 40 && this.bpp === 32
      ? false
      : super.ignoreAlphaChannel;
  }
}
