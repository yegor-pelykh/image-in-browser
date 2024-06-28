/** @format */

import { InputBuffer } from '../common/input-buffer.js';
import { TypedArray } from '../common/typings.js';
import { MemoryImage } from '../image/image.js';
import { DecodeInfo } from './decode-info.js';
import { Decoder, DecoderDecodeOptions } from './decoder.js';
import { ImageFormat } from './image-format.js';
import { PvrAppleInfo } from './pvr/pvr-apple-info.js';
import { PvrPacket } from './pvr/pvr-packet.js';
import { Pvr2Info } from './pvr/pvr2-info.js';
import { Pvr3Info } from './pvr/pvr3-info.js';

/**
 * Ported from Jeffrey Lim's PVRTC encoder/decoder,
 * https://bitbucket.org/jthlim/pvrtccompressor
 */
export class PvrDecoder implements Decoder {
  /**
   * Size of the PVR header.
   */
  private static readonly pvrHeaderSize = 52;

  /**
   * The data to be decoded.
   */
  private _data: Uint8Array | undefined;

  /**
   * Information about the decoded data.
   */
  private _info: DecodeInfo | undefined;

  /**
   * Gets the image format.
   */
  public get format(): ImageFormat {
    return ImageFormat.pvr;
  }

  /**
   * Gets the number of frames.
   */
  public get numFrames(): number {
    return 1;
  }

  /**
   * Decodes the PVR3 header.
   * @param {Uint8Array} bytes - The byte array containing the header.
   * @returns {Pvr3Info | undefined} The decoded PVR3 information or undefined if invalid.
   */
  private decodePvr3Header(bytes: Uint8Array): Pvr3Info | undefined {
    const input = new InputBuffer({
      buffer: bytes,
    });

    const size = input.readUint32();
    if (size !== PvrDecoder.pvrHeaderSize) {
      return undefined;
    }

    const version = input.readUint32();
    const pvr3Signature = 0x03525650;
    if (version !== pvr3Signature) {
      return undefined;
    }

    const flags = input.readUint32();
    const format = input.readUint32();
    const order = [input.read(), input.read(), input.read(), input.read()];
    const colorSpace = input.readUint32();
    const channelType = input.readUint32();
    const height = input.readUint32();
    const width = input.readUint32();
    const depth = input.readUint32();
    const numSurfaces = input.readUint32();
    const numFaces = input.readUint32();
    const mipCount = input.readUint32();
    const metadataSize = input.readUint32();

    const info = new Pvr3Info({
      flags: flags,
      format: format,
      order: order,
      colorSpace: colorSpace,
      channelType: channelType,
      height: height,
      width: width,
      depth: depth,
      numSurfaces: numSurfaces,
      numFaces: numFaces,
      mipCount: mipCount,
      metadataSize: metadataSize,
    });

    return info;
  }

  /**
   * Decodes the PVR2 header.
   * @param {Uint8Array} bytes - The byte array containing the header.
   * @returns {Pvr2Info | undefined} The decoded PVR2 information or undefined if invalid.
   */
  private decodePvr2Header(bytes: Uint8Array): Pvr2Info | undefined {
    const input = new InputBuffer({
      buffer: bytes,
    });

    const size = input.readUint32();
    if (size !== PvrDecoder.pvrHeaderSize) {
      return undefined;
    }

    const height = input.readUint32();
    const width = input.readUint32();
    const mipCount = input.readUint32();
    const flags = input.readUint32();
    const texDataSize = input.readUint32();
    const bitsPerPixel = input.readUint32();
    const redMask = input.readUint32();
    const greenMask = input.readUint32();
    const blueMask = input.readUint32();
    const alphaMask = input.readUint32();
    const magic = input.readUint32();
    const numTex = input.readUint32();

    const info = new Pvr2Info({
      height: height,
      width: width,
      mipCount: mipCount,
      flags: flags,
      texDataSize: texDataSize,
      bitsPerPixel: bitsPerPixel,
      redMask: redMask,
      greenMask: greenMask,
      blueMask: blueMask,
      alphaMask: alphaMask,
      magic: magic,
      numTex: numTex,
    });

    const pvr2Signature = 0x21525650;
    if (info.magic !== pvr2Signature) {
      return undefined;
    }

    return info;
  }

