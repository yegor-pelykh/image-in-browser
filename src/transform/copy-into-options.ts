/** @format */

import { MemoryImage } from '../common/memory-image';

export interface CopyIntoOptions {
  dst: MemoryImage;
  src: MemoryImage;
  dstX?: number;
  dstY?: number;
  srcX?: number;
  srcY?: number;
  srcW?: number;
  srcH?: number;
  blend?: boolean;
  center?: boolean;
}
