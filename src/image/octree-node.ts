/** @format */

import { ArrayUtils } from '../common/array-utils';

export class OctreeNode {
  // sum of all colors represented by this node.
  private _r = 0;
  public get r(): number {
    return this._r;
  }
  public set r(v: number) {
    this._r = v;
  }

  private _g = 0;
  public get g(): number {
    return this._g;
  }
  public set g(v: number) {
    this._g = v;
  }

  private _b = 0;
  public get b(): number {
    return this._b;
  }
  public set b(v: number) {
    this._b = v;
  }

  private _count = 0;
  public get count(): number {
    return this._count;
  }
  public set count(v: number) {
    this._count = v;
  }

  private _heapIndex = 0;
  public get heapIndex(): number {
    return this._heapIndex;
  }
  public set heapIndex(v: number) {
    this._heapIndex = v;
  }

  private _paletteIndex = 0;
  public get paletteIndex(): number {
    return this._paletteIndex;
  }
  public set paletteIndex(v: number) {
    this._paletteIndex = v;
  }

  private _parent: OctreeNode | undefined;
  public get parent(): OctreeNode | undefined {
    return this._parent;
  }

  private _children: Array<OctreeNode | undefined> = ArrayUtils.fill<
    OctreeNode | undefined
  >(8, undefined);
  public get children(): Array<OctreeNode | undefined> {
    return this._children;
  }

  private _childCount = 0;
  public get childCount(): number {
    return this._childCount;
  }
  public set childCount(v: number) {
    this._childCount = v;
  }

  private _childIndex = 0;
  public get childIndex(): number {
    return this._childIndex;
  }

  private _flags = 0;
  public get flags(): number {
    return this._flags;
  }
  public set flags(v: number) {
    this._flags = v;
  }

  private _depth = 0;
  public get depth(): number {
    return this._depth;
  }

  constructor(childIndex: number, depth: number, parent?: OctreeNode) {
    this._childIndex = childIndex;
    this._depth = depth;
    this._parent = parent;
    if (parent !== undefined) {
      parent._childCount++;
    }
  }
}
