/** @format */

import { HuffmanNode } from './huffman-node';

export class JpegComponent {
  private readonly _quantizationTableList: Array<Int16Array | undefined>;

  private readonly _quantizationIndex: number;

  private readonly _hSamples: number;
  public get hSamples(): number {
    return this._hSamples;
  }

  private readonly _vSamples: number;
  public get vSamples(): number {
    return this._vSamples;
  }

  private _blocks: Array<Array<Int32Array>> = new Array<Array<Int32Array>>();
  public get blocks(): Array<Array<Int32Array>> {
    return this._blocks;
  }

  private _blocksPerLine = 0;
  public get blocksPerLine(): number {
    return this._blocksPerLine;
  }

  private _blocksPerColumn = 0;
  public get blocksPerColumn(): number {
    return this._blocksPerColumn;
  }

  private _huffmanTableDC: Array<HuffmanNode | undefined> = [];
  public set huffmanTableDC(v: Array<HuffmanNode | undefined>) {
    this._huffmanTableDC = v;
  }
  public get huffmanTableDC(): Array<HuffmanNode | undefined> {
    return this._huffmanTableDC;
  }

  private _huffmanTableAC: Array<HuffmanNode | undefined> = [];
  public set huffmanTableAC(v: Array<HuffmanNode | undefined>) {
    this._huffmanTableAC = v;
  }
  public get huffmanTableAC(): Array<HuffmanNode | undefined> {
    return this._huffmanTableAC;
  }

  private _pred = 0;
  public set pred(v: number) {
    this._pred = v;
  }
  public get pred(): number {
    return this._pred;
  }

  public get quantizationTable(): Int16Array | undefined {
    return this._quantizationTableList[this._quantizationIndex];
  }

  constructor(
    hSamples: number,
    vSamples: number,
    quantizationTableList: Array<Int16Array | undefined>,
    quantizationIndex: number
  ) {
    this._hSamples = hSamples;
    this._vSamples = vSamples;
    this._quantizationTableList = quantizationTableList;
    this._quantizationIndex = quantizationIndex;
  }

  public setBlocks(
    blocks: Array<Array<Int32Array>>,
    blocksPerLine: number,
    blocksPerColumn: number
  ) {
    this._blocks = blocks;
    this._blocksPerLine = blocksPerLine;
    this._blocksPerColumn = blocksPerColumn;
  }
}
