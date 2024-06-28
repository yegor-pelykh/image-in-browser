/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  decodePng,
  encodePng,
  Interpolation,
  MemoryImage,
  Transform,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Transform module.
 */
describe('Transform', () => {
  /**
   * Test case for the copyResize function using nearest neighbor interpolation.
   */
  test('copyResize nearest', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    const img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const i0 = Transform.copyResize({
      image: img,
      width: 64,
    });

    expect(i0.width).toBe(64);
    expect(i0.height).toBe(40);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_nearest.png',
      output
    );
  });

  /**
   * Test case for the copyResize function using average interpolation.
   */
  test('copyResize average', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    const img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const i0 = Transform.copyResize({
      image: img,
      width: 64,
      interpolation: Interpolation.average,
    });

    expect(i0.width).toBe(64);
    expect(i0.height).toBe(40);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_average.png',
      output
    );
  });

  /**
   * Test case for the copyResize function using linear interpolation.
   */
  test('copyResize linear', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    const img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const i0 = Transform.copyResize({
      image: img,
      width: 64,
      interpolation: Interpolation.linear,
    });

    expect(i0.width).toBe(64);
    expect(i0.height).toBe(40);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_linear.png',
      output
    );
  });

  /**
   * Test case for the copyResize function using cubic interpolation.
   */
  test('copyResize cubic', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    const img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const i0 = Transform.copyResize({
      image: img,
      width: 64,
      interpolation: Interpolation.cubic,
    });

    expect(i0.width).toBe(64);
    expect(i0.height).toBe(40);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_cubic.png',
      output
    );
  });

  /**
   * Test case for the copyResize function maintaining aspect ratio.
   */
  test('copyResize maintainAspect', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    const img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const i0 = Transform.copyResize({
      image: img,
      width: 640,
      height: 640,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i0.width).toBe(640);
    expect(i0.height).toBe(640);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_maintainAspect.png',
      output
    );
  });

  /**
   * Test case for the copyResize function maintaining aspect ratio with a palette image.
   */
  test('copyResize maintainAspect palette', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_8.png'
    );
    const img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const i0 = Transform.copyResize({
      image: img,
      width: 640,
      height: 640,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i0.width).toBe(640);
    expect(i0.height).toBe(640);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_maintainAspect_palette.png',
      output
    );
  });

  /**
   * Test case for the copyResize function maintaining aspect ratio with a different image size.
   */
  test('copyResize maintainAspect 2', () => {
    const i0 = new MemoryImage({
      width: 100,
      height: 50,
    });
    i0.clear(new ColorRgb8(255, 0, 0));

    const i1 = Transform.copyResize({
      image: i0,
      width: 200,
      height: 200,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).toBe(200);
    expect(i1.height).toBe(200);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_maintainAspect_2.png',
      output
    );
  });

  /**
   * Test case for the copyResize function maintaining aspect ratio with another different image size.
   */
  test('copyResize maintainAspect 3', () => {
    const i0 = new MemoryImage({
      width: 50,
      height: 100,
    });
    i0.clear(new ColorRgb8(0, 255, 0));

    const i1 = Transform.copyResize({
      image: i0,
      width: 200,
      height: 200,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).toBe(200);
    expect(i1.height).toBe(200);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_maintainAspect_3.png',
      output
    );
  });

  /**
   * Test case for the copyResize function maintaining aspect ratio with yet another different image size.
   */
  test('copyResize maintainAspect 4', () => {
    const i0 = new MemoryImage({
      width: 100,
      height: 50,
    });
    i0.clear(new ColorRgb8(255, 0, 0));

    const i1 = Transform.copyResize({
      image: i0,
      width: 50,
      height: 100,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).toBe(50);
    expect(i1.height).toBe(100);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_maintainAspect_4.png',
      output
    );
  });

  /**
   * Test case for the copyResize function maintaining aspect ratio with another different image size.
   */
  test('copyResize maintainAspect 5', () => {
    const i0 = new MemoryImage({
      width: 50,
      height: 100,
    });
    i0.clear(new ColorRgb8(0, 255, 0));

    const i1 = Transform.copyResize({
      image: i0,
      width: 100,
      height: 50,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).toBe(100);
    expect(i1.height).toBe(50);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_maintainAspect_5.png',
      output
    );
  });

  /**
   * Test case for the copyResize function maintaining aspect ratio with a tall image.
   */
  test('copyResize maintainAspect 6', () => {
    const i0 = new MemoryImage({
      width: 50,
      height: 100,
    });
    i0.clear(new ColorRgb8(0, 255, 0));

    const i1 = Transform.copyResize({
      image: i0,
      width: 100,
      height: 500,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).toBe(100);
    expect(i1.height).toBe(500);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_maintainAspect_6.png',
      output
    );
  });

  /**
   * Test case for the copyResize function maintaining aspect ratio with a wide image.
   */
  test('copyResize maintainAspect 7', () => {
    const i0 = new MemoryImage({
      width: 100,
      height: 50,
    });
    i0.clear(new ColorRgb8(0, 255, 0));

    const i1 = Transform.copyResize({
      image: i0,
      width: 500,
      height: 100,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).toBe(500);
    expect(i1.height).toBe(100);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_maintainAspect_7.png',
      output
    );
  });

  /**
   * Test case for the copyResize function with a palette image.
   */
  test('copyResize palette', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'test.png'
    );
    const img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const i0 = Transform.copyResize({
      image: img,
      width: 64,
      interpolation: Interpolation.cubic,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_palette.png',
      output
    );
  });
});
