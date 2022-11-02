/** @format */

import { MemoryImage } from '../common/memory-image';

export interface AdjustColorOptions {
  src: MemoryImage;
  blacks?: number;
  whites?: number;
  mids?: number;
  contrast?: number;
  saturation?: number;
  brightness?: number;
  gamma?: number;
  exposure?: number;
  hue?: number;
  amount?: number;
}
