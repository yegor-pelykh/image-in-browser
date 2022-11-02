/** @format */

import { MemoryImage } from '../common/memory-image';
import { QuantizeMethod } from './quantize-method';

export interface QuantizeOptions {
  src: MemoryImage;
  numberOfColors?: number;
  method?: QuantizeMethod;
}
