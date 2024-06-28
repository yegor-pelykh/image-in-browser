/** @format */

import { ColorUint8 } from './color-uint8.js';

/**
 * Class representing an RGBA color with 8-bit channels.
 * @extends ColorUint8
 */
export class ColorRgba8 extends ColorUint8 {
  /**
   * Create a ColorRgba8 instance.
   * @param {number} r - The red channel value.
   * @param {number} g - The green channel value.
   * @param {number} b - The blue channel value.
   * @param {number} a - The alpha channel value.
   */
  constructor(r: number, g: number, b: number, a: number) {
    const data = new Uint8Array([r, g, b, a]);
    super(data);
  }

  /**
   * Create a ColorRgba8 instance from another ColorUint8 instance.
   * @param {ColorUint8} other - The other ColorUint8 instance.
   * @returns {ColorUint8} A new ColorUint8 instance.
   */
  public static from(other: ColorUint8): ColorUint8 {
    const data = new Uint8Array([
      other.getChannel(0),
      other.getChannel(1),
      other.getChannel(2),
      other.getChannel(3),
    ]);
    return new ColorUint8(data);
  }
}
