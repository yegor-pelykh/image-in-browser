/** @format */

import { HuffmanNode } from './huffman-node.js';

/**
 * Represents a JPEG component with its properties and methods.
 */
export class JpegComponent {
  /**
   * List of quantization tables.
   */
  private readonly _quantizationTableList: Array<Int16Array | undefined>;

  /**
   * Index of the quantization table.
   */
  private readonly _quantizationIndex: number;

  /**
   * Number of horizontal samples.
   */
  private readonly _hSamples: number;

  /**
   * Gets the number of horizontal samples.
   */
  public get hSamples(): number {
    return this._hSamples;
  }

  /**
   * Number of vertical samples.
   */
  private readonly _vSamples: number;

  /**
   * Gets the number of vertical samples.
   */
  public get vSamples(): number {
    return this._vSamples;
  }

  /**
   * 2D array of blocks.
   */
  private _blocks: Array<Array<Int32Array>> = new Array<Array<Int32Array>>();

  /**
   * Gets the 2D array of blocks.
   */
  public get blocks(): Array<Array<Int32Array>> {
    return this._blocks;
  }

  /**
   * Number of blocks per line.
   */
  private _blocksPerLine = 0;

  /**
   * Gets the number of blocks per line.
   */
  public get blocksPerLine(): number {
    return this._blocksPerLine;
  }

  /**
   * Number of blocks per column.
   */
  private _blocksPerColumn = 0;

  /**
   * Gets the number of blocks per column.
   */
  public get blocksPerColumn(): number {
    return this._blocksPerColumn;
  }

  /**
   * Array of Huffman nodes for DC table.
   */
  private _huffmanTableDC: Array<HuffmanNode | undefined> = [];

  /**
   * Sets the Huffman table for DC.
   */
  public set huffmanTableDC(v: Array<HuffmanNode | undefined>) {
    this._huffmanTableDC = v;
  }

  /**
   * Gets the Huffman table for DC.
   */
  public get huffmanTableDC(): Array<HuffmanNode | undefined> {
    return this._huffmanTableDC;
  }

  /**
   * Array of Huffman nodes for AC table.
   */
  private _huffmanTableAC: Array<HuffmanNode | undefined> = [];

  /**
   * Sets the Huffman table for AC.
   */
  public set huffmanTableAC(v: Array<HuffmanNode | undefined>) {
    this._huffmanTableAC = v;
  }

  /**
   * Gets the Huffman table for AC.
   */
  public get huffmanTableAC(): Array<HuffmanNode | undefined> {
    return this._huffmanTableAC;
  }

  /**
   * Prediction value.
   */
  private _pred = 0;

  /**
   * Sets the prediction value.
   */
  public set pred(v: number) {
    this._pred = v;
  }

  /**
   * Gets the prediction value.
   */
  public get pred(): number {
    return this._pred;
  }

  /**
   * Gets the quantization table.
   */
  public get quantizationTable(): Int16Array | undefined {
    return this._quantizationTableList[this._quantizationIndex];
  }

  /**
   * Constructs a new instance of JpegComponent.
   * @param {number} hSamples - Number of horizontal samples.
   * @param {number} vSamples - Number of vertical samples.
   * @param {Array<Int16Array | undefined>} quantizationTableList - List of quantization tables.
   * @param {number} quantizationIndex - Index of the quantization table.
   */
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

  /**
   * Sets the blocks and their dimensions.
   * @param {Array<Array<Int32Array>>} blocks - 2D array of blocks.
   * @param {number} blocksPerLine - Number of blocks per line.
   * @param {number} blocksPerColumn - Number of blocks per column.
   */
  public setBlocks(
    blocks: Array<Array<Int32Array>>,
    blocksPerLine: number,
    blocksPerColumn: number
  ): void {
    this._blocks = blocks;
    this._blocksPerLine = blocksPerLine;
    this._blocksPerColumn = blocksPerColumn;
  }
}
