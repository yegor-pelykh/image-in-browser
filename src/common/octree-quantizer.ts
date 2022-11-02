/** @format */

import { ColorUtils } from './color-utils';
import { HeapNode } from './heap-node';
import { MemoryImage } from './memory-image';
import { OctreeNode } from './octree-node';
import { Quantizer } from './quantizer';

/**
 * Color quantization using octree,
 * from https://rosettacode.org/wiki/Color_quantization/C
 */
export class OctreeQuantizer implements Quantizer {
  private static readonly ON_INHEAP = 1;

  private readonly root: OctreeNode;

  constructor(image: MemoryImage, numberOfColors = 256) {
    this.root = new OctreeNode(0, 0);
    const heap = new HeapNode();
    for (let si = 0; si < image.length; ++si) {
      const c = image.getPixelByIndex(si);
      const r = ColorUtils.getRed(c);
      const g = ColorUtils.getGreen(c);
      const b = ColorUtils.getBlue(c);
      this.heapAdd(heap, this.nodeInsert(this.root, r, g, b));
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
  }

  private nodeInsert(
    root: OctreeNode,
    r: number,
    g: number,
    b: number
  ): OctreeNode {
    let _root = root;

    let depth = 0;
    for (let bit = 1 << 7; ++depth < 8; bit >>= 1) {
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
    if ((p.flags & OctreeQuantizer.ON_INHEAP) !== 0) {
      this.downHeap(h, p);
      this.upHeap(h, p);
      return;
    }

    p.flags |= OctreeQuantizer.ON_INHEAP;
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

    const ac = a.count >> a.depth;
    const bc = b.count >> b.depth;
    return ac < bc ? -1 : ac > bc ? 1 : 0;
  }

  /**
   * Find the index of the closest color to [c] in the [colorMap].
   */
  public getQuantizedColor(c: number): number {
    let r = ColorUtils.getRed(c);
    let g = ColorUtils.getGreen(c);
    let b = ColorUtils.getBlue(c);
    let root: OctreeNode | undefined = this.root;

    for (let bit = 1 << 7; bit !== 0; bit >>= 1) {
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
    return ColorUtils.getColor(r, g, b);
  }
}
