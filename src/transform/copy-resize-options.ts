/** @format */

import { Interpolation } from '../common/interpolation';
import { MemoryImage } from '../common/memory-image';

export interface CopyResizeOptionsUsingWidth {
  image: MemoryImage;
  width: number;
  height?: number;
  interpolation?: Interpolation;
}

export interface CopyResizeOptionsUsingHeight {
  image: MemoryImage;
  height: number;
  width?: number;
  interpolation?: Interpolation;
}
