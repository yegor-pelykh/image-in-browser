/** @format */

import { BmpDecoder } from './bmp-decoder';
import { BmpInfo } from './bmp/bmp-info';
import { InputBuffer } from './util/input-buffer';

export class DibDecoder extends BmpDecoder {
  constructor(input: InputBuffer, info: BmpInfo) {
    super();
    this.input = input;
    this.info = info;
  }
}
