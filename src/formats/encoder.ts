/** @format */

import { FrameAnimation } from '../common/frame-animation';
import { MemoryImage } from '../common/memory-image';

/**
 * Base class for image format encoders.
 */
export interface Encoder {
  /**
   * Does this encoder support animation?
   */
  get supportsAnimation(): boolean;

  /**
   * Encode a single image.
   */
  encodeImage(image: MemoryImage): Uint8Array;

  /**
   * Encode an animation. Not all formats support animation, and undefined
   * will be returned if not.
   */
  encodeAnimation(animation: FrameAnimation): Uint8Array | undefined;
}
