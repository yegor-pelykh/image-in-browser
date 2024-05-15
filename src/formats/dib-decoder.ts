/** @format */

import { InputBuffer } from '../common/input-buffer.js';
import { BmpDecoder } from './bmp-decoder.js';
import { BmpInfo } from './bmp/bmp-info.js';

export class DibDecoder extends BmpDecoder {
  constructor(
    input: InputBuffer<Uint8Array>,
    info: BmpInfo,
    forceRgba = false
  ) {
    super(forceRgba);
    this._input = input;
    this._info = info;
  }
}
