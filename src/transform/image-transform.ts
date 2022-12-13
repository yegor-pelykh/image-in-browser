/** @format */

import { MemoryImage } from '../common/memory-image';
import { RgbChannelSet } from '../common/rgb-channel-set';
import { ImageError } from '../error/image-error';
import { Point } from '../common/point';
import { Rectangle } from '../common/rectangle';
import { FlipDirection } from './flip-direction';
import {
  CopyResizeOptionsUsingHeight,
  CopyResizeOptionsUsingWidth,
} from './copy-resize-options';
import { CopyIntoOptions } from './copy-into-options';
import { Draw } from '../draw/draw';
import { Interpolation } from '../common/interpolation';
import { Color } from '../common/color';
import { MathOperators } from '../common/math-operators';
import { ExifData } from '../exif/exif-data';

export abstract class ImageTransform {
  /**
   * Returns a copy of the **src** image, rotated by **angle** degrees.
   */
  public static copyRotate(
    src: MemoryImage,
    angle: number,
    interpolation: Interpolation = Interpolation.nearest
  ): MemoryImage {
    const nangle: number = angle % 360.0;

    // Optimized version for orthogonal angles.
    if (nangle % 90 === 0) {
      const wm1 = src.width - 1;
      const hm1 = src.height - 1;

      const iangle = Math.floor(nangle / 90.0);
      switch (iangle) {
        case 1: {
          // 90 deg.
          const dst = new MemoryImage({
            width: src.height,
            height: src.width,
            rgbChannelSet: src.rgbChannelSet,
            exifData: src.exifData,
            iccProfile: src.iccProfile,
          });
          for (let y = 0; y < dst.height; ++y) {
            for (let x = 0; x < dst.width; ++x) {
              dst.setPixel(x, y, src.getPixel(y, hm1 - x));
            }
          }
          return dst;
        }
        case 2: {
          // 180 deg.
          const dst = new MemoryImage({
            width: src.width,
            height: src.height,
            rgbChannelSet: src.rgbChannelSet,
            exifData: src.exifData,
            iccProfile: src.iccProfile,
          });
          for (let y = 0; y < dst.height; ++y) {
            for (let x = 0; x < dst.width; ++x) {
              dst.setPixel(x, y, src.getPixel(wm1 - x, hm1 - y));
            }
          }
          return dst;
        }
        case 3: {
          // 270 deg.
          const dst = new MemoryImage({
            width: src.height,
            height: src.width,
            rgbChannelSet: src.rgbChannelSet,
            exifData: src.exifData,
            iccProfile: src.iccProfile,
          });
          for (let y = 0; y < dst.height; ++y) {
            for (let x = 0; x < dst.width; ++x) {
              dst.setPixel(x, y, src.getPixel(wm1 - y, x));
            }
          }
          return dst;
        }
        default: {
          // 0 deg.
          return MemoryImage.from(src);
        }
      }
    }

    // Generic angle.
    const rad = (nangle * Math.PI) / 180.0;
    const ca = Math.cos(rad);
    const sa = Math.sin(rad);
    const ux = Math.abs(src.width * ca);
    const uy = Math.abs(src.width * sa);
    const vx = Math.abs(src.height * sa);
    const vy = Math.abs(src.height * ca);
    const w2 = 0.5 * src.width;
    const h2 = 0.5 * src.height;
    const dw2 = 0.5 * (ux + vx);
    const dh2 = 0.5 * (uy + vy);

    const dst = new MemoryImage({
      width: Math.trunc(ux + vx),
      height: Math.trunc(uy + vy),
      rgbChannelSet: RgbChannelSet.rgba,
      exifData: src.exifData,
      iccProfile: src.iccProfile,
    });

    for (let y = 0; y < dst.height; ++y) {
      for (let x = 0; x < dst.width; ++x) {
        const c = src.getPixelInterpolate(
          w2 + (x - dw2) * ca + (y - dh2) * sa,
          h2 - (x - dw2) * sa + (y - dh2) * ca,
          interpolation
        );
        dst.setPixel(x, y, c);
      }
    }

    return dst;
  }

