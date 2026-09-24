/** @format */

/**
 * The low 32 bits of `a * b`, with no intermediate above the 53 bits a number is
 * exact to on the web.
 */
export function mul32(a: number, b: number): number {
  const lo = (a & 0xffff) * b;
  const hi = ((a >>> 16) * b) & 0xffff;
  return (lo + hi * 0x10000) & 0xffffffff;
}

const _hashMultiplier = 0x1e35a7bd;

/**
 * The cache slot [argb] belongs in, for a cache of `32 - hashShift` bits.
 *
 * The encoder writes the slot it computed and the decoder answers from the
 * slot it computed, so the two have to agree to the bit. The product reaches
 * 2^62, which a plain multiply rounds on the web.
 */
export function colorCacheKey(argb: number, hashShift: number): number {
  return mul32(argb, _hashMultiplier) >>> hashShift;
}
