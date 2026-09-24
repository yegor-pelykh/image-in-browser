/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { VP8BoolEncoder } from './vp8-bool-encoder.js';
import { bitCost, VP8EncProba } from './vp8-enc-proba.js';

/**
 * Marks a token whose probability is a constant of the syntax rather than an
 * index into the adaptive table.
 */
const fixedProba = 1 << 14;

/**
 * A recording of every bit the encoder wants to write, before it knows the
 * probabilities to write them with.
 */
export class VP8TokenBuffer {
  private _tokens: Uint16Array = new Uint16Array(8192);
  private _length: number = 0;

  public get length(): number {
    return this._length;
  }

  public clear(): void {
    this._length = 0;
  }

  private push(token: number): void {
    if (this._length === this._tokens.length) {
      this.grow();
    }
    this._tokens[this._length++] = token;
  }

  private grow(): void {
    const newTokens = new Uint16Array(this._tokens.length * 2);
    ArrayUtils.copyRange(this._tokens, 0, newTokens, 0, this._length);
    this._tokens = newTokens;
  }

  /**
   * Records [bit] coded through the probability at [probaIdx], and counts it.
   */
  public add(proba: VP8EncProba, bit: number, probaIdx: number): number {
    this.push((bit << 15) | probaIdx);
    return proba.recordStats(bit, probaIdx);
  }

  /**
   * As [add], but counting the event against a different slot than the one it
   * is coded with.
   */
  public addStat(
    proba: VP8EncProba,
    bit: number,
    probaIdx: number,
    statIdx: number
  ): number {
    this.push((bit << 15) | probaIdx);
    return proba.recordStats(bit, statIdx);
  }

  /**
   * Records [bit] coded with a fixed probability.
   */
  public addConstant(bit: number, proba: number): void {
    this.push((bit << 15) | fixedProba | proba);
  }

  /**
   * Writes everything recorded, using [probas] for the adaptive tokens.
   */
  public emit(bw: VP8BoolEncoder, probas: Uint8Array): void {
    for (let i = 0; i < this._length; i++) {
      const token = this._tokens[i];
      const bit = (token >> 15) & 1;
      if ((token & fixedProba) !== 0) {
        bw.putBit(bit, token & 0xff);
      } else {
        bw.putBit(bit, probas[token & 0x3fff]);
      }
    }
  }

  /**
   * What [emit] would produce, in 1/256ths of a bit.
   */
  public estimateSize(probas: Uint8Array): number {
    let size = 0;
    for (let i = 0; i < this._length; i++) {
      const token = this._tokens[i];
      const bit = (token >> 15) & 1;
      if ((token & fixedProba) !== 0) {
        size += bitCost(bit, token & 0xff);
      } else {
        size += bitCost(bit, probas[token & 0x3fff]);
      }
    }
    return size;
  }
}
