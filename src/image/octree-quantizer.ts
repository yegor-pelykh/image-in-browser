/** @format */

import { Color } from '../color/color.js';
import { ColorRgb8 } from '../color/color-rgb8.js';
import { HeapNode } from './heap-node.js';
import { MemoryImage } from './image.js';
import { OctreeNode } from './octree-node.js';
import { PaletteUint8 } from './palette-uint8.js';
import { Pixel } from './pixel.js';
import { Quantizer } from './quantizer.js';

/**
 * Color quantization using octree,
 * from https://rosettacode.org/wiki/Color_quantization/C
 */
export class OctreeQuantizer implements Quantizer {
  private static readonly _inHeap = 1;

  private readonly _root: OctreeNode;

  private _palette!: PaletteUint8;
  public get palette(): PaletteUint8 {
    return this._palette;
  }

  constructor(image: MemoryImage, numberOfColors = 256) {
    this._root = new OctreeNode(0, 0);
    const heap = new HeapNode();
    for (const p of image) {
      const r = Math.trunc(p.r);
      const g = Math.trunc(p.g);
      const b = Math.trunc(p.b);
      this.heapAdd(heap, this.nodeInsert(this._root, r, g, b));
    }

    const nc = numberOfColors + 1;
    while (heap.n > nc) {
      this.heapAdd(heap, this.nodeFold(this.popHeap(heap)!)!);
    }

    for (let i = 1; i < heap.n; i++) {
      const got = heap.buf[i]!;
      const c = got.count;
      got.r = Math.round(got.r / c);
      got.g = Math.round(got.g / c);
      got.b = Math.round(got.b / c);
    }

    const nodes: OctreeNode[] = [];
    this.getNodes(nodes, this._root);

    this._palette = new PaletteUint8(nodes.length, 3);
    const l = nodes.length;
    for (let i = 0; i < l; ++i) {
      nodes[i].paletteIndex = i;
      const n = nodes[i];
      this._palette.setRgb(i, n.r, n.g, n.b);
    }
  }

  private nodeInsert(
    root: OctreeNode,
    r: number,
    g: number,
    b: number
  ): OctreeNode {
    let _root = root;

    let depth = 0;
    for (let bit = 1 << 7; ++depth < 8; bit >>>= 1) {
      const i =
        ((g & bit) !== 0 ? 1 : 0) * 4 +
        ((r & bit) !== 0 ? 1 : 0) * 2 +
        ((b & bit) !== 0 ? 1 : 0);
      if (_root.children[i] === undefined) {
        _root.children[i] = new OctreeNode(i, depth, _root);
      }
      _root = _root.children[i]!;
    }

    _root.r += r;
    _root.g += g;
    _root.b += b;
    _root.count++;
    return _root;
  }

  private popHeap(h: HeapNode): OctreeNode | undefined {
    if (h.n <= 1) {
      return undefined;
    }

    const ret = h.buf[1];
    h.buf[1] = h.buf.pop();
    h.buf[1]!.heapIndex = 1;
    this.downHeap(h, h.buf[1]!);

    return ret;
  }

  private heapAdd(h: HeapNode, p: OctreeNode): void {
    if ((p.flags & OctreeQuantizer._inHeap) !== 0) {
      this.downHeap(h, p);
      this.upHeap(h, p);
      return;
    }

    p.flags |= OctreeQuantizer._inHeap;
    p.heapIndex = h.n;
    h.buf.push(p);
    this.upHeap(h, p);
  }

  private downHeap(h: HeapNode, p: OctreeNode): void {
    let n = p.heapIndex;
    while (true) {
      let m = n * 2;
      if (m >= h.n) {
        break;
      }
      if (m + 1 < h.n && this.compareNode(h.buf[m]!, h.buf[m + 1]!) > 0) {
        m++;
      }

      if (this.compareNode(p, h.buf[m]!) <= 0) {
        break;
      }

      h.buf[n] = h.buf[m];
      h.buf[n]!.heapIndex = n;
      n = m;
    }

    h.buf[n] = p;
    p.heapIndex = n;
  }

