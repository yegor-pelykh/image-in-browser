/** @format */

import { VP8L } from './vp8l.js';
import { VP8LBitReader } from './vp8l-bit-reader.js';

export class HuffmanTree {
  // Fast lookup for short bit lengths
  private readonly _lutBits = new Uint8Array(HuffmanTree.huffmanLut);
  private readonly _lutSymbol = new Int16Array(HuffmanTree.huffmanLut);
  private readonly _lutJump = new Int16Array(HuffmanTree.huffmanLut);

  // all the nodes, starting at root, stored as a single int array, where
  // each node occupies two ints as [symbol, children].
  private _tree!: Int32Array;

  // max number of nodes
  private _maxNodes: number = 0;

  private _numNodes: number = 0;
  /**
   * Number of currently occupied nodes
   */
  public get numNodes(): number {
    return this._numNodes;
  }

  public get isFull(): boolean {
    return this._numNodes === this._maxNodes;
  }

  constructor(numLeaves: number = 0) {
    this.init(numLeaves);
  }

  private addSymbol(symbol: number, code: number, codeLength: number): boolean {
    let _codeLength = codeLength;
    let step = HuffmanTree.huffmanLutBits;
    let baseCode: number = 0;
    let node = 0;

    if (_codeLength <= HuffmanTree.huffmanLutBits) {
      baseCode = this.reverseBitsShort(code, _codeLength);
      for (
        let i = 0;
        i < 1 << (HuffmanTree.huffmanLutBits - _codeLength);
        ++i
      ) {
        const idx = baseCode | (i << _codeLength);
        this._lutSymbol[idx] = symbol;
        this._lutBits[idx] = _codeLength;
      }
    } else {
      baseCode = this.reverseBitsShort(
        code >>> (_codeLength - HuffmanTree.huffmanLutBits),
        HuffmanTree.huffmanLutBits
      );
    }

    while (_codeLength-- > 0) {
      if (node >= this._maxNodes) {
        return false;
      }

      if (this.nodeIsEmpty(node)) {
        if (this.isFull) {
          // error: too many symbols
          return false;
        }

        this.assignChildren(node);
      } else if (!this.nodeIsNotLeaf(node)) {
        // leaf is already occupied
        return false;
      }

      node += this.nodeChildren(node) + ((code >>> _codeLength) & 1);

      if (--step === 0) {
        this._lutJump[baseCode] = node;
      }
    }

    if (this.nodeIsEmpty(node)) {
      // turn newly created node into a leaf
      this.nodeSetChildren(node, 0);
    } else if (this.nodeIsNotLeaf(node)) {
      // trying to assign a symbol to already used code
      return false;
    }

    // Add symbol in this node
    this.nodeSetSymbol(node, symbol);

    return true;
  }

  private reverseBitsShort(bits: number, numBits: number): number {
    const v =
      (HuffmanTree.reversedBits[bits & 0xf] << 4) |
      HuffmanTree.reversedBits[bits >>> 4];
    return v >>> (8 - numBits);
  }

  private nextNode(node: number, rightChild: number): number {
    return node + this.nodeChildren(node) + rightChild;
  }

  private nodeSymbol(node: number): number {
    return this._tree[node << 1];
  }

  private nodeSetSymbol(node: number, symbol: number): void {
    this._tree[node << 1] = symbol;
  }

  private nodeChildren(node: number): number {
    return this._tree[(node << 1) + 1];
  }

  private nodeSetChildren(node: number, children: number): void {
    this._tree[(node << 1) + 1] = children;
  }

  private nodeIsNotLeaf(node: number): boolean {
    return this._tree[(node << 1) + 1] !== 0;
  }

  private nodeIsEmpty(node: number): boolean {
    return this._tree[(node << 1) + 1] < 0;
  }

  private assignChildren(node: number): void {
    const children = this._numNodes;
    this.nodeSetChildren(node, children - node);

    this._numNodes += 2;

    this.nodeSetChildren(children, -1);
    this.nodeSetChildren(children + 1, -1);
  }

