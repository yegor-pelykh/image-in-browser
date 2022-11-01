/** @format */

import { MemoryImage } from '../common/memory-image';

export interface DrawImageOptions {
  dst: MemoryImage;
  src: MemoryImage;
  dstX?: number;
  dstY?: number;
  dstW?: number;
  dstH?: number;
  srcX?: number;
  srcY?: number;
  srcW?: number;
  srcH?: number;
  blend?: boolean;
}