  /**
   * Decodes the Apple PVRTC header.
   * @param {Uint8Array} bytes - The byte array containing the header.
   * @returns {PvrAppleInfo | undefined} The decoded Apple PVRTC information or undefined if invalid.
   */
  private decodeApplePvrtcHeader(bytes: Uint8Array): PvrAppleInfo | undefined {
    const fileSize = bytes.length;

    const input = new InputBuffer({
      buffer: bytes,
    });

    // Header
    const sz = input.readUint32();
    if (sz !== 0) {
      return undefined;
    }

    let height = input.readUint32();
    let width = input.readUint32();
    const mipCount = input.readUint32();
    const flags = input.readUint32();
    const texDataSize = input.readUint32();
    const bitsPerPixel = input.readUint32();
    const redMask = input.readUint32();
    const greenMask = input.readUint32();
    const blueMask = input.readUint32();
    const magic = input.readUint32();

    const info = new PvrAppleInfo({
      height: height,
      width: width,
      mipCount: mipCount,
      flags: flags,
      texDataSize: texDataSize,
      bitsPerPixel: bitsPerPixel,
      redMask: redMask,
      greenMask: greenMask,
      blueMask: blueMask,
      magic: magic,
    });

    const appleSignature = 0x21525650;
    if (info.magic === appleSignature) {
      return undefined;
    }

    let mode = 1;
    let res = 8;

    // this is a tough one, could be 2bpp 8x8, 4bpp 8x8
    if (fileSize === 32) {
      // assume 4bpp, 8x8
      mode = 0;
      res = 8;
    } else {
      // Detect if it's 2bpp or 4bpp
      let shift = 0;
      // 16x16
      const test2bpp = 0x40;
      // 16x16
      const test4bpp = 0x80;

      while (shift < 10) {
        const s2 = shift << 1;

        if (((test2bpp << s2) & fileSize) !== 0) {
          res = 16 << shift;
          mode = 1;
          //format = PVRTC2;
          break;
        }

        if (((test4bpp << s2) & fileSize) !== 0) {
          res = 16 << shift;
          mode = 0;
          //format = PVRTC4;
          break;
        }

        ++shift;
      }

      if (shift === 10) {
        // no mode could be found.
        return undefined;
      }
    }

    // there is no reliable way to know if it's a 2bpp or 4bpp file. Assuming
    width = res;
    height = res;
    const bpp = (mode + 1) * 2;

    if (bpp === 4) {
      // 2bpp is currently unsupported
      return undefined;
    }

    info.width = width;
    info.height = height;
    info.bitsPerPixel = bpp;

    return info;
  }

