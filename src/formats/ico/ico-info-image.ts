/** @format */

export class IcoInfoImage {
  private readonly _width: number;
  public get width(): number {
    return this._width;
  }

  private readonly _height: number;
  public get height(): number {
    return this._height;
  }

  private readonly _colorPalette: number;
  public get colorPalette(): number {
    return this._colorPalette;
  }

  private readonly _bytesSize: number;
  public get bytesSize(): number {
    return this._bytesSize;
  }

  private readonly _bytesOffset: number;
  public get bytesOffset(): number {
    return this._bytesOffset;
  }

  private readonly _colorPlanes: number;
  public get colorPlanes(): number {
    return this._colorPlanes;
  }

  private readonly _bitsPerPixel: number;
  public get bitsPerPixel(): number {
    return this._bitsPerPixel;
  }

  constructor(
    width: number,
    height: number,
    colorPalette: number,
    bytesSize: number,
    bytesOffset: number,
    colorPlanes: number,
    bitsPerPixel: number
  ) {
    this._width = width;
    this._height = height;
    this._colorPalette = colorPalette;
    this._bytesSize = bytesSize;
    this._bytesOffset = bytesOffset;
    this._colorPlanes = colorPlanes;
    this._bitsPerPixel = bitsPerPixel;
  }
}
