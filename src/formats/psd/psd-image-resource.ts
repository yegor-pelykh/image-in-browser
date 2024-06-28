/** @format */

import { InputBuffer } from '../../common/input-buffer.js';

/**
 * Represents a PSD image resource.
 */
export class PsdImageResource {
  /**
   * The unique identifier of the image resource.
   */
  private _id: number;

  /**
   * Gets the unique identifier of the image resource.
   * @returns {number} The unique identifier.
   */
  public get id(): number {
    return this._id;
  }

  /**
   * The name of the image resource.
   */
  private _name: string;

  /**
   * Gets the name of the image resource.
   * @returns {string} The name.
   */
  public get name(): string {
    return this._name;
  }

  /**
   * The data buffer of the image resource.
   */
  private _data: InputBuffer<Uint8Array>;

  /**
   * Gets the data buffer of the image resource.
   * @returns {InputBuffer<Uint8Array>} The data buffer.
   */
  public get data(): InputBuffer<Uint8Array> {
    return this._data;
  }

  /**
   * Initializes a new instance of the PsdImageResource class.
   * @param {number} id - The unique identifier of the image resource.
   * @param {string} name - The name of the image resource.
   * @param {InputBuffer<Uint8Array>} data - The data buffer of the image resource.
   */
  constructor(id: number, name: string, data: InputBuffer<Uint8Array>) {
    this._id = id;
    this._name = name;
    this._data = data;
  }
}
