/** @format */

import { InputBuffer } from '../common/input-buffer';
import { BmpDecoder } from './bmp-decoder';
import { BmpInfo } from './bmp/bmp-info';

export class DibDecoder extends BmpDecoder {
  constructor(input: InputBuffer, info: BmpInfo, forceRgba = false) {
    super(forceRgba);
    this._input = input;
    this._info = info;
  }
}
