/** @format */

import { InputBuffer } from '../common/input-buffer';
import { BmpDecoder } from './bmp-decoder';
import { BmpInfo } from './bmp/bmp-info';

export class DibDecoder extends BmpDecoder {
  constructor(input: InputBuffer, info: BmpInfo) {
    super();
    this.input = input;
    this.info = info;
  }
}
