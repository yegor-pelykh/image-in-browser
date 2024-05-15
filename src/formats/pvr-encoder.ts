/** @format */

import { OutputBuffer } from '../common/output-buffer.js';
import { LibError } from '../error/lib-error.js';
import { MemoryImage } from '../image/image.js';
import { Encoder, EncoderEncodeOptions } from './encoder.js';
import { PvrBitUtility } from './pvr/pvr-bit-utility.js';
import { PvrColorBoundingBox } from './pvr/pvr-color-bounding-box.js';
import { PvrColorRgb } from './pvr/pvr-color-rgb.js';
import { PvrColorRgba } from './pvr/pvr-color-rgba.js';
import { PvrFormat } from './pvr/pvr-format.js';
import { PvrPacket } from './pvr/pvr-packet.js';

/**
 * Ported from Jeffrey Lim's PVRTC encoder/decoder,
 * https://bitbucket.org/jthlim/pvrtccompressor
 */
export class PvrEncoder implements Encoder {
  private readonly _format: PvrFormat;

  private _supportsAnimation = false;
  public get supportsAnimation(): boolean {
    return this._supportsAnimation;
  }

  constructor(format: PvrFormat = PvrFormat.auto) {
    this._format = format;
  }

  private static calculateBoundingBoxRgb(
    bitmap: MemoryImage,
    blockX: number,
    blockY: number
  ): PvrColorBoundingBox {
    const pixel = (x: number, y: number): PvrColorRgb => {
      const p = bitmap.getPixel(blockX + x, blockY + y);
      return new PvrColorRgb(Math.trunc(p.r), Math.trunc(p.g), Math.trunc(p.b));
    };
    const cbb = new PvrColorBoundingBox(pixel(0, 0), pixel(0, 0));
    cbb.add(pixel(1, 0));
    cbb.add(pixel(2, 0));
    cbb.add(pixel(3, 0));
    cbb.add(pixel(0, 1));
    cbb.add(pixel(1, 1));
    cbb.add(pixel(1, 2));
    cbb.add(pixel(1, 3));
    cbb.add(pixel(2, 0));
    cbb.add(pixel(2, 1));
    cbb.add(pixel(2, 2));
    cbb.add(pixel(2, 3));
    cbb.add(pixel(3, 0));
    cbb.add(pixel(3, 1));
    cbb.add(pixel(3, 2));
    cbb.add(pixel(3, 3));
    return cbb;
  }

  private static calculateBoundingBoxRgba(
    bitmap: MemoryImage,
    blockX: number,
    blockY: number
  ): PvrColorBoundingBox {
    const pixel = (x: number, y: number): PvrColorRgba => {
      const p = bitmap.getPixel(blockX + x, blockY + y);
      return new PvrColorRgba(
        Math.trunc(p.r),
        Math.trunc(p.g),
        Math.trunc(p.b),
        Math.trunc(p.a)
      );
    };
    const cbb = new PvrColorBoundingBox(pixel(0, 0), pixel(0, 0));
    cbb.add(pixel(1, 0));
    cbb.add(pixel(2, 0));
    cbb.add(pixel(3, 0));
    cbb.add(pixel(0, 1));
    cbb.add(pixel(1, 1));
    cbb.add(pixel(1, 2));
    cbb.add(pixel(1, 3));
    cbb.add(pixel(2, 0));
    cbb.add(pixel(2, 1));
    cbb.add(pixel(2, 2));
    cbb.add(pixel(2, 3));
    cbb.add(pixel(3, 0));
    cbb.add(pixel(3, 1));
    cbb.add(pixel(3, 2));
    cbb.add(pixel(3, 3));
    return cbb;
  }

