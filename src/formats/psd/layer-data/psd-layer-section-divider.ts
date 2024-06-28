/** @format */

import { InputBuffer } from '../../../common/input-buffer.js';
import { LibError } from '../../../error/lib-error.js';
import { PsdLayerData } from './psd-layer-data.js';

/**
 * Represents a PSD Layer Section Divider.
 */
export class PsdLayerSectionDivider extends PsdLayerData {
  /**
   * The tag name for the section divider.
   */
  public static readonly tagName = 'lsct';

  /**
   * Normal section type.
   */
  public static readonly normal = 0;

  /**
   * Open folder section type.
   */
  public static readonly openFolder = 1;

  /**
   * Closed folder section type.
   */
  public static readonly closedFolder = 2;

  /**
   * Section divider type.
   */
  public static readonly sectionDivider = 3;

  /**
   * Normal sub-type.
   */
  public static readonly subTypeNormal = 0;

  /**
   * Group sub-type.
   */
  public static readonly subTypeGroup = 1;

  /**
   * The type of the section divider.
   */
  private _type: number = 0;

  /**
   * Gets the type of the section divider.
   * @returns {number} The type of the section divider.
   */
  public get type(): number {
    return this._type;
  }

  /**
   * The key of the section divider.
   */
  private _key: string | undefined;

  /**
   * Gets the key of the section divider.
   * @returns {string | undefined} The key of the section divider.
   */
  public get key(): string | undefined {
    return this._key;
  }

  /**
   * The sub-type of the section divider.
   */
  private _subType: number = PsdLayerSectionDivider.subTypeNormal;

  /**
   * Gets the sub-type of the section divider.
   * @returns {number} The sub-type of the section divider.
   */
  public get subType(): number {
    return this._subType;
  }

  /**
   * Initializes a new instance of the PsdLayerSectionDivider class.
   * @param {string} tag - The tag associated with the section divider.
   * @param {InputBuffer<Uint8Array>} data - The input buffer containing the section divider data.
   * @throws {LibError} Throws an error if the key in layer additional data is invalid.
   */
  constructor(tag: string, data: InputBuffer<Uint8Array>) {
    super(tag);

    const len = data.length;

    this._type = data.readUint32();

    if (len >= 12) {
      const sig = data.readString(4);
      if (sig !== '8BIM') {
        throw new LibError('Invalid key in layer additional data');
      }
      this._key = data.readString(4);
    }

    if (len >= 16) {
      this._subType = data.readUint32();
    }
  }
}
