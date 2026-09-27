/** @format */

import { VP8LBitWriter } from './vp8l-bit-writer.js';
import { VP8LHistogram } from './vp8l-histogram.js';
import * as huffman from './vp8l-huffman-encoder.js';

/**
 * One meta Huffman group's five Huffman codes, ready to write with.
 */
export class VP8LHuffmanCodes {
  public readonly greenAlphabetSize: number;
  public readonly greenLen: number[];
  public readonly redLen: number[];
  public readonly blueLen: number[];
  public readonly alphaLen: number[];
  public readonly distLen: number[];

  public green: number[] = [];
  public red: number[] = [];
  public blue: number[] = [];
  public alpha: number[] = [];
  public dist: number[] = [];

  constructor(h: VP8LHistogram, greenAlphabetSize: number) {
    this.greenAlphabetSize = greenAlphabetSize;
    this.greenLen = huffman.buildHuffmanCodeLengths(
      Array.from(h.green),
      greenAlphabetSize
    );
    this.redLen = huffman.buildHuffmanCodeLengths(Array.from(h.red), 256);
    this.blueLen = huffman.buildHuffmanCodeLengths(Array.from(h.blue), 256);
    this.alphaLen = huffman.buildHuffmanCodeLengths(Array.from(h.alpha), 256);
    this.distLen = huffman.buildHuffmanCodeLengths(Array.from(h.dist), 40);
  }

  /**
   * Writes the code definitions and derives the codes used to encode with.
   *
   * The two go together because writing a single-symbol code zeroes its length
   * in place, which the canonical codes then have to reflect.
   */
  public write(bw: VP8LBitWriter): void {
    huffman.writeHuffmanCode(bw, this.greenAlphabetSize, this.greenLen);
    huffman.writeHuffmanCode(bw, 256, this.redLen);
    huffman.writeHuffmanCode(bw, 256, this.blueLen);
    huffman.writeHuffmanCode(bw, 256, this.alphaLen);
    huffman.writeHuffmanCode(bw, 40, this.distLen);

    this.green = huffman.canonicalCodes(
      Int32Array.from(this.greenLen),
      this.greenAlphabetSize
    );
    this.red = huffman.canonicalCodes(Int32Array.from(this.redLen), 256);
    this.blue = huffman.canonicalCodes(Int32Array.from(this.blueLen), 256);
    this.alpha = huffman.canonicalCodes(Int32Array.from(this.alphaLen), 256);
    this.dist = huffman.canonicalCodes(Int32Array.from(this.distLen), 40);
  }

  public writeSymbol(
    bw: VP8LBitWriter,
    codes: number[],
    lengths: number[],
    symbol: number
  ): void {
    bw.writeBits(codes[symbol], lengths[symbol]);
  }
}