  public encode(opt: EncoderEncodeOptions): Uint8Array {
    const output = new OutputBuffer();

    let format = this._format;

    let pvrtc: Uint8Array | undefined = undefined;
    switch (format) {
      case PvrFormat.auto:
        if (opt.image.numChannels === 3) {
          pvrtc = this.encodeRgb4bpp(opt.image);
          format = PvrFormat.rgb4;
        } else {
          pvrtc = this.encodeRgba4bpp(opt.image);
          format = PvrFormat.rgba4;
        }
        break;
      case PvrFormat.rgb2:
        pvrtc = this.encodeRgb4bpp(opt.image);
        break;
      case PvrFormat.rgba2:
        pvrtc = this.encodeRgba4bpp(opt.image);
        break;
      case PvrFormat.rgb4:
        pvrtc = this.encodeRgb4bpp(opt.image);
        break;
      case PvrFormat.rgba4:
        pvrtc = this.encodeRgba4bpp(opt.image);
        break;
    }

    const version = 55727696;
    const flags = 0;
    const pixelFormat = format - 1;
    const channelOrder = 0;
    const colorSpace = 0;
    const channelType = 0;
    const height = opt.image.height;
    const width = opt.image.width;
    const depth = 1;
    const numSurfaces = 1;
    const numFaces = 1;
    const mipmapCount = 1;
    const metaDataSize = 0;

    output.writeUint32(version);
    output.writeUint32(flags);
    output.writeUint32(pixelFormat);
    output.writeUint32(channelOrder);
    output.writeUint32(colorSpace);
    output.writeUint32(channelType);
    output.writeUint32(height);
    output.writeUint32(width);
    output.writeUint32(depth);
    output.writeUint32(numSurfaces);
    output.writeUint32(numFaces);
    output.writeUint32(mipmapCount);
    output.writeUint32(metaDataSize);
    output.writeBytes(pvrtc);

    return output.getBytes();
  }

  public encodeRgb4bpp(bitmap: MemoryImage): Uint8Array {
    if (bitmap.width !== bitmap.height) {
      throw new LibError('PVRTC requires a square image.');
    }

    if (!PvrBitUtility.isPowerOf2(bitmap.width)) {
      throw new LibError('PVRTC requires a power-of-two sized image.');
    }

    const size = bitmap.width;
    const blocks = Math.trunc(size / 4);
    const blockMask = blocks - 1;

    // Allocate enough data for encoding the image.
    const outputData = new Uint8Array(
      Math.trunc((bitmap.width * bitmap.height) / 2)
    );
    const packet = new PvrPacket(outputData);
    const p0 = new PvrPacket(outputData);
    const p1 = new PvrPacket(outputData);
    const p2 = new PvrPacket(outputData);
    const p3 = new PvrPacket(outputData);

    for (let y = 0; y < blocks; ++y) {
      for (let x = 0; x < blocks; ++x) {
        const cbb = PvrEncoder.calculateBoundingBoxRgb(bitmap, x, y);
        packet.setBlock(x, y);
        packet.usePunchthroughAlpha = false;
        packet.setColorRgbA(cbb.min as PvrColorRgb);
        packet.setColorRgbB(cbb.max as PvrColorRgb);
      }
    }

    const factors = PvrPacket.bilinearFactors;

    for (let y = 0, y4 = 0; y < blocks; ++y, y4 += 4) {
      for (let x = 0, x4 = 0; x < blocks; ++x, x4 += 4) {
        let factorIndex = 0;
        let modulationData = 0;

        for (let py = 0; py < 4; ++py) {
          const yOffset = py < 2 ? -1 : 0;
          const y0 = (y + yOffset) & blockMask;
          const y1 = (y0 + 1) & blockMask;

          for (let px = 0; px < 4; ++px) {
            const xOffset = px < 2 ? -1 : 0;
            const x0 = (x + xOffset) & blockMask;
            const x1 = (x0 + 1) & blockMask;

            p0.setBlock(x0, y0);
            p1.setBlock(x1, y0);
            p2.setBlock(x0, y1);
            p3.setBlock(x1, y1);

            const ca = p0
              .getColorRgbA()
              .mul(factors[factorIndex][0])
              .add(
                p1
                  .getColorRgbA()
                  .mul(factors[factorIndex][1])
                  .add(
                    p2
                      .getColorRgbA()
                      .mul(factors[factorIndex][2])
                      .add(p3.getColorRgbA().mul(factors[factorIndex][3]))
                  )
              );

            const cb = p0
              .getColorRgbB()
              .mul(factors[factorIndex][0])
              .add(
                p1
                  .getColorRgbB()
                  .mul(factors[factorIndex][1])
                  .add(
                    p2
                      .getColorRgbB()
                      .mul(factors[factorIndex][2])
                      .add(p3.getColorRgbB().mul(factors[factorIndex][3]))
                  )
              );

            const pi = bitmap.getPixel(x4 + px, y4 + py);
            const r = Math.trunc(pi.r);
            const g = Math.trunc(pi.g);
            const b = Math.trunc(pi.b);

            const d = cb.sub(ca);
            const p = new PvrColorRgb(r * 16, g * 16, b * 16);
            const v = p.sub(ca);

            // PVRTC uses weightings of 0, 3/8, 5/8 and 1
            // The boundaries for these are 3/16, 1/2 (=8/16), 13/16
            const projection = v.dotProd(d) * 16;
            const lengthSquared = d.dotProd(d);
            if (projection > 3 * lengthSquared) {
              modulationData++;
            }
            if (projection > 8 * lengthSquared) {
              modulationData++;
            }
            if (projection > 13 * lengthSquared) {
              modulationData++;
            }

            modulationData = PvrBitUtility.rotateRight(modulationData, 2);

            factorIndex++;
          }
        }

        packet.setBlock(x, y);
        packet.modulationData = modulationData;
      }
    }

    return outputData;
  }

