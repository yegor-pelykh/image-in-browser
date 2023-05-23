/** @format */

import { InputBuffer } from '../common/input-buffer';
import { MemoryImage } from '../image/image';
import { Palette } from '../image/palette';
import { Decoder, DecoderDecodeOptions } from './decoder';
import { TgaImageType } from './tga/tga-image-type';
import { TgaInfo } from './tga/tga-info';

/**
 * Decode a TGA image. This only supports the 24-bit and 32-bit uncompressed format.
 */
export class TgaDecoder implements Decoder {
  private _input: InputBuffer | undefined = undefined;
  private _info: TgaInfo | undefined = undefined;

  public get numFrames(): number {
    return this._info !== undefined ? 1 : 0;
  }

  private decodeColorMap(colorMap: Uint8Array, palette: Palette): void {
    if (this._info === undefined || this._input === undefined) {
      return;
    }

    const cm = new InputBuffer({
      buffer: colorMap,
    });

    if (this._info.colorMapDepth === 16) {
      const color = this._input.readUint16();
      const r = (color & 0x7c00) >> 7;
      const g = (color & 0x3e0) >> 2;
      const b = (color & 0x1f) << 3;
      const a = (color & 0x8000) !== 0 ? 0 : 255;
      for (let i = 0; i < this._info.colorMapLength; ++i) {
        palette.setRed(i, r);
        palette.setGreen(i, g);
        palette.setBlue(i, b);
        palette.setAlpha(i, a);
      }
    } else {
      const hasAlpha = this._info.colorMapDepth === 32;
      for (let i = 0; i < this._info.colorMapLength; ++i) {
        const b = cm.readByte();
        const g = cm.readByte();
        const r = cm.readByte();
        const a = hasAlpha ? cm.readByte() : 255;
        palette.setRed(i, r);
        palette.setGreen(i, g);
        palette.setBlue(i, b);
        palette.setAlpha(i, a);
      }
    }
  }

  private decodeRle(): MemoryImage | undefined {
    if (this._info === undefined || this._input === undefined) {
      return undefined;
    }

    const bpp = this._info.pixelDepth;
    const hasAlpha = bpp === 16 || bpp === 32;
    const image = new MemoryImage({
      width: this._info.width,
      height: this._info.height,
      numChannels: hasAlpha ? 4 : 3,
      withPalette: this._info.hasColorMap,
    });

    const rleBit = 0x80;
    const rleMask = 0x7f;

    if (image.palette !== undefined && this._info.colorMap !== undefined) {
      this.decodeColorMap(this._info.colorMap, image.palette);
    }

    const w = image.width;
    const h = image.height;
    let y = h - 1;
    let x = 0;
    while (!this._input.isEOS && y >= 0) {
      const c = this._input.readByte();
      const count = (c & rleMask) + 1;

      if ((c & rleBit) !== 0) {
        if (bpp === 8) {
          const r = this._input.readByte();
          for (let i = 0; i < count; ++i) {
            image.setPixelR(x++, y, r);
            if (x >= w) {
              x = 0;
              y--;
              if (y < 0) {
                break;
              }
            }
          }
        } else if (bpp === 16) {
          const color = this._input.readUint16();
          const r = (color & 0x7c00) >> 7;
          const g = (color & 0x3e0) >> 2;
          const b = (color & 0x1f) << 3;
          const a = (color & 0x8000) !== 0 ? 0 : 255;
          for (let i = 0; i < count; ++i) {
            image.setPixelRgba(x++, y, r, g, b, a);
            if (x >= w) {
              x = 0;
              y--;
              if (y < 0) {
                break;
              }
            }
          }
        } else {
          const b = this._input.readByte();
          const g = this._input.readByte();
          const r = this._input.readByte();
          const a = hasAlpha ? this._input.readByte() : 255;
          for (let i = 0; i < count; ++i) {
            image.setPixelRgba(x++, y, r, g, b, a);
            if (x >= w) {
              x = 0;
              y--;
              if (y < 0) {
                break;
              }
            }
          }
        }
      } else {
        if (bpp === 8) {
          for (let i = 0; i < count; ++i) {
            const r = this._input.readByte();
            image.setPixelR(x++, y, r);
            if (x >= w) {
              x = 0;
              y--;
              if (y < 0) {
                break;
              }
            }
          }
        } else if (bpp === 16) {
          for (let i = 0; i < count; ++i) {
            const color = this._input.readUint16();
            const r = (color & 0x7c00) >> 7;
            const g = (color & 0x3e0) >> 2;
            const b = (color & 0x1f) << 3;
            const a = (color & 0x8000) !== 0 ? 0 : 255;
            image.setPixelRgba(x++, y, r, g, b, a);
            if (this._input.isEOS) {
              break;
            }
            if (x >= w) {
              x = 0;
              y--;
              if (y < 0) {
                break;
              }
            }
          }
        } else {
          for (let i = 0; i < count; ++i) {
            const b = this._input.readByte();
            const g = this._input.readByte();
            const r = this._input.readByte();
            const a = hasAlpha ? this._input.readByte() : 255;
            image.setPixelRgba(x++, y, r, g, b, a);
            if (x >= w) {
              x = 0;
              y--;
              if (y < 0) {
                break;
              }
            }
          }
        }
      }

      if (x >= w) {
        x = 0;
        y--;
        if (y < 0) {
          break;
        }
      }
    }

    return image;
  }