  /**
   * If **image** has an orientation value in its exif data, this will rotate the
   * image so that it physically matches its orientation. This can be used to
   * bake the orientation of the image for image formats that don't support exif
   * data.
   */
  public static bakeOrientation(image: MemoryImage): MemoryImage {
    const bakedImage = MemoryImage.from(image);
    if (
      !image.exifData.imageIfd.hasOrientation ||
      image.exifData.imageIfd.orientation === 1
    ) {
      return bakedImage;
    }

    // Copy all exif data except for orientation
    bakedImage.exifData = ExifData.from(image.exifData);
    bakedImage.exifData.imageIfd.orientation = undefined;

    switch (image.exifData.imageIfd.orientation) {
      case 2:
        return ImageTransform.flipHorizontal(bakedImage);
      case 3:
        return ImageTransform.flip(bakedImage, FlipDirection.both);
      case 4: {
        const rotated = ImageTransform.copyRotate(bakedImage, 180);
        return ImageTransform.flipHorizontal(rotated);
      }
      case 5: {
        const rotated = ImageTransform.copyRotate(bakedImage, 90);
        return ImageTransform.flipHorizontal(rotated);
      }
      case 6:
        return ImageTransform.copyRotate(bakedImage, 90);
      case 7: {
        const rotated = ImageTransform.copyRotate(bakedImage, -90);
        return ImageTransform.flipHorizontal(rotated);
      }
      case 8:
        return ImageTransform.copyRotate(bakedImage, -90);
    }
    return bakedImage;
  }

  /**
   * Returns a resized copy of the **src** image.
   * If **height** isn't specified, then it will be determined by the aspect
   * ratio of **src** and **width**.
   * If **width** isn't specified, then it will be determined by the aspect ratio
   * of **src** and **height**.
   */
  public static copyResize(
    options: CopyResizeOptionsUsingWidth | CopyResizeOptionsUsingHeight
  ): MemoryImage {
    options.interpolation ??= Interpolation.nearest;
    options.width ??= 0;
    options.height ??= 0;

    if (options.width === 0 && options.height === 0) {
      throw new ImageError('CopyResize: wrong size');
    }

    const src = ImageTransform.bakeOrientation(options.image);

    if (options.height === 0) {
      options.height = Math.trunc(options.width * (src.height / src.width));
    }

    if (options.width === 0) {
      options.width = Math.trunc(options.height * (src.width / src.height));
    }

    if (options.width === src.width && options.height === src.height) {
      return src.clone();
    }

    const dst = new MemoryImage({
      width: options.width,
      height: options.height,
      rgbChannelSet: src.rgbChannelSet,
      exifData: src.exifData,
      iccProfile: src.iccProfile,
    });

    const dy = src.height / options.height;
    const dx = src.width / options.width;

    if (options.interpolation === Interpolation.average) {
      const sData = src.getBytes();
      const sw4 = src.width * 4;

      for (let y = 0; y < options.height; ++y) {
        const y1 = Math.trunc(y * dy);
        let y2 = Math.trunc((y + 1) * dy);
        if (y2 === y1) {
          y2++;
        }

        for (let x = 0; x < options.width; ++x) {
          const x1 = Math.trunc(x * dx);
          let x2 = Math.trunc((x + 1) * dx);
          if (x2 === x1) {
            x2++;
          }

          let r = 0;
          let g = 0;
          let b = 0;
          let a = 0;
          let np = 0;
          for (let sy = y1; sy < y2; ++sy) {
            let si = sy * sw4 + x1 * 4;
            for (let sx = x1; sx < x2; ++sx, ++np) {
              r += sData[si++];
              g += sData[si++];
              b += sData[si++];
              a += sData[si++];
            }
          }
          dst.setPixel(
            x,
            y,
            Color.getColor(
              Math.floor(r / np),
              Math.floor(g / np),
              Math.floor(b / np),
              Math.floor(a / np)
            )
          );
        }
      }
    } else if (options.interpolation === Interpolation.nearest) {
      const scaleX = new Int32Array(options.width);
      for (let x = 0; x < options.width; ++x) {
        scaleX[x] = Math.trunc(x * dx);
      }
      for (let y = 0; y < options.height; ++y) {
        const y2 = Math.trunc(y * dy);
        for (let x = 0; x < options.width; ++x) {
          dst.setPixel(x, y, src.getPixel(scaleX[x], y2));
        }
      }
    } else {
      // Copy the pixels from this image to the new image.
      for (let y = 0; y < options.height; ++y) {
        const y2 = y * dy;
        for (let x = 0; x < options.width; ++x) {
          const x2 = x * dx;
          dst.setPixel(
            x,
            y,
            src.getPixelInterpolate(x2, y2, options.interpolation)
          );
        }
      }
    }

    return dst;
  }

