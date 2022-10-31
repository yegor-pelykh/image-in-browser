/** @format */

import { MemoryImage } from '../common/memory-image';
import { Interpolation } from '../formats/util/interpolation';

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
