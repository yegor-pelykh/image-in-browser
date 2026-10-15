/** @format */

import { HuffmanNode } from './huffman-node.js';
import { HuffmanParent } from './huffman-parent.js';
import { HuffmanValue } from './huffman-value.js';

/**
 * The number of bits lookup tables are indexed by.
 */
export const huffmanLookupBits = 9;

/**
 * Cached lookup tables, keyed by the Huffman tree they were built from.
 */
const lookups = new WeakMap<object, Uint16Array>();

/**
 * Returns a lookahead table for the Huffman **tree**. For the next
 * {@link huffmanLookupBits} bits of input i, entry i is
 * `(codeLength << 8) | value` when the code is at most
 * {@link huffmanLookupBits} long, or 0 when the tree has to be walked.
 * @param {Array<HuffmanNode | undefined>} tree - The Huffman tree.
 * @returns {Uint16Array} The lookahead table.
 */
export function huffmanLookup(
  tree: Array<HuffmanNode | undefined>
): Uint16Array {
  let lookup = lookups.get(tree);
  if (lookup === undefined) {
    lookup = buildLookup(tree);
    lookups.set(tree, lookup);
  }
  return lookup;
}

/**
 * Builds the lookahead table for the Huffman **tree**.
 * @param {Array<HuffmanNode | undefined>} tree - The Huffman tree.
 * @returns {Uint16Array} The lookahead table.
 */
function buildLookup(tree: Array<HuffmanNode | undefined>): Uint16Array {
  const lookup = new Uint16Array(1 << huffmanLookupBits);
  for (let i = 0; i < lookup.length; ++i) {
    let children = tree;
    for (let length = 1; length <= huffmanLookupBits; ++length) {
      const node = children[(i >> (huffmanLookupBits - length)) & 1];
      if (node instanceof HuffmanValue) {
        lookup[i] = (length << 8) | node.value;
        break;
      }
      if (!(node instanceof HuffmanParent)) {
        break;
      }
      children = node.children;
    }
  }
  return lookup;
}
