/** @format */

import { HuffmanNode } from './huffman-node';

export class HuffmanParent extends HuffmanNode {
  private readonly _children: Array<HuffmanNode | undefined>;
  public get children(): Array<HuffmanNode | undefined> {
    return this._children;
  }

  constructor(children: Array<HuffmanNode | undefined>) {
    super();
    this._children = children;
  }
}
