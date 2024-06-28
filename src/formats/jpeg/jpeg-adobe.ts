/** @format */

/**
 * Represents a JPEG Adobe metadata block.
 */
export class JpegAdobe {
  /**
   * The version of the JPEG Adobe metadata.
   */
  private _version: number;

  /**
   * Gets the version of the JPEG Adobe metadata.
   * @returns {number} The version number.
   */
  public get version(): number {
    return this._version;
  }

  /**
   * The first set of flags in the JPEG Adobe metadata.
   */
  private _flags0: number;

  /**
   * Gets the first set of flags in the JPEG Adobe metadata.
   * @returns {number} The first set of flags.
   */
  public get flags0(): number {
    return this._flags0;
  }

  /**
   * The second set of flags in the JPEG Adobe metadata.
   */
  private _flags1: number;

  /**
   * Gets the second set of flags in the JPEG Adobe metadata.
   * @returns {number} The second set of flags.
   */
  public get flags1(): number {
    return this._flags1;
  }

  /**
   * The transform code in the JPEG Adobe metadata.
   */
  private _transformCode: number;

  /**
   * Gets the transform code in the JPEG Adobe metadata.
   * @returns {number} The transform code.
   */
  public get transformCode(): number {
    return this._transformCode;
  }

  /**
   * Initializes a new instance of the JpegAdobe class.
   * @param {number} version - The version of the JPEG Adobe metadata.
   * @param {number} flags0 - The first set of flags in the JPEG Adobe metadata.
   * @param {number} flags1 - The second set of flags in the JPEG Adobe metadata.
   * @param {number} transformCode - The transform code in the JPEG Adobe metadata.
   */
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
