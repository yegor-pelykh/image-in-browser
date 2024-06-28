/** @format */

/**
 * Interface representing the initialization options for IcoInfoImage.
 */
export interface IcoInfoImageInitOptions {
  /** Width of the image */
  width: number;
  /** Height of the image */
  height: number;
  /** Color palette of the image */
  colorPalette: number;
  /** Size of the image in bytes */
  bytesSize: number;
  /** Offset of the image in bytes */
  bytesOffset: number;
  /** Number of color planes */
  colorPlanes: number;
  /** Bits per pixel */
  bitsPerPixel: number;
}

/**
 * Class representing an ICO image information.
 */
export class IcoInfoImage {
  /** Width of the image */
  private readonly _width: number;
  /** Height of the image */
  private readonly _height: number;
  /** Color palette of the image */
  private readonly _colorPalette: number;
  /** Size of the image in bytes */
  private readonly _bytesSize: number;
  /** Offset of the image in bytes */
  private readonly _bytesOffset: number;
  /** Number of color planes */
  private readonly _colorPlanes: number;
  /** Bits per pixel */
  private readonly _bitsPerPixel: number;

  /**
   * Gets the width of the image.
   * @returns {number} The width of the image.
   */
  public get width(): number {
    return this._width;
  }

  /**
   * Gets the height of the image.
   * @returns {number} The height of the image.
   */
  public get height(): number {
    return this._height;
  }

  /**
   * Gets the color palette of the image.
   * @returns {number} The color palette of the image.
   */
  public get colorPalette(): number {
    return this._colorPalette;
  }

  /**
   * Gets the size of the image in bytes.
   * @returns {number} The size of the image in bytes.
   */
  public get bytesSize(): number {
    return this._bytesSize;
  }

  /**
   * Gets the offset of the image in bytes.
   * @returns {number} The offset of the image in bytes.
   */
  public get bytesOffset(): number {
    return this._bytesOffset;
  }

  /**
   * Gets the number of color planes.
   * @returns {number} The number of color planes.
   */
  public get colorPlanes(): number {
    return this._colorPlanes;
  }

  /**
   * Gets the bits per pixel.
   * @returns {number} The bits per pixel.
   */
  public get bitsPerPixel(): number {
    return this._bitsPerPixel;
  }

  /**
   * Initializes a new instance of the IcoInfoImage class.
   * @param {IcoInfoImageInitOptions} opt - The initialization options.
   * @param {number} opt.width - Width of the image.
   * @param {number} opt.height - Height of the image.
   * @param {number} opt.colorPalette - Color palette of the image.
   * @param {number} opt.bytesSize - Size of the image in bytes.
   * @param {number} opt.bytesOffset - Offset of the image in bytes.
   * @param {number} opt.colorPlanes - Number of color planes.
   * @param {number} opt.bitsPerPixel - Bits per pixel.
   */
  constructor(opt: IcoInfoImageInitOptions) {
    this._width = opt.width;
    this._height = opt.height;
    this._colorPalette = opt.colorPalette;
    this._bytesSize = opt.bytesSize;
    this._bytesOffset = opt.bytesOffset;
    this._colorPlanes = opt.colorPlanes;
    this._bitsPerPixel = opt.bitsPerPixel;
  }
}