  /**
   * Returns a resized and square cropped copy of the **src** image of **size** size.
   */
  public static copyResizeCropSquare(
    src: MemoryImage,
    size: number
  ): MemoryImage {
    if (size <= 0) {
      throw new ImageError('Invalid size');
    }

    let height = size;
    let width = size;
    if (src.width < src.height) {
      height = Math.trunc(size * (src.height / src.width));
    } else if (src.width > src.height) {
      width = Math.trunc(size * (src.width / src.height));
    }

    const dst = new MemoryImage({
      width: size,
      height: size,
      rgbChannelSet: src.rgbChannelSet,
      exifData: src.exifData,
      iccProfile: src.iccProfile,
    });

    const dy = src.height / height;
    const dx = src.width / width;

    const xOffset = Math.trunc((width - size) / 2);
    const yOffset = Math.trunc((height - size) / 2);

    const scaleX = new Int32Array(size);
    for (let x = 0; x < size; ++x) {
      scaleX[x] = Math.trunc((x + xOffset) * dx);
    }

    for (let y = 0; y < size; ++y) {
      const y2 = Math.trunc((y + yOffset) * dy);
      for (let x = 0; x < size; ++x) {
        dst.setPixel(x, y, src.getPixel(scaleX[x], y2));
      }
    }

    return dst;
  }

  /**
   * Copies a rectangular portion of one image to another image. **dst** is the
   * destination image, **src** is the source image identifier.
   *
   * In other words, copyInto will take an rectangular area from **src** of
   * width **srcW** and height **srcH** at position (**srcX**,**srcY**) and place it
   * in a rectangular area of **dst** of width **dstW** and height **dstH** at
   * position (**dstX**,**dstY**).
   *
   * If the source and destination coordinates and width and heights differ,
   * appropriate stretching or shrinking of the image fragment will be performed.
   * The coordinates refer to the upper left corner. This function can be used to
   * copy regions within the same image (if **dst** is the same as **src**)
   * but if the regions overlap the results will be unpredictable.
   *
   * **dstX** and **dstY** represent the X and Y position where the **src** will start
   * printing.
   *
   * if **center** is true, the **src** will be centered in **dst**.
   */
  public static copyInto(options: CopyIntoOptions): MemoryImage {
    options.dstX ??= 0;
    options.dstY ??= 0;
    options.srcX ??= 0;
    options.srcY ??= 0;
    options.srcW ??= options.src.width;
    options.srcH ??= options.src.height;
    options.blend ??= true;
    options.center ??= false;

    if (options.center) {
      {
        // If src is wider than dst
        let wdt = options.dst.width - options.src.width;
        if (wdt < 0) {
          wdt = 0;
        }
        options.dstX = Math.floor(wdt / 2);
      }
      {
        // If src is higher than dst
        let hight = options.dst.height - options.src.height;
        if (hight < 0) {
          hight = 0;
        }
        options.dstY = Math.floor(hight / 2);
      }
    }

    if (options.blend) {
      for (let y = 0; y < options.srcH; ++y) {
        for (let x = 0; x < options.srcW; ++x) {
          const pos = new Point(options.dstX + x, options.dstY + y);
          Draw.drawPixel(
            options.dst,
            pos,
            options.src.getPixel(options.srcX + x, options.srcY + y)
          );
        }
      }
    } else {
      for (let y = 0; y < options.srcH; ++y) {
        for (let x = 0; x < options.srcW; ++x) {
          options.dst.setPixel(
            options.dstX + x,
            options.dstY + y,
            options.src.getPixel(options.srcX + x, options.srcY + y)
          );
        }
      }
    }

    return options.dst;
  }

  /**
   * Returns a cropped copy of **src**.
   */
  public static copyCrop(
    src: MemoryImage,
    x: number,
    y: number,
    w: number,
    h: number
  ): MemoryImage {
    // Make sure crop rectangle is within the range of the src image.
    const _x = MathOperators.clampInt(x, 0, src.width - 1);
    const _y = MathOperators.clampInt(y, 0, src.height - 1);
    let _w = w;
    if (_x + _w > src.width) {
      _w = src.width - _x;
    }
    let _h = h;
    if (_y + _h > src.height) {
      _h = src.height - _y;
    }

    const dst = new MemoryImage({
      width: _w,
      height: _h,
      rgbChannelSet: src.rgbChannelSet,
      exifData: src.exifData,
      iccProfile: src.iccProfile,
    });

    for (let yi = 0, sy = _y; yi < _h; ++yi, ++sy) {
      for (let xi = 0, sx = _x; xi < _w; ++xi, ++sx) {
        dst.setPixel(xi, yi, src.getPixel(sx, sy));
      }
    }

    return dst;
  }

