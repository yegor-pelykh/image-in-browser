/** @format */

import { OctreeNode } from './octree-node.js';

/**
 * Represents a node in a heap structure.
 */
export class HeapNode {
  /**
   * Internal buffer storing the heap nodes.
   */
  private _buf: Array<OctreeNode | undefined> = [undefined];

  /**
   * Gets the internal buffer storing the heap nodes.
   * @returns {Array<OctreeNode | undefined>} The buffer array.
   */
  public get buf(): Array<OctreeNode | undefined> {
    return this._buf;
  }

  /**
   * Gets the number of elements in the buffer.
   * @returns {number} The length of the buffer array.
   */
  public get n(): number {
    return this._buf.length;
  }
}
