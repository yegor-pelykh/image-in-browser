/** @format */

import { MemoryImage } from '../common/memory-image';

export interface FillFloodOptions {
  src: MemoryImage;
  x: number;
  y: number;
  color: number;
  threshold?: number;
  compareAlpha?: boolean;
}
