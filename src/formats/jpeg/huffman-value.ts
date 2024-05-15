/** @format */

import { HuffmanNode } from './huffman-node.js';

export class HuffmanValue extends HuffmanNode {
  private readonly _value: number;
  public get value(): number {
    return this._value;
  }

  constructor(value: number) {
    super();
    this._value = value;
  }
}