  /**
   * Decodes the PVR2 data.
   * @param {Uint8Array} data - The byte array containing the data.
   * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if invalid.
   */
  private decodePvr2(data: Uint8Array): MemoryImage | undefined {
    const length = data.length;

    const pvrTexCubemap = 1 << 12;
    const pvrPixelTypeMask = 0xff;
    const pvrTypeRgba4444 = 0x10;
    const pvrTypeRgba5551 = 0x11;
    const pvrTypeRgba8888 = 0x12;
    const pvrTypeRgb565 = 0x13;
    const pvrTypeRgb555 = 0x14;
    const pvrTypeRgb888 = 0x15;
    const pvrTypeI8 = 0x16;
    const pvrTypeAI8 = 0x17;
    const pvrTypePvrtc2 = 0x18;
    const pvrTypePvrtc4 = 0x19;

    if (length < PvrDecoder.pvrHeaderSize || this._info === undefined) {
      return undefined;
    }

    const info = this._info as Pvr2Info;

    const input = new InputBuffer({
      buffer: data,
    });

    // Header
    input.skip(PvrDecoder.pvrHeaderSize);

    let numTex = info.numTex;
    if (numTex < 1) {
      numTex = (info.flags & pvrTexCubemap) !== 0 ? 6 : 1;
    }

    if (numTex !== 1) {
      // only 1 surface supported currently
      return undefined;
    }

    if (
      (info.width * info.height * info.bitsPerPixel) / 8 >
      length - PvrDecoder.pvrHeaderSize
    ) {
      return undefined;
    }

    const pType = info.flags & pvrPixelTypeMask;

    switch (pType) {
      case pvrTypeRgba4444: {
        const image = new MemoryImage({
          width: info.width,
          height: info.height,
          numChannels: 4,
        });
        for (const p of image) {
          const v1 = input.read();
          const v2 = input.read();
          const a = (v1 & 0x0f) << 4;
          const b = v1 & 0xf0;
          const g = (v2 & 0x0f) << 4;
          const r = v2 & 0xf0;
          p.r = r;
          p.g = g;
          p.b = b;
          p.a = a;
        }
        return image;
      }
      case pvrTypeRgba5551: {
        const image = new MemoryImage({
          width: info.width,
          height: info.height,
          numChannels: 4,
        });
        for (const p of image) {
          const v = input.readUint16();
          const r = (v & 0xf800) >> 8;
          const g = (v & 0x07c0) >> 3;
          const b = (v & 0x003e) << 2;
          const a = (v & 0x0001) !== 0 ? 255 : 0;
          p.r = r;
          p.g = g;
          p.b = b;
          p.a = a;
        }
        return image;
      }
      case pvrTypeRgba8888: {
        const image = new MemoryImage({
          width: info.width,
          height: info.height,
          numChannels: 4,
        });
        for (const p of image) {
          p.r = input.read();
          p.g = input.read();
          p.b = input.read();
          p.a = input.read();
        }
        return image;
      }
      case pvrTypeRgb565: {
        const image = new MemoryImage({
          width: info.width,
          height: info.height,
        });
        for (const p of image) {
          const v = input.readUint16();
          const b = (v & 0x001f) << 3;
          const g = (v & 0x07e0) >> 3;
          const r = (v & 0xf800) >> 8;
          p.r = r;
          p.g = g;
          p.b = b;
        }
        return image;
      }
      case pvrTypeRgb555: {
        const image = new MemoryImage({
          width: info.width,
          height: info.height,
        });
        for (const p of image) {
          const v = input.readUint16();
          const r = (v & 0x001f) << 3;
          const g = (v & 0x03e0) >> 2;
          const b = (v & 0x7c00) >> 7;
          p.r = r;
          p.g = g;
          p.b = b;
        }
        return image;
      }
      case pvrTypeRgb888: {
        const image = new MemoryImage({
          width: info.width,
          height: info.height,
        });
        for (const p of image) {
          p.r = input.read();
          p.g = input.read();
          p.b = input.read();
        }
        return image;
      }
      case pvrTypeI8: {
        const image = new MemoryImage({
          width: info.width,
          height: info.height,
          numChannels: 1,
        });
        for (const p of image) {
          const i = input.read();
          p.r = i;
        }
        return image;
      }
      case pvrTypeAI8: {
        const image = new MemoryImage({
          width: info.width,
          height: info.height,
          numChannels: 4,
        });
        for (const p of image) {
          const a = input.read();
          const i = input.read();
          p.r = i;
          p.g = i;
          p.b = i;
          p.a = a;
        }
        return image;
      }
      case pvrTypePvrtc2:
        // Currently unsupported
        return undefined;
      case pvrTypePvrtc4:
        return info.alphaMask === 0
          ? this.decodeRgb4bpp(info.width, info.height, input.toUint8Array())
          : this.decodeRgba4bpp(info.width, info.height, input.toUint8Array());
    }

    // Unknown format
    return undefined;
  }

