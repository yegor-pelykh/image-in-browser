/** @format */

import { MemoryImage } from '../image/image';
import { DecodeInfo } from './decode-info';

/**
 * Object interface for specifying Decoder.decode parameters.
 */
export interface DecoderDecodeOptions {
  bytes: Uint8Array;
  frameIndex?: number;
}

/**
 * Base class for image format decoders.
 *
 * Image pixels are stored as 32-bit unsigned ints, so all formats, regardless
 * of their encoded color resolutions, decode to 32-bit RGBA images. Encoders
 * can reduce the color resolution back down to their required formats.
 *
 * Some image formats support multiple frames, often for encoding animation.
 * In such cases, the **decode** method will decode all of the frames,
 * unless the frame argument is specified for a particular frame to decode.
 * **startDecode** will initiate decoding of the file, and **decodeFrame** will
 * then decode a specific frame from the file, allowing for animations to be
 * decoded one frame at a time. Some formats, such as TIFF, may store multiple
 * frames, but their use of frames is for multiple page documents and not
 * animation. The terms 'animation' and 'frames' simply refer to 'pages' in
 * this case.
 */
export interface Decoder {
  /**
   * How many frames are available to be decoded. **startDecode** should have
   * been called first. Non animated image files will have a single frame.
   */
  get numFrames(): number;

  /**
   * A light-weight function to test if the given file is able to be decoded
   * by this Decoder.
   */
  isValidFile(bytes: Uint8Array): boolean;

  /**
   * Start decoding the data as an animation sequence, but don't actually
   * process the frames until they are requested with **decodeFrame**.
   */
  startDecode(bytes: Uint8Array): DecodeInfo | undefined;

  /**
   * Decode the file and extract a single image from it. If the file is
   * animated, and **frameIndex** is specified, that particular frame will be decoded.
   * Otherwise if the image is animated and **frameIndex** is undefined, the returned
   * MemoryImage will include all frames. If there was a problem decoding the
   * MemoryImage, undefined will be returned.
   */
  decode(opt: DecoderDecodeOptions): MemoryImage | undefined;

  /**
   * Decode a single frame from the data that was set with **startDecode**.
   * If **frameIndex** is out of the range of available frames, undefined is returned.
   * Non animated image files will only have **frameIndex** 0. A MemoryImage
   * is returned, which provides the image, and top-left coordinates of the
   * image, as animated frames may only occupy a subset of the canvas.
   */
  decodeFrame(frameIndex: number): MemoryImage | undefined;
}
