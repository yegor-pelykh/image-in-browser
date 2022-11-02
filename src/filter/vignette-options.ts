/** @format */

import { MemoryImage } from '../common/memory-image';

export interface VignetteOptions {
  src: MemoryImage;
  start?: number;
  end?: number;
  amount?: number;
}