  /**
   * Decodes the PVR3 data.
   * @param {Uint8Array} data - The byte array containing the data.
   * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if invalid.
   */
  private decodePvr3(data: Uint8Array): MemoryImage | undefined {
    if (this._info instanceof Pvr3Info) {
      return undefined;
    }

    // const PVR3_PVRTC_2BPP_RGB = 0;
    // const PVR3_PVRTC_2BPP_RGBA = 1;
    const pvr3Pvrtc4bppRgb = 2;
    const pvr3Pvrtc4bppRgba = 3;
    // const PVR3_PVRTC2_2BPP = 4;
    // const PVR3_PVRTC2_4BPP = 5;
    // const PVR3_ETC1 = 6;
    // const PVR3_DXT1 = 7;
    // const PVR3_DXT2 = 8;
    // const PVR3_DXT3 = 9;
    // const PVR3_DXT4 = 10;
    // const PVR3_DXT5 = 11;
    // const PVR3_BC1 = 7;
    // const PVR3_BC2 = 9;
    // const PVR3_BC3 = 11;
    // const PVR3_BC4 = 12;
    // const PVR3_BC5 = 13;
    // const PVR3_BC6 = 14;
    // const PVR3_BC7 = 15;
    // const PVR3_UYVY = 16;
    // const PVR3_YUY2 = 17;
    // const PVR3_BW_1BPP = 18;
    // const PVR3_R9G9B9E5 = 19;
    // const PVR3_RGBG8888 = 20;
    // const PVR3_GRGB8888 = 21;
    // const PVR3_ETC2_RGB = 22;
    // const PVR3_ETC2_RGBA = 23;
    // const PVR3_ETC2_RGB_A1 = 24;
    // const PVR3_EAC_R11_U = 25;
    // const PVR3_EAC_R11_S = 26;
    // const PVR3_EAC_RG11_U = 27;
    // const PVR3_EAC_RG11_S = 28;

    const input = new InputBuffer({
      buffer: data,
    });

    // Header
    input.skip(PvrDecoder.pvrHeaderSize);

    const info = this._info as Pvr3Info;

    input.skip(info.metadataSize);

    if (info.order[0] === 0) {
      switch (info.format) {
        case pvr3Pvrtc4bppRgb:
          return this.decodeRgb4bpp(
            info.width,
            info.height,
            input.toUint8Array()
          );
        case pvr3Pvrtc4bppRgba:
          return this.decodeRgba4bpp(
            info.width,
            info.height,
            input.toUint8Array()
          );
        // case PVR3_PVRTC_2BPP_RGB:
        //   return undefined;
        // case PVR3_PVRTC_2BPP_RGBA:
        //   return undefined;
        // case PVR3_PVRTC2_2BPP:
        //   return undefined;
        // case PVR3_PVRTC2_4BPP:
        //   return undefined;
        // case PVR3_ETC1:
        //   return undefined;
        // case PVR3_DXT1:
        //   return undefined;
        // case PVR3_DXT2:
        //   return undefined;
        // case PVR3_DXT3:
        //   return undefined;
        // case PVR3_DXT4:
        //   return undefined;
        // case PVR3_DXT5:
        //   return undefined;
        // case PVR3_BC1:
        //   return undefined;
        // case PVR3_BC2:
        //   return undefined;
        // case PVR3_BC3:
        //   return undefined;
        // case PVR3_BC4:
        //   return undefined;
        // case PVR3_BC5:
        //   return undefined;
        // case PVR3_BC6:
        //   return undefined;
        // case PVR3_BC7:
        //   return undefined;
        // case PVR3_UYVY:
        //   return undefined;
        // case PVR3_YUY2:
        //   return undefined;
        // case PVR3_BW_1BPP:
        //   return undefined;
        // case PVR3_R9G9B9E5:
        //   return undefined;
        // case PVR3_RGBG8888:
        //   return undefined;
        // case PVR3_GRGB8888:
        //   return undefined;
        // case PVR3_ETC2_RGB:
        //   return undefined;
        // case PVR3_ETC2_RGBA:
        //   return undefined;
        // case PVR3_ETC2_RGB_A1:
        //   return undefined;
        // case PVR3_EAC_R11_U:
        //   return undefined;
        // case PVR3_EAC_R11_S:
        //   return undefined;
        // case PVR3_EAC_RG11_U:
        //   return undefined;
        // case PVR3_EAC_RG11_S:
        //   return undefined;
      }
    }

    return undefined;
  }

  /**
   * Counts the number of bits set to 1 in the binary representation of a number.
   * @param {number} x - The number to count bits in.
   * @returns {number} The number of bits set to 1.
   */
  private countBits(x: number): number {
    let _x = x;
    _x = (_x - ((_x >> 1) & 0x55555555)) & 0xffffffff;
    _x = ((_x & 0x33333333) + ((_x >> 2) & 0x33333333)) & 0xffffffff;
    _x = (_x + (_x >> 4)) & 0xffffffff;
    _x &= 0xf0f0f0f;
    _x = ((_x * 0x01010101) & 0xffffffff) >> 24;
    return _x;
  }

