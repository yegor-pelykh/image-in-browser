/** @format */

import { describe, expect, test } from 'vitest';
import { TestUtils } from '../_utils/test-utils';
import { ColorFloat64 } from '../../src';

/**
 * Color immutability tests — float64 format.
 */
describe('Color', () => {
  /**
   * ColorFloat64 with length 0 is immutable; setting r has no effect and all channels remain 0.
   */
  test('ColorFloat64', () => {
    const c0 = new ColorFloat64(0);
    expect(c0.length).toBe(0);
    c0.r = 5;
    expect(c0.r).toBe(0);
    expect(c0.g).toBe(0);
    expect(c0.b).toBe(0);
    expect(c0.a).toBe(0);
  });
});
