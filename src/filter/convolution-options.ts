/** @format */

import { MemoryImage } from '../common/memory-image';

export interface ConvolutionOptions {
  src: MemoryImage;
  filter: number[];
  div?: number;
  offset?: number;
}
