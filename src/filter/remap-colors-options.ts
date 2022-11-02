/** @format */

import { ColorChannel } from '../common/color-channel';
import { MemoryImage } from '../common/memory-image';

export interface RemapColorsOptions {
  src: MemoryImage;
  red?: ColorChannel;
  green?: ColorChannel;
  blue?: ColorChannel;
  alpha?: ColorChannel;
}
