/** @format */

import { OctreeNode } from './octree-node.js';

export class HeapNode {
  private _buf: Array<OctreeNode | undefined> = [undefined];
  public get buf(): Array<OctreeNode | undefined> {
    return this._buf;
  }

  public get n(): number {
    return this._buf.length;
  }
}
