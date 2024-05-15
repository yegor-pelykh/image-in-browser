/** @format */

import { ColorUint8 } from './color-uint8.js';

export class ColorRgb8 extends ColorUint8 {
  constructor(r: number, g: number, b: number) {
    const data = new Uint8Array([r, g, b]);
    super(data);
  }

  public static from(other: ColorUint8) {
    const data = new Uint8Array([
      other.getChannel(0),
      other.getChannel(1),
      other.getChannel(2),
    ]);
    return new ColorUint8(data);
  }
}
