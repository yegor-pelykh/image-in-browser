/** @format */

import { WinEncoder } from './win-encoder.js';

export class IcoEncoder extends WinEncoder {
  protected _type = 1;

  protected colorPlanesOrXHotSpot(_index: number): number {
    return 0;
  }

  protected bitsPerPixelOrYHotSpot(_index: number): number {
    return 32;
  }
}
