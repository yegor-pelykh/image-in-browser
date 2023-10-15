/** @format */

import { InputBuffer } from '../../common/input-buffer';

/**
 * Decodes a frame from a WebP animation
 */
export class WebPFrame {
  private _x: number;
  /**
   * The X coordinate of the upper left corner of the frame
   */
  public get x(): number {
    return this._x;
  }

  private _y: number;
  /**
   * The Y coordinate of the upper left corner of the frame
   */
  public get y(): number {
    return this._y;
  }

  private _width: number;
  /**
   * The width of the frame
   */
  public get width(): number {
    return this._width;
  }

  private _height: number;
  /**
   * The height of the frame
   */
  public get height(): number {
    return this._height;
  }

  private _duration: number;
  /**
   * How long the frame should be displayed, in milliseconds
   */
  public get duration(): number {
    return this._duration;
  }

  private _framePosition: number;
  public get framePosition(): number {
    return this._framePosition;
  }

  private _frameSize: number;
  public get frameSize(): number {
    return this._frameSize;
  }

  private _clearFrame: boolean;
  /**
   * Indicates how the current frame is to be treated after it has been
   * displayed (before rendering the next frame) on the canvas.
   * If true, the frame is cleared to the background color. If false,
   * frame is left and the next frame drawn over it.
   */
  public get clearFrame(): boolean {
    return this._clearFrame;
  }

  private _reserved: number = 1;
  public get isValid(): boolean {
    return this._reserved === 0;
  }

  constructor(input: InputBuffer<Uint8Array>, size: number) {
    this._x = input.readUint24() * 2;
    this._y = input.readUint24() * 2;
    this._width = input.readUint24() + 1;
    this._height = input.readUint24() + 1;
    this._duration = input.readUint24();
    const b = input.read();
    this._reserved = (b & 0x7f) >>> 7;
    this._clearFrame = (b & 0x1) !== 0;
    this._framePosition = input.position;
    this._frameSize = size - WebPFrame.animFrameHeaderSize;
  }

  /**
   * Size of an animation frame header.
   */
  private static readonly animFrameHeaderSize = 16;
}
