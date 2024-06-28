/** @format */

import { ArrayUtils } from '../common/array-utils.js';

/**
 * Represents a node in an octree structure.
 */
export class OctreeNode {
  /**
   * Sum of all red colors represented by this node.
   */
  private _r = 0;
  /**
   * Gets the sum of all red colors.
   * @returns {number} The sum of all red colors.
   */
  public get r(): number {
    return this._r;
  }
  /**
   * Sets the sum of all red colors.
   * @param {number} v - The sum of all red colors.
   */
  public set r(v: number) {
    this._r = v;
  }

  /**
   * Sum of all green colors represented by this node.
   */
  private _g = 0;
  /**
   * Gets the sum of all green colors.
   * @returns {number} The sum of all green colors.
   */
  public get g(): number {
    return this._g;
  }
  /**
   * Sets the sum of all green colors.
   * @param {number} v - The sum of all green colors.
   */
  public set g(v: number) {
    this._g = v;
  }

  /**
   * Sum of all blue colors represented by this node.
   */
  private _b = 0;
  /**
   * Gets the sum of all blue colors.
   * @returns {number} The sum of all blue colors.
   */
  public get b(): number {
    return this._b;
  }
  /**
   * Sets the sum of all blue colors.
   * @param {number} v - The sum of all blue colors.
   */
  public set b(v: number) {
    this._b = v;
  }

  /**
   * Count of colors represented by this node.
   */
  private _count = 0;
  /**
   * Gets the count of colors.
   * @returns {number} The count of colors.
   */
  public get count(): number {
    return this._count;
  }
  /**
   * Sets the count of colors.
   * @param {number} v - The count of colors.
   */
  public set count(v: number) {
    this._count = v;
  }

  /**
   * Index of this node in the heap.
   */
  private _heapIndex = 0;
  /**
   * Gets the heap index.
   * @returns {number} The heap index.
   */
  public get heapIndex(): number {
    return this._heapIndex;
  }
  /**
   * Sets the heap index.
   * @param {number} v - The heap index.
   */
  public set heapIndex(v: number) {
    this._heapIndex = v;
  }

  /**
   * Index of this node in the palette.
   */
  private _paletteIndex = 0;
  /**
   * Gets the palette index.
   * @returns {number} The palette index.
   */
  public get paletteIndex(): number {
    return this._paletteIndex;
  }
  /**
   * Sets the palette index.
   * @param {number} v - The palette index.
   */
  public set paletteIndex(v: number) {
    this._paletteIndex = v;
  }

  /**
   * Parent node of this node.
   */
  private _parent: OctreeNode | undefined;
  /**
   * Gets the parent node.
   * @returns {OctreeNode | undefined} The parent node.
   */
  public get parent(): OctreeNode | undefined {
    return this._parent;
  }

  /**
   * Array of child nodes.
   */
  private _children: Array<OctreeNode | undefined> = ArrayUtils.fill<
    OctreeNode | undefined
  >(8, undefined);
  /**
   * Gets the array of child nodes.
   * @returns {Array<OctreeNode | undefined>} The array of child nodes.
   */
  public get children(): Array<OctreeNode | undefined> {
    return this._children;
  }

  /**
   * Count of child nodes.
   */
  private _childCount = 0;
  /**
   * Gets the count of child nodes.
   * @returns {number} The count of child nodes.
   */
  public get childCount(): number {
    return this._childCount;
  }
  /**
   * Sets the count of child nodes.
   * @param {number} v - The count of child nodes.
   */
  public set childCount(v: number) {
    this._childCount = v;
  }

  /**
   * Index of this node among its siblings.
   */
  private _childIndex = 0;
  /**
   * Gets the child index.
   * @returns {number} The child index.
   */
  public get childIndex(): number {
    return this._childIndex;
  }

  /**
   * Flags associated with this node.
   */
  private _flags = 0;
  /**
   * Gets the flags.
   * @returns {number} The flags.
   */
  public get flags(): number {
    return this._flags;
  }
  /**
   * Sets the flags.
   * @param {number} v - The flags.
   */
  public set flags(v: number) {
    this._flags = v;
  }

  /**
   * Depth of this node in the octree.
   */
  private _depth = 0;
  /**
   * Gets the depth.
   * @returns {number} The depth.
   */
  public get depth(): number {
    return this._depth;
  }

  /**
   * Creates an instance of OctreeNode.
   * @param {number} childIndex - Index of this node among its siblings.
   * @param {number} depth - Depth of this node in the octree.
   * @param {OctreeNode} [parent] - Parent node of this node.
   */
  constructor(childIndex: number, depth: number, parent?: OctreeNode) {
    this._childIndex = childIndex;
    this._depth = depth;
    this._parent = parent;
    if (parent !== undefined) {
      parent._childCount++;
    }
  }
}