  /**
   * Decodes a 4bpp RGB image.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {TypedArray} data - The image data.
   * @returns {MemoryImage} The decoded MemoryImage.
   */
  private decodeRgb4bpp(
    width: number,
    height: number,
    data: TypedArray
  ): MemoryImage {
    const result = new MemoryImage({
      width: width,
      height: height,
    });

    const blocks = Math.trunc(width / 4);
    const blockMask = blocks - 1;

    const packet = new PvrPacket(data);
    const p0 = new PvrPacket(data);
    const p1 = new PvrPacket(data);
    const p2 = new PvrPacket(data);
    const p3 = new PvrPacket(data);
    const factors = PvrPacket.bilinearFactors;
    const weights = PvrPacket.weights;

    for (let y = 0, y4 = 0; y < blocks; ++y, y4 += 4) {
      for (let x = 0, x4 = 0; x < blocks; ++x, x4 += 4) {
        packet.setBlock(x, y);

        let mod = packet.modulationData;
        const weightIndex = packet.usePunchthroughAlpha ? 4 : 0;
        let factorIndex = 0;

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

            const w = weights[(weightIndex + mod) & 3];

            const r = (ca.r * w[0] + cb.r * w[1]) >> 7;
            const g = (ca.g * w[0] + cb.g * w[1]) >> 7;
            const b = (ca.b * w[0] + cb.b * w[1]) >> 7;
            result.setPixelRgb(px + x4, py + y4, r, g, b);

            mod >>= 2;
            factorIndex++;
          }
        }
      }
    }

    return result;
  }

  /**
   * Decodes a 4bpp RGBA image.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {TypedArray} data - The image data.
   * @returns {MemoryImage} The decoded MemoryImage.
   */
  private decodeRgba4bpp(
    width: number,
    height: number,
    data: TypedArray
  ): MemoryImage {
    const result = new MemoryImage({
      width: width,
      height: height,
      numChannels: 4,
    });

    const blocks = Math.trunc(width / 4);
    const blockMask = blocks - 1;

    const packet = new PvrPacket(data);
    const p0 = new PvrPacket(data);
    const p1 = new PvrPacket(data);
    const p2 = new PvrPacket(data);
    const p3 = new PvrPacket(data);
    const factors = PvrPacket.bilinearFactors;
    const weights = PvrPacket.weights;

    for (let y = 0, y4 = 0; y < blocks; ++y, y4 += 4) {
      for (let x = 0, x4 = 0; x < blocks; ++x, x4 += 4) {
        packet.setBlock(x, y);

        let mod = packet.modulationData;
        const weightIndex = packet.usePunchthroughAlpha ? 4 : 0;
        let factorIndex = 0;

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

            const w = weights[(weightIndex + mod) & 3];

            const r = (ca.r * w[0] + cb.r * w[1]) >> 7;
            const g = (ca.g * w[0] + cb.g * w[1]) >> 7;
            const b = (ca.b * w[0] + cb.b * w[1]) >> 7;
            const a = (ca.a * w[2] + cb.a * w[3]) >> 7;
            result.setPixelRgba(px + x4, py + y4, r, g, b, a);

            mod >>= 2;
            factorIndex++;
          }
        }
      }
    }

    return result;
  }

  /**
   * Checks if the given file is valid.
   * @param {Uint8Array} bytes - The file data.
   * @returns {boolean} True if the file is valid, false otherwise.
   */
  public isValidFile(bytes: Uint8Array): boolean {
    return this.startDecode(bytes) !== undefined;
  }

  /**
   * Starts decoding the given file.
   * @param {Uint8Array} bytes - The file data.
   * @returns {PvrAppleInfo | Pvr3Info | Pvr2Info | undefined} The decoded PvrAppleInfo, Pvr3Info, Pvr2Info, or undefined if decoding fails.
   */
  public startDecode(
    bytes: Uint8Array
  ): PvrAppleInfo | Pvr3Info | Pvr2Info | undefined {
    // Use a heuristic to detect potential apple PVRTC formats
    if (this.countBits(bytes.length) === 1) {
      // very likely to be apple PVRTC
      const info = this.decodeApplePvrtcHeader(bytes);
      if (info !== undefined) {
        this._data = bytes;
        return (this._info = info);
      }
    }

    {
      const info = this.decodePvr3Header(bytes);
      if (info !== undefined) {
        this._data = bytes;
        return (this._info = info);
      }
    }

    {
      const info = this.decodePvr2Header(bytes);
      if (info !== undefined) {
        this._data = bytes;
        return (this._info = info);
      }
    }

    return undefined;
  }

  /**
   * Decodes the PVR file into a MemoryImage.
   * @param {DecoderDecodeOptions} opt - The decoding options.
   * @param {Uint8Array} opt.bytes - The file data.
   * @param {number} [opt.frameIndex] - The frame index to decode (optional).
   * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if decoding fails.
   */
  public decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    if (this.startDecode(opt.bytes) === undefined) {
      return undefined;
    }
    return this.decodeFrame(opt.frameIndex ?? 0);
  }

  /**
   * Decodes a specific frame.
   * @param {number} _frameIndex - The index of the frame to decode.
   * @returns {MemoryImage | undefined} The decoded MemoryImage or undefined if decoding fails.
   */
  public decodeFrame(_frameIndex: number): MemoryImage | undefined {
    if (this._info === undefined || this._data === undefined) {
      return undefined;
    }

    if (this._info instanceof PvrAppleInfo) {
      return this.decodeRgba4bpp(
        this._info.width,
        this._info.height,
        this._data
      );
    } else if (this._info instanceof Pvr2Info) {
      return this.decodePvr2(this._data);
    } else if (this._info instanceof Pvr3Info) {
      return this.decodePvr3(this._data);
    }

    return undefined;
  }
}