  public encodeRgba4bpp(bitmap: MemoryImage): Uint8Array {
    if (bitmap.width !== bitmap.height) {
      throw new LibError('PVRTC requires a square image.');
    }

    if (!PvrBitUtility.isPowerOf2(bitmap.width)) {
      throw new LibError('PVRTC requires a power-of-two sized image.');
    }

    const size = bitmap.width;
    const blocks = Math.trunc(size / 4);
    const blockMask = blocks - 1;

    // Allocate enough data for encoding the image.
    const outputData = new Uint8Array(
      Math.trunc((bitmap.width * bitmap.height) / 2)
    );
    const packet = new PvrPacket(outputData);
    const p0 = new PvrPacket(outputData);
    const p1 = new PvrPacket(outputData);
    const p2 = new PvrPacket(outputData);
    const p3 = new PvrPacket(outputData);

    for (let y = 0, y4 = 0; y < blocks; ++y, y4 += 4) {
      for (let x = 0, x4 = 0; x < blocks; ++x, x4 += 4) {
        const cbb = PvrEncoder.calculateBoundingBoxRgba(bitmap, x4, y4);
        packet.setBlock(x, y);
        packet.usePunchthroughAlpha = false;
        packet.setColorRgbaA(cbb.min as PvrColorRgba);
        packet.setColorRgbaB(cbb.max as PvrColorRgba);
      }
    }

    const factors = PvrPacket.bilinearFactors;

    for (let y = 0, y4 = 0; y < blocks; ++y, y4 += 4) {
      for (let x = 0, x4 = 0; x < blocks; ++x, x4 += 4) {
        let factorIndex = 0;
        let modulationData = 0;

        for (let py = 0; py < 4; ++py) {
          const yOffset = py < 2 ? -1 : 0;
          const y0 = (y + yOffset) & blockMask;
          const y1 = (y0 + 1) & blockMask;

          for (let px = 0; px < 4; ++px) {
            const xOffset = px < 2 ? -1 : 0;
            const x0 = (x + xOffset) & blockMask;
            const x1 = (x0 + 1) & blockMask;

            p0.setBlock(x0, y0);
            p1.setBlock(x1, y0);
            p2.setBlock(x0, y1);
            p3.setBlock(x1, y1);

            const ca = p0
              .getColorRgbaA()
              .mul(factors[factorIndex][0])
              .add(
                p1
                  .getColorRgbaA()
                  .mul(factors[factorIndex][1])
                  .add(
                    p2
                      .getColorRgbaA()
                      .mul(factors[factorIndex][2])
                      .add(p3.getColorRgbaA().mul(factors[factorIndex][3]))
                  )
              );

            const cb = p0
              .getColorRgbaB()
              .mul(factors[factorIndex][0])
              .add(
                p1
                  .getColorRgbaB()
                  .mul(factors[factorIndex][1])
                  .add(
                    p2
                      .getColorRgbaB()
                      .mul(factors[factorIndex][2])
                      .add(p3.getColorRgbaB().mul(factors[factorIndex][3]))
                  )
              );

            const bp = bitmap.getPixel(x4 + px, y4 + py);
            const r = Math.trunc(bp.r);
            const g = Math.trunc(bp.g);
            const b = Math.trunc(bp.b);
            const a = Math.trunc(bp.a);

            const d = cb.sub(ca);
            const p = new PvrColorRgba(r * 16, g * 16, b * 16, a * 16);
            const v = p.sub(ca);

            // PVRTC uses weightings of 0, 3/8, 5/8 and 1
            // The boundaries for these are 3/16, 1/2 (=8/16), 13/16
            const projection = v.dotProd(d) * 16;
            const lengthSquared = d.dotProd(d);

            if (projection > 3 * lengthSquared) {
              modulationData++;
            }
            if (projection > 8 * lengthSquared) {
              modulationData++;
            }
            if (projection > 13 * lengthSquared) {
              modulationData++;
            }

            modulationData = PvrBitUtility.rotateRight(modulationData, 2);

            factorIndex++;
          }
        }

        packet.setBlock(x, y);
        packet.modulationData = modulationData;
      }
    }

    return outputData;
  }
}
