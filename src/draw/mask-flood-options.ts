/** @format */

import { MemoryImage } from '../common/memory-image';

export interface MaskFloodOptions {
  src: MemoryImage;
  x: number;
  y: number;
  threshold?: number;
  compareAlpha?: boolean;
  fillValue?: number;
}