  private huffmanCodeLengthsToCodes(
    codeLengths: Int32Array,
    codeLengthsSize: number,
    huffCodes: Int32Array
  ): boolean {
    let symbol: number = 0;
    let codeLen: number = 0;
    const codeLengthHist = new Int32Array(VP8L.maxAllowedCodeLength + 1);
    let currCode: number = 0;
    const nextCodes = new Int32Array(VP8L.maxAllowedCodeLength + 1);
    let maxCodeLength = 0;

    // Calculate max code length.
    for (symbol = 0; symbol < codeLengthsSize; ++symbol) {
      if (codeLengths[symbol] > maxCodeLength) {
        maxCodeLength = codeLengths[symbol];
      }
    }

    if (maxCodeLength > VP8L.maxAllowedCodeLength) {
      return false;
    }

    // Calculate code length histogram.
    for (symbol = 0; symbol < codeLengthsSize; ++symbol) {
      ++codeLengthHist[codeLengths[symbol]];
    }

    codeLengthHist[0] = 0;

    // Calculate the initial values of 'nextCodes' for each code length.
    // nextCodes[codeLen] denotes the code to be assigned to the next symbol
    // of code length 'codeLen'.
    currCode = 0;
    // Unused, as code length = 0 implies code doesn't exist.
    nextCodes[0] = -1;

    for (codeLen = 1; codeLen <= maxCodeLength; ++codeLen) {
      currCode = (currCode + codeLengthHist[codeLen - 1]) << 1;
      nextCodes[codeLen] = currCode;
    }

    // Get symbols
    for (symbol = 0; symbol < codeLengthsSize; ++symbol) {
      if (codeLengths[symbol] > 0) {
        huffCodes[symbol] = nextCodes[codeLengths[symbol]]++;
      } else {
        huffCodes[symbol] = -1;
      }
    }

    return true;
  }

  private init(numLeaves: number): boolean {
    if (numLeaves === 0) {
      return false;
    }

    this._maxNodes = (numLeaves << 1) - 1;
    this._tree = new Int32Array(this._maxNodes << 1);
    this._tree[1] = -1;
    this._numNodes = 1;
    this._lutBits.fill(255);

    return true;
  }

  public buildImplicit(
    codeLengths: Int32Array,
    codeLengthsSize: number
  ): boolean {
    let numSymbols = 0;
    let rootSymbol = 0;

    // Find out number of symbols and the root symbol.
    for (let symbol = 0; symbol < codeLengthsSize; ++symbol) {
      if (codeLengths[symbol] > 0) {
        // Note: code length = 0 indicates non-existent symbol.
        ++numSymbols;
        rootSymbol = symbol;
      }
    }

    // Initialize the tree. Will fail for num_symbols = 0
    if (!this.init(numSymbols)) {
      return false;
    }

    // Build tree.
    if (numSymbols === 1) {
      // Trivial case.
      const maxSymbol = codeLengthsSize;
      if (rootSymbol < 0 || rootSymbol >= maxSymbol) {
        return false;
      }

      return this.addSymbol(rootSymbol, 0, 0);
    }

    // Normal case.

    // Get Huffman codes from the code lengths.
    const codes = new Int32Array(codeLengthsSize);

    if (!this.huffmanCodeLengthsToCodes(codeLengths, codeLengthsSize, codes)) {
      return false;
    }

    // Add symbols one-by-one.
    for (let symbol = 0; symbol < codeLengthsSize; ++symbol) {
      if (codeLengths[symbol] > 0) {
        if (!this.addSymbol(symbol, codes[symbol], codeLengths[symbol])) {
          return false;
        }
      }
    }

    return this.isFull;
  }

  public buildExplicit(
    codeLengths: number[],
    codes: number[],
    symbols: number[],
    maxSymbol: number,
    numSymbols: number
  ): boolean {
    // Initialize the tree. Will fail if num_symbols = 0.
    if (!this.init(numSymbols)) {
      return false;
    }

    // Add symbols one-by-one.
    for (let i = 0; i < numSymbols; ++i) {
      if (codes[i] !== -1) {
        if (symbols[i] < 0 || symbols[i] >= maxSymbol) {
          return this.isFull;
        }

        if (!this.addSymbol(symbols[i], codes[i], codeLengths[i])) {
          return this.isFull;
        }
      }
    }

    return this.isFull;
  }

  /**
   * Decodes the next Huffman code from bit-stream.
   */
  public readSymbol(br: VP8LBitReader): number {
    let node = 0;
    let bits = br.prefetchBits();
    let newBitPos = br.bitPos;
    // Check if we find the bit combination from the Huffman lookup table.
    const lutIx = bits & (HuffmanTree.huffmanLut - 1);
    const lutBits = this._lutBits[lutIx];

    if (lutBits <= HuffmanTree.huffmanLutBits) {
      br.bitPos += lutBits;
      return this._lutSymbol[lutIx];
    }

    node += this._lutJump[lutIx];
    newBitPos += HuffmanTree.huffmanLutBits;
    bits >>>= HuffmanTree.huffmanLutBits;

    // Decode the value from a binary tree.
    do {
      node = this.nextNode(node, bits & 1);
      bits >>>= 1;
      ++newBitPos;
    } while (this.nodeIsNotLeaf(node));

    br.bitPos = newBitPos;

    return this.nodeSymbol(node);
  }

  private static readonly huffmanLutBits = 7;
  private static readonly huffmanLut = 1 << HuffmanTree.huffmanLutBits;

  // Pre-reversed 4-bit values.
  private static readonly reversedBits: number[] = [
    0x0, 0x8, 0x4, 0xc, 0x2, 0xa, 0x6, 0xe, 0x1, 0x9, 0x5, 0xd, 0x3, 0xb, 0x7,
    0xf,
  ];
}
