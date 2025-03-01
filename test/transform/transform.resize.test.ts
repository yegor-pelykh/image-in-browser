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
   *  Test resizing an image using nearest neighbor interpolation
   */
  test('resize nearest', () => {
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

    const i0 = Transform.resize({
      image: img,
      width: 64,
    });

    expect(i0.width).equals(64);
    expect(i0.height).equals(40);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'resize.png',
      output
    );
  });

  /**
   * Test resizing an image using average interpolation
   */
  test('resize average', () => {
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

    const i0 = Transform.resize({
      image: img,
      width: 64,
      interpolation: Interpolation.average,
    });

    expect(i0.width).equals(64);
    expect(i0.height).equals(40);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'resize_average.png',
      output
    );
  });

  /**
   * Test resizing an image using linear interpolation
   */
  test('resize linear', () => {
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

    const i0 = Transform.resize({
      image: img,
      width: 64,
      interpolation: Interpolation.linear,
    });

    expect(i0.width).equals(64);
    expect(i0.height).equals(40);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'resize_linear.png',
      output
    );
  });

  /**
   * Test resizing an image while maintaining aspect ratio
   */
  test('resize maintainAspect', () => {
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

    const i0 = Transform.resize({
      image: img,
      width: 640,
      height: 640,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i0.width).equals(640);
    expect(i0.height).equals(640);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'resize_maintainAspect.png',
      output
    );
  });

  /**
   * Test resizing a palette image while maintaining aspect ratio
   */
  test('resize maintainAspect palette', () => {
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

    const i0 = Transform.resize({
      image: img,
      width: 640,
      height: 640,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i0.width).equals(640);
    expect(i0.height).equals(640);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'resize_maintainAspect_palette.png',
      output
    );
  });

  /**
   * Test resizing a MemoryImage while maintaining aspect ratio (case 2)
   */
  test('resize maintainAspect 2', () => {
    const i0 = new MemoryImage({
      width: 100,
      height: 50,
    });
    i0.clear(new ColorRgb8(255, 0, 0));

    const i1 = Transform.resize({
      image: i0,
      width: 200,
      height: 200,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).equals(200);
    expect(i1.height).equals(200);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'resize_maintainAspect_2.png',
      output
    );
  });

  /**
   * Test resizing a MemoryImage while maintaining aspect ratio (case 3)
   */
  test('resize maintainAspect 3', () => {
    const i0 = new MemoryImage({
      width: 50,
      height: 100,
    });
    i0.clear(new ColorRgb8(0, 255, 0));

    const i1 = Transform.resize({
      image: i0,
      width: 200,
      height: 200,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).equals(200);
    expect(i1.height).equals(200);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'resize_maintainAspect_3.png',
      output
    );
  });

  /**
   * Test resizing a MemoryImage while maintaining aspect ratio (case 4)
   */
  test('resize maintainAspect 4', () => {
    const i0 = new MemoryImage({
      width: 100,
      height: 50,
    });
    i0.clear(new ColorRgb8(255, 0, 0));

    const i1 = Transform.resize({
      image: i0,
      width: 50,
      height: 100,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).equals(50);
    expect(i1.height).equals(100);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'resize_maintainAspect_4.png',
      output
    );
  });

  /**
   * Test resizing a MemoryImage while maintaining aspect ratio (case 5)
   */
  test('resize maintainAspect 5', () => {
    const i0 = new MemoryImage({
      width: 50,
      height: 100,
    });
    i0.clear(new ColorRgb8(0, 255, 0));

    const i1 = Transform.resize({
      image: i0,
      width: 100,
      height: 50,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).equals(100);
    expect(i1.height).equals(50);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'resize_maintainAspect_5.png',
      output
    );
  });

  /**
   * Test resizing a MemoryImage while maintaining aspect ratio (case 6)
   */
  test('resize maintainAspect 6', () => {
    const i0 = new MemoryImage({
      width: 50,
      height: 100,
    });
    i0.clear(new ColorRgb8(0, 255, 0));

    const i1 = Transform.resize({
      image: i0,
      width: 100,
      height: 500,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).equals(100);
    expect(i1.height).equals(500);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'resize_maintainAspect_6.png',
      output
    );
  });

  /**
   * Test resizing a MemoryImage while maintaining aspect ratio (case 7)
   */
  test('resize maintainAspect 7', () => {
    const i0 = new MemoryImage({
      width: 100,
      height: 50,
    });
    i0.clear(new ColorRgb8(0, 255, 0));

    const i1 = Transform.resize({
      image: i0,
      width: 500,
      height: 100,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).equals(500);
    expect(i1.height).equals(100);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'resize_maintainAspect_7.png',
      output
    );
  });

  /**
   * Test resizing a palette image using cubic interpolation
   */
  test('resize palette', () => {
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

    const i0 = Transform.resize({
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
      'resize_palette.png',
      output
    );
  });
});
