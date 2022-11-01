/** @format */

import { Line } from '../common/line';
import { MemoryImage } from '../common/memory-image';

export interface DrawLineOptions {
  image: MemoryImage;
  line: Line;
  color: number;
  antialias?: boolean;
  thickness?: number;
}