  /**
   * Returns a round cropped copy of **src**.
   */
  public static copyCropCircle(
    src: MemoryImage,
    radius?: number,
    center?: Point
  ): MemoryImage {
    const defaultRadius = Math.trunc(Math.min(src.width, src.height) / 2);
    const c =
      center ??
      new Point(Math.trunc(src.width / 2), Math.trunc(src.height / 2));
    let r = radius ?? defaultRadius;

    // Make sure center point is within the range of the src image
    c.move(
      MathOperators.clampInt(c.x, 0, src.width - 1),
      MathOperators.clampInt(c.y, 0, src.height - 1)
    );
    r = r < 1 ? defaultRadius : r;

    // topLeft.x
    const tlx = Math.trunc(c.x) - r;
    // topLeft.y
    const tly = Math.trunc(c.y) - r;

    const dst = new MemoryImage({
      width: r * 2,
      height: r * 2,
      iccProfile: src.iccProfile,
    });

    for (let yi = 0, sy = tly; yi < r * 2; ++yi, ++sy) {
      for (let xi = 0, sx = tlx; xi < r * 2; ++xi, ++sx) {
        if ((xi - r) * (xi - r) + (yi - r) * (yi - r) <= r * r) {
          dst.setPixel(xi, yi, src.getPixelSafe(sx, sy));
        }
      }
    }

    return dst;
  }

  /**
   * Returns a copy of the **src** image, where the given rectangle
   * has been mapped to the full image.
   */
  public static copyRectify(
    src: MemoryImage,
    rect: Rectangle,
    toImage?: MemoryImage
  ): MemoryImage {
    const dst = toImage ?? MemoryImage.from(src);
    for (let y = 0; y < dst.height; ++y) {
      const v = y / (dst.height - 1);
      for (let x = 0; x < dst.width; ++x) {
        const u = x / (dst.width - 1);
        // bilinear interpolation
        const srcPixelCoord = new Point(rect.left, rect.top)
          .mul(1 - u)
          .mul(1 - v)
          .add(new Point(rect.right, rect.top).mul(u).mul(1 - v))
          .add(new Point(rect.left, rect.bottom).mul(1 - u).mul(v))
          .add(new Point(rect.right, rect.bottom).mul(u).mul(v));
        const srcPixel = src.getPixel(srcPixelCoord.xt, srcPixelCoord.yt);
        dst.setPixel(x, y, srcPixel);
      }
    }
    return dst;
  }

  /**
   * Flips the **src** image using the given **mode**, which can be one of:
   * **FlipDirection.horizontal**, **FlipDirection.vertical**, or **FlipDirection.both**.
   */
  public static flip(src: MemoryImage, direction: FlipDirection): MemoryImage {
    switch (direction) {
      case FlipDirection.horizontal:
        ImageTransform.flipHorizontal(src);
        break;
      case FlipDirection.vertical:
        ImageTransform.flipVertical(src);
        break;
      case FlipDirection.both:
        ImageTransform.flipVertical(src);
        ImageTransform.flipHorizontal(src);
        break;
    }
    return src;
  }

  /**
   * Flip the **src** image vertically.
   */
  public static flipVertical(src: MemoryImage): MemoryImage {
    const w = src.width;
    const h = src.height;
    const h2 = Math.floor(h / 2);
    for (let y = 0; y < h2; ++y) {
      const y1 = y * w;
      const y2 = (h - 1 - y) * w;
      for (let x = 0; x < w; ++x) {
        const t = src.getPixelByIndex(y2 + x);
        src.setPixelByIndex(y2 + x, src.getPixelByIndex(y1 + x));
        src.setPixelByIndex(y1 + x, t);
      }
    }
    return src;
  }

  /**
   * Flip the src image horizontally.
   */
  public static flipHorizontal(src: MemoryImage): MemoryImage {
    const w = src.width;
    const h = src.height;
    const w2 = Math.floor(src.width / 2);
    for (let y = 0; y < h; ++y) {
      const y1 = y * w;
      for (let x = 0; x < w2; ++x) {
        const x2 = w - 1 - x;
        const t = src.getPixelByIndex(y1 + x2);
        src.setPixelByIndex(y1 + x2, src.getPixelByIndex(y1 + x));
        src.setPixelByIndex(y1 + x, t);
      }
    }
    return src;
  }
}
