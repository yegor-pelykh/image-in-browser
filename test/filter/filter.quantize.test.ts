/** @format */

import { describe, expect, test } from 'vitest';
import {
  decodePng,
  DitherKernel,
  encodePng,
  Filter,
  QuantizeMethod,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter functionality.
 */
describe('Filter', TestUtils.testOptions, () => {
  /**
   * Test case for the quantize method of the Filter.
   */
  test('quantize', () => {
    // Read input image file
    const input0 = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    // Decode the input PNG image
    const i0 = decodePng({
      data: input0,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    // Quantize the image using the octree method
    const q0 = Filter.quantize({
      image: i0,
      numberOfColors: 32,
      method: QuantizeMethod.octree,
    });

    // Encode the quantized image to PNG and write to file
    let output = encodePng({
      image: q0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'quantize_octree.png',
      output
    );

    // Decode the input PNG image again
    const i0_ = decodePng({
      data: input0,
    })!;

    // Quantize the image using the octree method with dithering
    const q0_ = Filter.quantize({
      image: i0_,
      numberOfColors: 32,
      method: QuantizeMethod.octree,
      dither: DitherKernel.floydSteinberg,
    });

    // Encode the quantized image to PNG and write to file
    output = encodePng({
      image: q0_,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'quantize_octree_dither.png',
      output
    );

    // Decode the input PNG image again
    const i1 = decodePng({
      data: input0,
    })!;

    // Quantize the image using the default method
    const q1 = Filter.quantize({
      image: i1,
      numberOfColors: 32,
    });

    // Encode the quantized image to PNG and write to file
    output = encodePng({
      image: q1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'quantize_neural.png',
      output
    );

    // Decode the input PNG image again
    const i1_ = decodePng({
      data: input0,
    })!;

    // Convert the image to grayscale and quantize using the default method with dithering
    const q1_ = Filter.quantize({
      image: Filter.grayscale({
        image: i1_,
      }),
      numberOfColors: 2,
      dither: DitherKernel.floydSteinberg,
    });

    // Encode the quantized image to PNG and write to file
    output = encodePng({
      image: q1_,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'quantize_neural_dither.png',
      output
    );

    // Read another input image file
    const input2 = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'david.png'
    );

    // Decode the input PNG image
    const i2 = decodePng({
      data: input2,
    });
    expect(i2).toBeDefined();
    if (i2 === undefined) {
      return;
    }

    // Quantize the image using the binary method with dithering
    const q2 = Filter.quantize({
      image: i2,
      method: QuantizeMethod.binary,
      dither: DitherKernel.floydSteinberg,
    });

    // Encode the quantized image to PNG and write to file
    output = encodePng({
      image: q2,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'quantize_binary.png',
      output
    );
  });
});
