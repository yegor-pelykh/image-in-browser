/** @format */

import { HuffmanNode } from './huffman-node.js';

export class JpegHuffman {
  private readonly _children: Array<HuffmanNode | undefined> = [];
  public get children(): Array<HuffmanNode | undefined> {
    return this._children;
  }

  private _index = 0;
  public get index(): number {
    return this._index;
  }

  public incrementIndex() {
    this._index++;
  }
}
