/** @format */

/**
 * Represents data for a PSD layer.
 */
export class PsdLayerData {
  /**
   * The tag associated with the PSD layer.
   */
  private _tag: string;

  /**
   * Gets the tag associated with the PSD layer.
   * @returns {string} The tag as a string.
   */
  public get tag(): string {
    return this._tag;
  }

  /**
   * Initializes a new instance of the PsdLayerData class.
   * @param {string} tag - The tag to associate with the PSD layer.
   */
  constructor(tag: string) {
    this._tag = tag;
  }
}
