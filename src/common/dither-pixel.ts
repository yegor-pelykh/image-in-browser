/** @format */

import { DitherKernel } from './dither-kernel';
import { MemoryImage } from './memory-image';
import { NeuralQuantizer } from './neural-quantizer';

export abstract class DitherPixel {
  private static ditherKernels = [
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    // FalseFloydSteinberg
    [
      [3 / 8, 1, 0],
      [3 / 8, 0, 1],
      [2 / 8, 1, 1],
    ],
    // FloydSteinberg
    [
      [7 / 16, 1, 0],
      [3 / 16, -1, 1],
      [5 / 16, 0, 1],
      [1 / 16, 1, 1],
    ],
    // Stucki
    [
      [8 / 42, 1, 0],
      [4 / 42, 2, 0],
      [2 / 42, -2, 1],
      [4 / 42, -1, 1],
      [8 / 42, 0, 1],
      [4 / 42, 1, 1],
      [2 / 42, 2, 1],
      [1 / 42, -2, 2],
      [2 / 42, -1, 2],
      [4 / 42, 0, 2],
      [2 / 42, 1, 2],
      [1 / 42, 2, 2],
    ],
    //Atkinson:
    [
      [1 / 8, 1, 0],
      [1 / 8, 2, 0],
      [1 / 8, -1, 1],
      [1 / 8, 0, 1],
      [1 / 8, 1, 1],
      [1 / 8, 0, 2],
    ],
  ];

  public static getDitherPixels(
    image: MemoryImage,
    quantizer: NeuralQuantizer,
    kernel: DitherKernel,
    serpentine: boolean
  ): Uint8Array {
    if (kernel === DitherKernel.None) {
      return quantizer.getIndexMap(image);
    }

    const ds = DitherPixel.ditherKernels[kernel];
    const height = image.height;
    const width = image.width;
    const data = new Uint8Array(image.getBytes());

    const indexedPixels = new Uint8Array(width * height);
    const colorMap = quantizer.colorMap8;

    let direction = serpentine ? -1 : 1;
    let index = 0;
    for (let y = 0; y < height; y++) {
      if (serpentine) {
        direction *= -1;
      }

      const x0 = direction === 1 ? 0 : width - 1;
      const x1 = direction === 1 ? width : 0;
      for (let x = x0; x !== x1; x += direction, ++index) {
        // Get original color
        let idx = index * 4;
        const r1 = data[idx];
        const g1 = data[idx + 1];
        const b1 = data[idx + 2];

        // Get converted color
        idx = quantizer.lookupRGB(r1, g1, b1);

        indexedPixels[index] = idx;
        idx *= 3;
        const r2 = colorMap[idx];
        const g2 = colorMap[idx + 1];
        const b2 = colorMap[idx + 2];

        const er = r1 - r2;
        const eg = g1 - g2;
        const eb = b1 - b2;

        if (er !== 0 || eg !== 0 || eb !== 0) {
          const i0 = direction === 1 ? 0 : ds.length - 1;
          const i1 = direction === 1 ? ds.length : 0;
          for (let i = i0; i !== i1; i += direction) {
            const x1 = Math.trunc(ds[i][1]);
            const y1 = Math.trunc(ds[i][2]);
            if (
              x1 + x >= 0 &&
              x1 + x < width &&
              y1 + y >= 0 &&
              y1 + y < height
            ) {
              const d = ds[i][0];
              idx = index + x1 + y1 * width;
              idx *= 4;
              data[idx] = Math.max(
                0,
                Math.min(255, Math.trunc(data[idx] + er * d))
              );
              data[idx + 1] = Math.max(
                0,
                Math.min(255, Math.trunc(data[idx + 1] + eg * d))
              );
              data[idx + 2] = Math.max(
                0,
                Math.min(255, Math.trunc(data[idx + 2] + eb * d))
              );
            }
          }
        }
      }
    }

    return indexedPixels;
  }
}
