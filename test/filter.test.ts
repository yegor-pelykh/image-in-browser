/** @format */

import {
  ColorChannel,
  decodePng,
  encodePng,
  ImageFilter,
  NoiseType,
  PixelateMode,
  QuantizeMethod,
  SeparableKernel,
} from '../src';
import { TestFolder, TestSection, TestHelpers } from './test-helpers';

describe('Filter', () => {
  test('adjustColor', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.adjustColor({
        src: imageBefore,
        saturation: 0.1,
      });
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'adjust-color.png',
        output
      );
    }
  });

  test('brightness', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.brightness(imageBefore, -50);
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'brightness.png',
        output
      );
    }
  });

  test('bumpToNormal', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.bumpToNormal(imageBefore);
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'bump-to-normal.png',
        output
      );
    }
  });

  test('colorOffset', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.colorOffset({
        src: imageBefore,
        red: -50,
        green: -50,
      });
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'color-offset.png',
        output
      );
    }
  });

  test('contrast', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.contrast(imageBefore, 50);
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'contrast.png',
        output
      );
    }
  });

  test('convolution', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.convolution({
        src: imageBefore,
        filter: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      });
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'convolution.png',
        output
      );
    }
  });

  test('emboss', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.emboss(imageBefore);
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'emboss.png',
        output
      );
    }
  });

  test('gaussianBlur', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.gaussianBlur(imageBefore, 5);
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'gaussian-blur.png',
        output
      );
    }
  });

  test('grayscale', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.grayscale(imageBefore);
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'grayscale.png',
        output
      );
    }
  });

  test('invert', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.invert(imageBefore);
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'invert.png',
        output
      );
    }
  });

  test('noise', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.noise(imageBefore, 20, NoiseType.gaussian);
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'noise.png',
        output
      );
    }
  });

  test('normalize', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.normalize(imageBefore, 20, 200);
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'normalize.png',
        output
      );
    }
  });

  test('pixelate', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.pixelate(
        imageBefore,
        10,
        PixelateMode.average
      );
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'pixelate.png',
        output
      );
    }
  });

  test('quantize', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.quantize({
        src: imageBefore,
        method: QuantizeMethod.neuralNet,
        numberOfColors: 20,
      });
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'quantize.png',
        output
      );
    }
  });

  test('remapColors', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.remapColors({
        src: imageBefore,
        blue: ColorChannel.green,
      });
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'remap-colors.png',
        output
      );
    }
  });

  test('scaleRgba', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.scaleRgba(imageBefore, 100, 100, 100, 100);
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'scale-rgba.png',
        output
      );
    }
  });

  test('separableConvolution', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const kernel = new SeparableKernel(8);
      kernel.setCoefficient(0, 0.5);
      kernel.setCoefficient(1, 0.5);
      kernel.setCoefficient(2, 0.5);
      const imageAfter = ImageFilter.separableConvolution(imageBefore, kernel);
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'separable-convolution.png',
        output
      );
    }
  });

  test('sepia', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.sepia(imageBefore, 2);
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'sepia.png',
        output
      );
    }
  });

  test('smooth', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.smooth(imageBefore, 0.5);
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'smooth.png',
        output
      );
    }
  });

  test('sobel', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.sobel(imageBefore, 0.5);
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'sobel.png',
        output
      );
    }
  });

  test('vignette', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.filter,
      'test.png'
    );
    const imageBefore = decodePng(input);
    expect(imageBefore).not.toBeUndefined();
    if (imageBefore !== undefined) {
      const imageAfter = ImageFilter.vignette({
        src: imageBefore,
      });
      const output = encodePng(imageAfter);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.filter,
        'vignette.png',
        output
      );
    }
  });
});
