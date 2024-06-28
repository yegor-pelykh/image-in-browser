/** @format */

import { InputBuffer } from '../common/input-buffer.js';
import { BmpDecoder } from './bmp-decoder.js';
import { BmpInfo } from './bmp/bmp-info.js';

/**
 * Class representing a DIB (Device Independent Bitmap) Decoder.
 * Extends the BmpDecoder class.
 */
export class DibDecoder extends BmpDecoder {
  /**
   * Creates an instance of DibDecoder.
   * @param {InputBuffer<Uint8Array>} input - The input buffer containing the bitmap data.
   * @param {BmpInfo} info - The bitmap information.
   * @param {boolean} [forceRgba=false] - A boolean indicating whether to force RGBA output. Defaults to false.
   */
  constructor(
    input: InputBuffer<Uint8Array>,
    info: BmpInfo,
    forceRgba: boolean = false
  ) {
    super(forceRgba);
    this._input = input;
    this._info = info;
  }
}