  private upHeap(h: HeapNode, p: OctreeNode): void {
    let n = p.heapIndex;
    let prev: OctreeNode | undefined = undefined;

    while (n > 1) {
      prev = h.buf[Math.trunc(n / 2)];
      if (this.compareNode(p, prev!) >= 0) {
        break;
      }

      h.buf[n] = prev;
      prev!.heapIndex = n;
      n = Math.trunc(n / 2);
    }
    h.buf[n] = p;
    p.heapIndex = n;
  }

  private nodeFold(p: OctreeNode): OctreeNode | undefined {
    if (p.childCount > 0) {
      return undefined;
    }
    const q = p.parent!;
    q.count += p.count;

    q.r += p.r;
    q.g += p.g;
    q.b += p.b;
    q.childCount--;
    q.children[p.childIndex] = undefined;
    return q;
  }

  private compareNode(a: OctreeNode, b: OctreeNode): number {
    if (a.childCount < b.childCount) {
      return -1;
    }
    if (a.childCount > b.childCount) {
      return 1;
    }

    const ac = a.count >>> a.depth;
    const bc = b.count >>> b.depth;
    return ac < bc ? -1 : ac > bc ? 1 : 0;
  }

  private getNodes(nodes: OctreeNode[], node: OctreeNode): void {
    if (node.childCount === 0) {
      nodes.push(node);
      return;
    }
    for (const n of node.children) {
      if (n !== undefined) {
        this.getNodes(nodes, n);
      }
    }
  }

  public getColorIndex(c: Color): number {
    return this.getColorIndexRgb(
      Math.trunc(c.r),
      Math.trunc(c.g),
      Math.trunc(c.b)
    );
  }

  public getColorIndexRgb(r: number, g: number, b: number): number {
    let root: OctreeNode | undefined = this._root;
    for (let bit = 1 << 7; bit !== 0; bit >>>= 1) {
      const i =
        ((g & bit) !== 0 ? 1 : 0) * 4 +
        ((r & bit) !== 0 ? 1 : 0) * 2 +
        ((b & bit) !== 0 ? 1 : 0);
      if (root!.children[i] === undefined) {
        break;
      }
      root = root!.children[i];
    }
    return root?.paletteIndex ?? 0;
  }

  /**
   * Find the index of the closest color to **c** in the **palette**.
   */
  public getQuantizedColor(c: Color): Color {
    let r = Math.trunc(c.r);
    let g = Math.trunc(c.g);
    let b = Math.trunc(c.b);
    let root: OctreeNode | undefined = this._root;

    for (let bit = 1 << 7; bit !== 0; bit >>>= 1) {
      const i =
        ((g & bit) !== 0 ? 1 : 0) * 4 +
        ((r & bit) !== 0 ? 1 : 0) * 2 +
        ((b & bit) !== 0 ? 1 : 0);
      if (root!.children[i] === undefined) {
        break;
      }
      root = root!.children[i];
    }

    r = root!.r;
    g = root!.g;
    b = root!.b;

    return new ColorRgb8(r, g, b);
  }

  /**
   * Convert the **image** to a palette image.
   */
  public getIndexImage(image: MemoryImage): MemoryImage {
    const target = new MemoryImage({
      width: image.width,
      height: image.height,
      numChannels: 1,
      palette: this.palette,
    });

    target.frameIndex = image.frameIndex;
    target.frameType = image.frameType;
    target.frameDuration = image.frameDuration;

    const imageIt = image[Symbol.iterator]();
    const targetIt = target[Symbol.iterator]();
    let imageItRes: IteratorResult<Pixel> | undefined = undefined;
    let targetItRes: IteratorResult<Pixel> | undefined = undefined;
    while (
      (((imageItRes = imageIt.next()), (targetItRes = targetIt.next())),
      !imageItRes.done && !targetItRes.done)
    ) {
      const t = targetItRes.value;
      t.setChannel(0, this.getColorIndex(imageItRes.value));
    }

    return target;
  }
}
