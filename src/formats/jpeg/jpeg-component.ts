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
   * The number of blocks per line of {@link coefficients}, including the
   * blocks that pad the component out to whole MCUs.
   */
  private _blocksPerLineForMcu = 0;

  /**
   * Gets the number of blocks per line including MCU padding.
   */
  public get blocksPerLineForMcu(): number {
    return this._blocksPerLineForMcu;
  }

  /**
   * The number of blocks per column of {@link coefficients}, including the
   * blocks that pad the component out to whole MCUs.
   */
  private _blocksPerColumnForMcu = 0;

  /**
   * Gets the number of blocks per column including MCU padding.
   */
  public get blocksPerColumnForMcu(): number {
    return this._blocksPerColumnForMcu;
  }

  /**
   * The DCT coefficients, 64 per block, with blocks stored in row-major
   * order. The coefficient for block (row, col) starts at
   * `(row * blocksPerLineForMcu + col) * 64`.
   */
  private _coefficients: Int16Array = new Int16Array(0);

  /**
   * Gets the DCT coefficients.
   */
  public get coefficients(): Int16Array {
    return this._coefficients;
  }

  /**
   * Sets the DCT coefficients.
   */
  public set coefficients(v: Int16Array) {
    this._coefficients = v;
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
   * Lookahead table for {@link huffmanTableDC}.
   */
  private _huffmanLookupDC: Uint16Array = new Uint16Array(0);

  /**
   * Sets the lookahead table for the DC coefficients.
   */
  public set huffmanLookupDC(v: Uint16Array) {
    this._huffmanLookupDC = v;
  }

  /**
   * Gets the lookahead table for the DC coefficients.
   */
  public get huffmanLookupDC(): Uint16Array {
    return this._huffmanLookupDC;
  }

  /**
   * Lookahead table for {@link huffmanTableAC}.
   */
  private _huffmanLookupAC: Uint16Array = new Uint16Array(0);

  /**
   * Sets the lookahead table for the AC coefficients.
   */
  public set huffmanLookupAC(v: Uint16Array) {
    this._huffmanLookupAC = v;
  }

  /**
   * Gets the lookahead table for the AC coefficients.
   */
  public get huffmanLookupAC(): Uint16Array {
    return this._huffmanLookupAC;
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
   * Sets the block dimensions and allocates the coefficient buffer.
   * @param {number} blocksPerLine - Number of blocks per line.
   * @param {number} blocksPerColumn - Number of blocks per column.
   * @param {number} blocksPerLineForMcu - Number of blocks per line including MCU padding.
   * @param {number} blocksPerColumnForMcu - Number of blocks per column including MCU padding.
   */
  public setBlocks(
    blocksPerLine: number,
    blocksPerColumn: number,
    blocksPerLineForMcu: number,
    blocksPerColumnForMcu: number
  ): void {
    this._blocksPerLine = blocksPerLine;
    this._blocksPerColumn = blocksPerColumn;
    this._blocksPerLineForMcu = blocksPerLineForMcu;
    this._blocksPerColumnForMcu = blocksPerColumnForMcu;
    this._coefficients = new Int16Array(
      blocksPerLineForMcu * blocksPerColumnForMcu * 64
    );
  }
}