  private decodeRgb(): MemoryImage | undefined {
    if (this._info === undefined || this._input === undefined) {
      return undefined;
    }

    this._input.offset = this._info.imageOffset;

    const bpp = this._info.pixelDepth;
    const hasAlpha =
      bpp === 16 ||
      bpp === 32 ||
      (this._info.hasColorMap &&
        (this._info.colorMapDepth === 16 || this._info.colorMapDepth === 32));

    const image = new MemoryImage({
      width: this._info.width,
      height: this._info.height,
      numChannels: hasAlpha ? 4 : 3,
      withPalette: this._info.hasColorMap,
    });

    if (this._info.hasColorMap) {
      this.decodeColorMap(this._info.colorMap!, image.palette!);
    }

    if (bpp === 8) {
      for (let y = image.height - 1; y >= 0; --y) {
        for (let x = 0; x < image.width; ++x) {
          const index = this._input.readByte();
          image.setPixelR(x, y, index);
        }
      }
    } else if (bpp === 16) {
      for (let y = image.height - 1; y >= 0; --y) {
        for (let x = 0; x < image.width; ++x) {
          const color = this._input.readUint16();
          const r = (color & 0x7c00) >> 7;
          const g = (color & 0x3e0) >> 2;
          const b = (color & 0x1f) << 3;
          const a = (color & 0x8000) !== 0 ? 0 : 255;
          image.setPixelRgba(x, y, r, g, b, a);
        }
      }
    } else {
      for (let y = image.height - 1; y >= 0; --y) {
        for (let x = 0; x < image.width; ++x) {
          const b = this._input.readByte();
          const g = this._input.readByte();
          const r = this._input.readByte();
          const a = hasAlpha ? this._input.readByte() : 255;
          image.setPixelRgba(x, y, r, g, b, a);
        }
      }
    }

    return image;
  }

  /**
   * Is the given file a valid TGA image?
   */
  public isValidFile(bytes: Uint8Array): boolean {
    const input = new InputBuffer({
      buffer: bytes,
    });

    this._info = new TgaInfo();
    this._info.read(input);
    return this._info.isValid();
  }

  public startDecode(bytes: Uint8Array): TgaInfo | undefined {
    this._info = new TgaInfo();
    this._input = new InputBuffer({ buffer: bytes });

    const header = this._input.readBytes(18);
    this._info.read(header);
    if (!this._info.isValid()) {
      return undefined;
    }

    this._input.skip(this._info.idLength);

    // Decode colormap
    if (this._info.hasColorMap) {
      const size = this._info.colorMapLength * (this._info.colorMapDepth >> 3);
      this._info.colorMap = this._input.readBytes(size).toUint8Array();
    }

    this._info.imageOffset = this._input.offset;

    return this._info;
  }

  public decode(opt: DecoderDecodeOptions): MemoryImage | undefined {
    const bytes = opt.bytes;

    if (this.startDecode(bytes) === undefined) {
      return undefined;
    }

    return this.decodeFrame(opt.frameIndex ?? 0);
  }

  public decodeFrame(_frameIndex: number): MemoryImage | undefined {
    if (this._info === undefined || this._input === undefined) {
      return undefined;
    }

    if (this._info.imageType === TgaImageType.rgb) {
      return this.decodeRgb();
    } else if (
      this._info.imageType === TgaImageType.rgbRle ||
      this._info.imageType === TgaImageType.paletteRle
    ) {
      return this.decodeRle();
    } else if (this._info.imageType === TgaImageType.palette) {
      return this.decodeRgb();
    }

    return undefined;
  }
}
