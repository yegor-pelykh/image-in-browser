/** @format */

import { FrameType } from './frame-type';
import { MemoryImage } from './memory-image';

export interface FrameAnimationInitOptions {
  width?: number;
  height?: number;
  loopCount?: number;
}

/**
 * Stores multiple images, most often as the frames of an animation.
 *
 * Some formats support multiple images that are not
 * to be interpreted as animation, but rather multiple pages of a document.
 * The [FrameAnimation] container is still used to store the images for these files.
 * The [frameType] property is used to differentiate multi-page documents from
 * multi-frame animations, where it is set to [FrameType.page] for documents
 * and [FrameType.animation] for animated frames.
 *
 * All [Decoder] classes support decoding to an [FrameAnimation], where the
 * [FrameAnimation] will only contain a single frame for single image formats
 * such as JPEG, or if the file doesn't contain any animation such as a single
 * image GIF. If you want to generically support both animated and non-animated
 * files, you can always decode to an animation and if the animation has only
 * a single frame, then it's a non-animated image.
 *
 * In some cases, the frames of the animation may only provide a portion of the
 * canvas, such as the case of animations encoding only the changing pixels
 * from one frame to the next. The [width] and [height] and [backgroundColor]
 * properties of the [FrameAnimation] provide information about the canvas that
 * contains the animation, and the [Image] frames provide information about
 * how to draw the particular frame, such as the area of the canvas to draw
 * into, and if the canvas should be cleared prior to drawing the frame.
 */
export class FrameAnimation implements Iterable<MemoryImage> {
  /**
   * The canvas width for containing the animation.
   */
  private _width = 0;
  public get width(): number {
    return this._width;
  }

  /**
   * The canvas height for containing the animation.
   */
  private _height = 0;
  public get height(): number {
    return this._height;
  }

  /**
   * The suggested background color to clear the canvas with.
   */
  private _backgroundColor = 0xffffffff;
  public get backgroundColor(): number {
    return this._backgroundColor;
  }

  /**
   * How many times should the animation loop(0 means forever)?
   */
  private _loopCount = 0;
  public get loopCount(): number {
    return this._loopCount;
  }

  /**
   * How should the frames be interpreted?  If [FrameType.animation], the
   * frames are part of an animated sequence. If [FrameType.page], the frames
   * are the pages of a document.
   */
  private _frameType: FrameType = FrameType.animation;
  public get frameType(): FrameType {
    return this._frameType;
  }

  /**
   * The frames of the animation.
   */
  private _frames: MemoryImage[] = [];
  public get frames(): MemoryImage[] {
    return this._frames;
  }

  /**
   * How many frames are in the animation?
   */
  public get numFrames(): number {
    return this.frames.length;
  }

  /**
   * The first frame of the animation.
   */
  public get first(): MemoryImage {
    return this.frames[0];
  }

  /**
   * The last frame of the animation.
   */
  public get last(): MemoryImage {
    return this.frames[this.frames.length - 1];
  }

  /**
   * Is the animation empty(no frames)?
   */
  public get isEmpty(): boolean {
    return this.frames.length === 0;
  }

  /**
   * Returns true if there is at least one frame in the animation.
   */
  public get isNotEmpty(): boolean {
    return this.frames.length > 0;
  }

  constructor(options?: FrameAnimationInitOptions) {
    this._width = options?.width ?? 0;
    this._height = options?.height ?? 0;
    this._loopCount = options?.loopCount ?? 0;
  }

  /**
   * Get the frame at the given[index].
   */
  public getFrame(index: number): MemoryImage {
    return this.frames[index];
  }

  /**
   * Add a frame to the animation.
   */
  public addFrame(image: MemoryImage): void {
    if (this._width < image.width) {
      this._width = image.width;
    }
    if (this._height < image.height) {
      this._height = image.height;
    }
    this.frames.push(image);
  }

  /**
   * Get the iterator for looping over the animation.
   */
  public [Symbol.iterator](): Iterator<MemoryImage, MemoryImage, undefined> {
    let index = -1;
    return {
      next: () => {
        return {
          value: this._frames[++index],
          done: !(index in this._frames),
        };
      },
    };
  }
}
