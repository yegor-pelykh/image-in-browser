/** @format */

export class JpegAdobe {
  private _version: number;
  public get version(): number {
    return this._version;
  }

  private _flags0: number;
  public get flags0(): number {
    return this._flags0;
  }

  private _flags1: number;
  public get flags1(): number {
    return this._flags1;
  }

  private _transformCode: number;
  public get transformCode(): number {
    return this._transformCode;
  }

  constructor(
    version: number,
    flags0: number,
    flags1: number,
    transformCode: number
  ) {
    this._version = version;
    this._flags0 = flags0;
    this._flags1 = flags1;
    this._transformCode = transformCode;
  }
}
