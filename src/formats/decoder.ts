/** @format */

import { FrameAnimation } from '../common/frame-animation';
import { MemoryImage } from '../common/memory-image';
import { HdrImage } from '../hdr/hdr-image';
import { DecodeInfo } from './decode-info';

/**
 * Base class for image format decoders.
 *
 * Image pixels are stored as 32-bit unsigned ints, so all formats, regardless
 * of their encoded color resolutions, decode to 32-bit RGBA images. Encoders
 * can reduce the color resolution back down to their required formats.
 *
 * Some image formats support multiple frames, often for encoding animation.
 * In such cases, the **decodeImage** method will decode the first (or otherwise
 * specified with the **frame** parameter) frame of the file. **decodeAnimation**
 * will decode all frames from the image. **startDecode** will initiate
 * decoding of the file, and **decodeFrame** will then decode a specific frame
 * from the file, allowing for animations to be decoded one frame at a time.
 * Some formats, such as TIFF, may store multiple frames, but their use of
 * frames is for multiple page documents and not animation. The terms
 * 'animation' and 'frames' simply refer to 'pages' in this case.
 *
 * If an image file does not have multiple frames, **decodeAnimation** and
 * **startDecode** / **decodeFrame** will return the single image of the
 * file. As such, if you are not sure if a file is animated or not, you can
 * use the animated functions and process it as a single frame image if it
 * has only 1 frame, and as an animation if it has more than 1 frame.
 *
 * Most animated formats do not store full images for frames, but rather
 * some frames will store full images and others will store partial 'change'
 * images. For these files, **decodeAnimation** will always return all images
 * fully composited, meaning full frame images. Decoding frames individually
 * using **startDecode** and **decodeFrame** will return the potentially partial
 * image. In this case, the **DecodeInfo** returned by **startDecode** will include
 * the width and height resolution of the animation canvas, and each **MemoryImage**
 * returned by **decodeFrame** will have x, y, width and height properties
 * indicating where in the canvas the frame image should be drawn. It will
 * also have a disposeMethod property that specifies what should be done to
 * the canvas prior to drawing the frame: **DisposeMode.none** indicates the
 * canvas should be left alone; **DisposeMode.clear** indicates the canvas
 * should be cleared. For partial frame images,**DisposeMode.none** is used
 * so that the partial-frame is drawn on top of the previous frame, applying
 * it's changes to the image.
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
   * process the frames until they are requested with decodeFrame.
   */
  startDecode(bytes: Uint8Array): DecodeInfo | undefined;

  /**
   * Decode a single frame from the data that was set with **startDecode**.
   * If **frame** is out of the range of available frames, undefined is returned.
   * Non animated image files will only have **frame** 0. A **MemoryImage**
   * is returned, which provides the image, and top-left coordinates of the
   * image, as animated frames may only occupy a subset of the canvas.
   */
  decodeFrame(frame: number): MemoryImage | undefined;

  /**
   * Decode a single high dynamic range (HDR) frame from the data that was set
   * with **startDecode**. If the format of the file does not support HDR images,
   * the regular image will be converted to an HDR image as (color / 255).
   * If **frame** is out of the range of available frames, undefined is returned.
   * Non animated image files will only have **frame** 0. A **MemoryImage**
   * is returned, which provides the image, and top-left coordinates of the
   * image, as animated frames may only occupy a subset of the canvas.
   */
  decodeHdrFrame(frame: number): HdrImage | undefined;

  /**
   * Decode all of the frames from an animation. If the file is not an
   * animation, a single frame animation is returned. If there was a problem
   * decoding the file, undefined is returned.
   */
  decodeAnimation(bytes: Uint8Array): FrameAnimation | undefined;

  /**
   * Decode the file and extract a single image from it. If the file is
   * animated, the specified **frame** will be decoded. If there was a problem
   * decoding the file, undefined is returned.
   */
  decodeImage(bytes: Uint8Array, frame?: number): MemoryImage | undefined;

  /**
   * Decode the file and extract a single High Dynamic Range (HDR) image from
   * it. HDR images are stored in floating-poing values. If the format of the
   * file does not support HDR images, the regular image will be converted to
   * an HDR image as (color / 255). If the file is animated, the specified
   * **frame** will be decoded. If there was a problem decoding the file, undefined is
   * returned.
   */
  decodeHdrImage(bytes: Uint8Array, frame?: number): HdrImage | undefined;
}
