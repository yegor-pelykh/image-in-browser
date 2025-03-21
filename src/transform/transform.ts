/** @format */

import { LibError } from '../error/lib-error.js';
import { Point } from '../common/point.js';
import { Interpolation } from '../common/interpolation.js';
import { MathUtils } from '../common/math-utils.js';
import { ExifData } from '../exif/exif-data.js';
import { MemoryImage } from '../image/image.js';
import { ImageUtils } from '../image/image-utils.js';
import { Pixel } from '../image/pixel.js';
import { FlipDirection } from './flip-direction.js';
import { TrimSide } from './trim-side.js';
import { Rectangle } from '../common/rectangle.js';
import { Draw } from '../draw/draw.js';
import { BlendMode } from '../draw/blend-mode.js';
import { TrimMode } from './trim-mode.js';
import { ExpandCanvasPosition } from './expand-canvas-position.js';
import { Color } from '../color/color.js';

/**
 * Interface for transform options.
 */
export interface TransformOptions {
  /** The image to be transformed. */
  image: MemoryImage;
}

/**
 * Interface for copy crop circle options.
 */
export interface CopyCropCircleOptions extends TransformOptions {
  /** The radius of the circle. */
  radius?: number;
  /** The center point of the circle. */
  center?: Point;
  /** Whether to apply antialiasing. */
  antialias?: boolean;
}

/**
 * Interface for copy crop options.
 */
export interface CopyCropOptions extends TransformOptions {
  /** The rectangle to crop. */
  rect: Rectangle;
  /** The radius for rounded corners. */
  radius?: number;
  /** Whether to apply antialiasing. */
  antialias?: boolean;
}

/**
 * Interface for copy expand canvas options.
 */
export interface CopyExpandCanvasOptions extends TransformOptions {
  /** The new width of the canvas. */
  newWidth?: number;
  /** The new height of the canvas. */
  newHeight?: number;
  /** The padding around the image. */
  padding?: number;
  /** The position of the image on the new canvas. */
  position?: ExpandCanvasPosition;
  /** The background color of the new canvas. */
  backgroundColor?: Color;
  /** The image to copy to. */
  toImage?: MemoryImage;
}

/**
 * Interface for copy rectify options.
 */
export interface CopyRectifyOptions extends TransformOptions {
  /** The top-left point of the rectangle. */
  topLeft: Point;
  /** The top-right point of the rectangle. */
  topRight: Point;
  /** The bottom-left point of the rectangle. */
  bottomLeft: Point;
  /** The bottom-right point of the rectangle. */
  bottomRight: Point;
  /** The interpolation method to use. */
  interpolation?: Interpolation;
  /** The image to copy to. */
  toImage?: MemoryImage;
}

/**
 * Interface for copy resize crop square options.
 */
export interface CopyResizeCropSquareOptions extends TransformOptions {
  /** The size of the square. */
  size: number;
  /** The interpolation method to use. */
  interpolation?: Interpolation;
  /** The radius for rounded corners. */
  radius?: number;
  /** Whether to apply antialiasing. */
  antialias?: boolean;
}

/**
 * Interface for copy resize options using width.
 */
export interface CopyResizeOptionsUsingWidth extends TransformOptions {
  /** The width to resize to. */
  width: number;
  /** The height to resize to. */
  height?: number;
  /** The interpolation method to use. */
  interpolation?: Interpolation;
  /** Whether to maintain the aspect ratio. */
  maintainAspect?: boolean;
  /** The background color to use. */
  backgroundColor?: Color;
}

/**
 * Interface for copy resize options using height.
 */
export interface CopyResizeOptionsUsingHeight extends TransformOptions {
  /** The height to resize to. */
  height: number;
  /** The width to resize to. */
  width?: number;
  /** The interpolation method to use. */
  interpolation?: Interpolation;
  /** Whether to maintain the aspect ratio. */
  maintainAspect?: boolean;
  /** The background color to use. */
  backgroundColor?: Color;
}

/**
 * Interface for copy rotate options.
 */
export interface CopyRotateOptions extends TransformOptions {
  /** The angle to rotate by. */
  angle: number;
  /** The interpolation method to use. */
  interpolation?: Interpolation;
}

/**
 * Interface for flip options.
 */
export interface FlipOptions extends TransformOptions {
  /** The direction to flip. */
  direction: FlipDirection;
}

/**
 * Interface for trim options.
 */
export interface TrimOptions extends TransformOptions {
  /** The trim mode to use. */
  mode?: TrimMode;
  /** The sides to trim. */
  sides?: TrimSide;
}

/**
 * Interface for resize options.
 */
export interface ResizeOptions extends TransformOptions {
  /** The width to resize to. */
  width?: number;
  /** The height to resize to. */
  height?: number;
  /** Whether to maintain the aspect ratio. */
  maintainAspect?: boolean;
  /** The background color to use. */
  backgroundColor?: Color;
  /** The interpolation method to use. */
  interpolation?: Interpolation;
}

/**
 * Abstract class for image transformations.
 */
export abstract class Transform {
  /**
   * Rotates the image by 90 degrees.
   * @param {MemoryImage} src - The source image.
   * @returns {MemoryImage} The rotated image.
   */
  private static rotate90(src: MemoryImage): MemoryImage {
    let firstFrame: MemoryImage | undefined = undefined;
    for (const frame of src.frames) {
      const dst: MemoryImage =
        firstFrame?.addFrame() ??
        MemoryImage.fromResized(frame, frame.height, frame.width, true);
      firstFrame ??= dst;
      const hm1 = frame.height - 1;
      for (let y = 0; y < dst.height; ++y) {
        for (let x = 0; x < dst.width; ++x) {
          dst.setPixel(x, y, frame.getPixel(y, hm1 - x));
        }
      }
    }
    return firstFrame!;
  }

  /**
   * Rotates the image by 180 degrees.
   * @param {MemoryImage} src - The source image.
   * @returns {MemoryImage} The rotated image.
   */
  private static rotate180(src: MemoryImage): MemoryImage {
    let firstFrame: MemoryImage | undefined = undefined;
    for (const frame of src.frames) {
      const wm1 = frame.width - 1;
      const hm1 = frame.height - 1;
      const dst: MemoryImage =
        firstFrame?.addFrame() ?? MemoryImage.from(frame, true, true);
      firstFrame ??= dst;
      for (let y = 0; y < dst.height; ++y) {
        for (let x = 0; x < dst.width; ++x) {
          dst.setPixel(x, y, frame.getPixel(wm1 - x, hm1 - y));
        }
      }
    }
    return firstFrame!;
  }

  /**
   * Rotates the image by 270 degrees.
   * @param {MemoryImage} src - The source image.
   * @returns {MemoryImage} The rotated image.
   */
  private static rotate270(src: MemoryImage): MemoryImage {
    let firstFrame: MemoryImage | undefined = undefined;
    for (const frame of src.frames) {
      const wm1 = src.width - 1;
      const dst: MemoryImage =
        firstFrame?.addFrame() ??
        MemoryImage.fromResized(frame, frame.height, frame.width, true);
      firstFrame ??= dst;
      for (let y = 0; y < dst.height; ++y) {
        for (let x = 0; x < dst.width; ++x) {
          dst.setPixel(x, y, frame.getPixel(wm1 - y, x));
        }
      }
    }
    return firstFrame!;
  }

  /**
   * Find the crop area to be used by the trim function.
   *
   * @param {TrimOptions} opt - The trim options.
   * @param {TrimMode} opt.mode - The mode of trimming.
   * @param {TrimSide} opt.sides - The sides of the image to trim.
   * @param {MemoryImage} opt.image - The image to be trimmed.
   * @returns {Rectangle} The Rectangle. You could pass these constraints to the **copyCrop** function to crop the image.
   */
  private static findTrim(opt: TrimOptions): Rectangle {
    const mode = opt.mode ?? TrimMode.transparent;
    const sides = opt.sides ?? TrimSide.all;

    let h = opt.image.height;
    let w = opt.image.width;

    const bg =
      mode === TrimMode.topLeftColor
        ? opt.image.getPixel(0, 0)
        : mode === TrimMode.bottomRightColor
          ? opt.image.getPixel(w - 1, h - 1)
          : undefined;

    let xMin = w;
    let xMax = 0;
    let yMin: number | undefined = undefined;
    let yMax = 0;

    for (let y = 0; y < h; ++y) {
      let first = true;
      for (let x = 0; x < w; ++x) {
        const c = opt.image.getPixel(x, y);
        if (
          (mode === TrimMode.transparent && c.a !== 0) ||
          (mode !== TrimMode.transparent && (bg === undefined || !c.equals(bg)))
        ) {
          if (xMin > x) {
            xMin = x;
          }
          if (xMax < x) {
            xMax = x;
          }
          yMin ??= y;

          yMax = y;

          if (first) {
            x = xMax;
            first = false;
          }
        }
      }
    }

    // A trim wasn't found
    if (yMin === undefined) {
      return new Rectangle(0, 0, w, h);
    }

    if (!(sides & TrimSide.top)) {
      yMin = 0;
    }
    if (!(sides & TrimSide.bottom)) {
      yMax = h - 1;
    }
    if (!(sides & TrimSide.left)) {
      xMin = 0;
    }
    if (!(sides & TrimSide.right)) {
      xMax = w - 1;
    }

    // Image width in pixels
    w = 1 + xMax - xMin;
    // Image height in pixels
    h = 1 + yMax - yMin;

    return Rectangle.fromXYWH(xMin, yMin, w, h);
  }

  /**
   * If **image** has an orientation value in its exif data, this will rotate the
   * image so that it physically matches its orientation. This can be used to
   * bake the orientation of the image for image formats that don't support exif
   * data.
   * @param {TransformOptions} opt - The transform options.
   * @param {MemoryImage} opt.image - The image to be transformed.
   * @returns {MemoryImage} The image with baked orientation.
   */
  public static bakeOrientation(opt: TransformOptions): MemoryImage {
    const bakedImage = MemoryImage.from(opt.image);
    if (
      !opt.image.exifData.imageIfd.hasOrientation ||
      opt.image.exifData.imageIfd.orientation === 1
    ) {
      return bakedImage;
    }

    // Copy all exif data except for orientation
    bakedImage.exifData = ExifData.from(opt.image.exifData);
    bakedImage.exifData.imageIfd.orientation = undefined;

    switch (opt.image.exifData.imageIfd.orientation) {
      case 2:
        return Transform.flipHorizontal({
          image: bakedImage,
        });
      case 3:
        return Transform.flip({
          image: bakedImage,
          direction: FlipDirection.both,
        });
      case 4: {
        const rotated = Transform.copyRotate({
          image: bakedImage,
          angle: 180,
        });
        return Transform.flipHorizontal({
          image: rotated,
        });
      }
      case 5: {
        const rotated = Transform.copyRotate({
          image: bakedImage,
          angle: 90,
        });
        return Transform.flipHorizontal({
          image: rotated,
        });
      }
      case 6:
        return Transform.copyRotate({
          image: bakedImage,
          angle: 90,
        });
      case 7: {
        const rotated = Transform.copyRotate({
          image: bakedImage,
          angle: -90,
        });
        return Transform.flipHorizontal({
          image: rotated,
        });
      }
      case 8:
        return Transform.copyRotate({
          image: bakedImage,
          angle: -90,
        });
    }
    return bakedImage;
  }

  /**
   * Returns a cropped copy of the image.
   * @param {CopyCropOptions} opt The copy crop options.
   * @param {MemoryImage} opt.image The source image to be cropped.
   * @param {Rectangle} opt.rect The rectangle defining the crop area.
   * @param {number} [opt.radius] The radius for rounded corners (optional).
   * @param {boolean} [opt.antialias] Whether to apply antialiasing (optional).
   * @returns {MemoryImage} The cropped image.
   */
  public static copyCrop(opt: CopyCropOptions): MemoryImage {
    let image = opt.image;
    const radius = opt.radius ?? 0;
    const antialias = opt.antialias ?? true;

    // Make sure crop rectangle is within the range of the src image.
    const x = MathUtils.clampInt(opt.rect.left, 0, image.width - 1);
    const y = MathUtils.clampInt(opt.rect.top, 0, image.height - 1);

    const width =
      x + opt.rect.width > image.width ? image.width - x : opt.rect.width;
    const height =
      y + opt.rect.height > image.height ? image.height - y : opt.rect.height;

    if (radius > 0 && image.hasPalette) {
      image = image.convert({
        numChannels: image.numChannels,
      });
    }

    let firstFrame: MemoryImage | undefined = undefined;
    const numFrames = image.numFrames;
    for (let i = 0; i < numFrames; ++i) {
      const frame = image.frames[i];
      const dst: MemoryImage =
        firstFrame?.addFrame() ??
        MemoryImage.fromResized(frame, width, height, true);
      firstFrame ??= dst;

      if (radius > 0) {
        const rad = Math.round(radius);
        const rad2 = rad * rad;
        const x1 = x;
        const y1 = y;
        const x2 = x + width;
        const y2 = y + height;
        const c1x = x1 + rad - 1;
        const c1y = y1 + rad - 1;
        const c2x = x2 - rad + 1;
        const c2y = y1 + rad - 1;
        const c3x = x2 - rad + 1;
        const c3y = y2 - rad + 1;
        const c4x = x1 + rad - 1;
        const c4y = y2 - rad + 1;

        const iter = frame.getRange(x1, y1, width, height);
        let iterRes: IteratorResult<Pixel> | undefined = undefined;
        while (((iterRes = iter.next()), !iterRes.done)) {
          const p = iterRes.value;
          const px = p.x;
          const py = p.y;

          let a = 1;
          if (px < c1x && py < c1y) {
            a = ImageUtils.circleTest(p, new Point(c1x, c1y), rad2, antialias);
            if (a === 0) {
              dst.setPixelRgba(p.x - x1, p.y - y1, 0, 0, 0, 0);
              continue;
            }
          } else if (px > c2x && py < c2y) {
            a = ImageUtils.circleTest(p, new Point(c2x, c2y), rad2, antialias);
            if (a === 0) {
              dst.setPixelRgba(p.x - x1, p.y - y1, 0, 0, 0, 0);
              continue;
            }
          } else if (px > c3x && py > c3y) {
            a = ImageUtils.circleTest(p, new Point(c3x, c3y), rad2, antialias);
            if (a === 0) {
              dst.setPixelRgba(p.x - x1, p.y - y1, 0, 0, 0, 0);
              continue;
            }
          } else if (px < c4x && py > c4y) {
            a = ImageUtils.circleTest(p, new Point(c4x, c4y), rad2, antialias);
            if (a === 0) {
              dst.setPixelRgba(p.x - x1, p.y - y1, 0, 0, 0, 0);
              continue;
            }
          }

          if (a !== 1) {
            dst.getPixel(p.x - x1, p.y - y1).setRgba(p.r, p.g, p.b, p.a * a);
          } else {
            dst.setPixel(p.x - x1, p.y - y1, p);
          }
        }
      } else {
        for (const p of dst) {
          p.set(frame.getPixel(x + p.x, y + p.y));
        }
      }
    }

    return firstFrame!;
  }

  /**
   * Returns a circle cropped copy of **image**, centered at **centerX** and
   * **centerY** and with the given **radius**. If **radius** is not provided,
   * a radius filling the image will be used. If **centerX** is not provided,
   * the horizontal mid-point of the image will be used. If **centerY** is not
   * provided, the vertical mid-point of the image will be used.
   * @param {CopyCropCircleOptions} opt The copy crop circle options.
   * @param {MemoryImage} opt.image The image to be cropped.
   * @param {Point} [opt.center] The center point of the circle.
   * @param {number} [opt.center.x] The x-coordinate of the center point.
   * @param {number} [opt.center.y] The y-coordinate of the center point.
   * @param {number} [opt.radius] The radius of the circle.
   * @param {boolean} [opt.antialias] Whether to apply antialiasing.
   * @returns {MemoryImage} The circle cropped image.
   */
  public static copyCropCircle(opt: CopyCropCircleOptions): MemoryImage {
    let image = opt.image;
    let centerX = opt.center?.x ?? Math.trunc(image.width / 2);
    let centerY = opt.center?.y ?? Math.trunc(image.height / 2);
    let radius =
      opt.radius ?? Math.trunc(Math.min(image.width, image.height) / 2);
    const antialias = opt.antialias ?? true;

    // Make sure center point is within the range of the src image
    centerX = MathUtils.clamp(centerX, 0, image.width - 1);
    centerY = MathUtils.clamp(centerY, 0, image.height - 1);
    if (radius < 1) {
      radius = Math.trunc(Math.min(image.width, image.height) / 2);
    }

    // topLeft.x
    const tlx = centerX - radius;
    // topLeft.y
    const tly = centerY - radius;

    const wh = radius * 2;
    const radiusSqr = radius * radius;

    if (image.hasPalette) {
      image = image.convert({
        numChannels: 4,
      });
    }

    let firstFrame: MemoryImage | undefined = undefined;
    const numFrames = image.numFrames;
    for (let i = 0; i < numFrames; ++i) {
      const frame = image.frames[i];
      const dst: MemoryImage =
        firstFrame?.addFrame() ?? MemoryImage.fromResized(frame, wh, wh, true);
      firstFrame ??= dst;

      const bg = frame.backgroundColor ?? image.backgroundColor;
      if (bg !== undefined) {
        dst.clear(bg);
      }

      const dh = dst.height;
      const dw = radius * 2;
      for (let yi = 0, sy = tly; yi < dh; ++yi, ++sy) {
        for (let xi = 0, sx = tlx; xi < dw; ++xi, ++sx) {
          const p = frame.getPixel(sx, sy);
          const a = ImageUtils.circleTest(
            p,
            new Point(centerX, centerY),
            radiusSqr,
            antialias
          );

          if (a !== 1) {
            dst.getPixel(xi, yi).setRgba(p.r, p.g, p.b, p.a * a);
          } else {
            dst.setPixel(xi, yi, p);
          }
        }
      }
    }

    return firstFrame!;
  }

  /**
   * Returns a copy of the **image**, where the original image has been placed
   * on a new canvas of specified size at a specified location, and the rest of
   * the canvas is filled with the specified color or transparent if
   * no color is provided.
   *
   * @param {CopyExpandCanvasOptions} opt - Options for expanding the canvas.
   * @param {MemoryImage} opt.image - The original image to be expanded.
   * @param {number} [opt.newWidth] - The new width of the canvas.
   * @param {number} [opt.newHeight] - The new height of the canvas.
   * @param {number} [opt.padding] - The padding to be added around the original image.
   * @param {ExpandCanvasPosition} [opt.position] - The position where the original image will be placed on the new canvas.
   * @param {Color} [opt.backgroundColor] - The background color to fill the new canvas.
   * @param {MemoryImage} [opt.toImage] - An optional image to use as the new canvas.
   * @returns {MemoryImage} The expanded canvas with the original image placed at the specified position.
   * @throws {LibError} If the new dimensions or padding are not provided, or if both are provided.
   * @throws {LibError} If the new dimensions are smaller than the original image.
   * @throws {LibError} If the provided image does not match the new dimensions.
   * @throws {LibError} If an invalid position is provided.
   */
  public static copyExpandCanvas(opt: CopyExpandCanvasOptions): MemoryImage {
    const position = opt.position ?? ExpandCanvasPosition.center;
    let newWidth = opt.newWidth;
    let newHeight = opt.newHeight;
    const padding = opt.padding;

    // Ensure either newWidth and newHeight or padding are provided
    if (
      (newWidth === undefined || newHeight === undefined) &&
      padding === undefined
    ) {
      throw new LibError('Either new dimensions or padding must be provided.');
    } else if (
      newWidth !== undefined &&
      newHeight !== undefined &&
      padding !== undefined
    ) {
      throw new LibError('Cannot provide both new dimensions and padding.');
    }

    // If padding is provided, calculate the new dimensions
    if (padding !== undefined) {
      newWidth = opt.image.width + padding * 2;
      newHeight = opt.image.height + padding * 2;
    }

    // Convert the image if it has a palette
    const srcConverted: MemoryImage = opt.image.hasPalette
      ? opt.image.convert({
          numChannels: opt.image.numChannels,
        })
      : opt.image;

    // Check if new dimensions are larger or equal to the original image
    if (newWidth! < srcConverted.width || newHeight! < srcConverted.height) {
      throw new LibError(
        'New dimensions must be larger or equal to the original image.'
      );
    }

    // Check if the provided image has the correct dimensions
    if (
      opt.toImage !== undefined &&
      (opt.toImage.width !== newWidth || opt.toImage.height !== newHeight)
    ) {
      throw new LibError('Provided image does not match the new dimensions.');
    }

    // Create a new MemoryImage with the specified dimensions or use the provided image
    const expandedCanvas: MemoryImage =
      opt.toImage ??
      new MemoryImage({
        width: newWidth!,
        height: newHeight!,
        format: opt.image.format,
      });

    // If a background color is provided, set all pixels to that color
    // If not, leave them transparent (default behavior)
    if (opt.backgroundColor !== undefined) {
      expandedCanvas.clear(opt.backgroundColor);
    }

    // Define the position where the original image will be put on the new canvas
    let xPos: number = 0;
    let yPos: number = 0;

    switch (position) {
      case ExpandCanvasPosition.topLeft:
        xPos = 0;
        yPos = 0;
        break;
      case ExpandCanvasPosition.topCenter:
        xPos = Math.trunc((newWidth! - srcConverted.width) / 2);
        yPos = 0;
        break;
      case ExpandCanvasPosition.topRight:
        xPos = newWidth! - srcConverted.width;
        yPos = 0;
        break;
      case ExpandCanvasPosition.centerLeft:
        xPos = 0;
        yPos = Math.trunc((newHeight! - srcConverted.height) / 2);
        break;
      case ExpandCanvasPosition.center:
        xPos = Math.trunc((newWidth! - srcConverted.width) / 2);
        yPos = Math.trunc((newHeight! - srcConverted.height) / 2);
        break;
      case ExpandCanvasPosition.centerRight:
        xPos = newWidth! - srcConverted.width;
        yPos = Math.trunc((newHeight! - srcConverted.height) / 2);
        break;
      case ExpandCanvasPosition.bottomLeft:
        xPos = 0;
        yPos = newHeight! - srcConverted.height;
        break;
      case ExpandCanvasPosition.bottomCenter:
        xPos = Math.trunc((newWidth! - srcConverted.width) / 2);
        yPos = newHeight! - srcConverted.height;
        break;
      case ExpandCanvasPosition.bottomRight:
        xPos = newWidth! - srcConverted.width;
        yPos = newHeight! - srcConverted.height;
        break;
      default:
        throw new LibError('Invalid position provided.');
    }

    // Copy the original image to the new frames/canvas
    for (let i = 0; i < srcConverted.numFrames; ++i) {
      // Ensure the frame exists in the expanded canvas
      if (i >= expandedCanvas.numFrames) {
        expandedCanvas.addFrame();
      }

      const frame = srcConverted.frames[i];
      const expandedCanvasFrame = expandedCanvas.frames[i];

      for (const p of frame) {
        // Skip if the pixel position is outside the bounds of the new canvas
        if (xPos + p.x >= newWidth! || yPos + p.y >= newHeight!) {
          continue;
        }
        if (p.a === p.maxChannelValue) {
          expandedCanvasFrame.setPixel(xPos + p.x, yPos + p.y, p);
        } else {
          Draw.drawPixel({
            image: expandedCanvasFrame,
            pos: new Point(xPos + p.x, yPos + p.y),
            color: p,
          });
        }
      }
    }

    return expandedCanvas;
  }

  /**
   * Returns a copy of the image, flipped by the given direction.
   *
   * @param {FlipOptions} opt - Options for flipping the image.
   * @param {MemoryImage} opt.image - The image to be flipped.
   * @param {string} opt.direction - The direction to flip the image.
   * @returns {MemoryImage} A new MemoryImage that is a flipped copy of the original image.
   */
  public static copyFlip(opt: FlipOptions): MemoryImage {
    return Transform.flip({
      image: opt.image.clone(),
      direction: opt.direction,
    });
  }

  /**
   * Returns a copy of the **image**, where the given rectangle
   * has been mapped to the full image.
   *
   * @param {CopyRectifyOptions} opt - The options for rectifying the image.
   * @param {MemoryImage} opt.image - The source image to be rectified.
   * @param {Point} opt.topLeft - The top-left coordinate of the rectangle.
   * @param {Point} opt.topRight - The top-right coordinate of the rectangle.
   * @param {Point} opt.bottomLeft - The bottom-left coordinate of the rectangle.
   * @param {Point} opt.bottomRight - The bottom-right coordinate of the rectangle.
   * @param {MemoryImage} [opt.toImage] - The target image to copy the rectified image into.
   * @param {Interpolation} [opt.interpolation] - The interpolation method to use.
   * @returns {MemoryImage} The rectified image.
   */
  public static copyRectify(opt: CopyRectifyOptions): MemoryImage {
    const interpolation = opt.interpolation ?? Interpolation.nearest;

    // You can't interpolate index pixels, so we need to convert the image
    // to a non-palette image if non-nearest interpolation is used.
    const src =
      interpolation !== Interpolation.nearest && opt.image.hasPalette
        ? opt.image.convert({
            numChannels: opt.image.numChannels,
          })
        : opt.image;

    let firstFrame: MemoryImage | undefined = undefined;
    for (const frame of src.frames) {
      const dst: MemoryImage =
        firstFrame?.addFrame() ?? opt.toImage ?? MemoryImage.from(frame, true);
      firstFrame ??= dst;
      for (let y = 0; y < dst.height; ++y) {
        const v = y / (dst.height - 1);
        for (let x = 0; x < dst.width; ++x) {
          const u = x / (dst.width - 1);
          // bilinear interpolation
          const srcPixelCoord = opt.topLeft
            .mul((1 - u) * (1 - v))
            .add(
              opt.topRight
                .mul(u * (1 - v))
                .add(
                  opt.bottomLeft
                    .mul((1 - u) * v)
                    .add(opt.bottomRight.mul(u * v))
                )
            );

          const srcPixel =
            interpolation === Interpolation.nearest
              ? frame.getPixel(
                  Math.trunc(srcPixelCoord.x),
                  Math.trunc(srcPixelCoord.y)
                )
              : frame.getPixelInterpolate(
                  srcPixelCoord.x,
                  srcPixelCoord.y,
                  interpolation
                );

          dst.setPixel(x, y, srcPixel);
        }
      }
    }

    return firstFrame!;
  }

  /**
   * Returns a resized copy of the **image**.
   *
   * If **height** isn't specified, then it will be determined by the aspect
   * ratio of **image** and **width**.
   *
   * If **width** isn't specified, then it will be determined by the aspect ratio
   * of **image** and **height**.
   *
   * @param {CopyResizeOptionsUsingWidth | CopyResizeOptionsUsingHeight} opt - The options for resizing the image.
   * @param {MemoryImage} opt.image - The image to be resized.
   * @param {number} [opt.width] - The width to resize the image to.
   * @param {number} [opt.height] - The height to resize the image to.
   * @param {Interpolation} [opt.interpolation] - Optional interpolation method to use.
   * @param {boolean} [opt.maintainAspect] - Optional flag to maintain aspect ratio.
   * @param {Color} [opt.backgroundColor] - Optional background color to use if maintaining aspect ratio.
   * @returns {MemoryImage} A resized copy of the image.
   * @throws {LibError} If both width and height are undefined.
   */
  public static copyResize(
    opt: CopyResizeOptionsUsingWidth | CopyResizeOptionsUsingHeight
  ): MemoryImage {
    let src = opt.image;
    let interpolation = opt.interpolation ?? Interpolation.nearest;
    let maintainAspect = opt.maintainAspect ?? false;

    if (opt.width === undefined && opt.height === undefined) {
      throw new LibError('Invalid size. Please specify the width or height.');
    }

    // You can't interpolate index pixels
    if (src.hasPalette) {
      interpolation = Interpolation.nearest;
    }

    if (
      src.exifData.imageIfd.hasOrientation &&
      src.exifData.imageIfd.orientation !== 1
    ) {
      src = Transform.bakeOrientation({
        image: src,
      });
    }

    let x1 = 0;
    let y1 = 0;
    let x2 = 0;
    let y2 = 0;

    // this block sets [width] and [height] if undefined or negative.
    if (
      opt.width !== undefined &&
      opt.height !== undefined &&
      maintainAspect === true
    ) {
      x1 = 0;
      x2 = opt.width;
      const srcAspect = src.height / src.width;
      const h = Math.trunc(opt.width * srcAspect);
      const dy = Math.trunc((opt.height - h) / 2);
      y1 = dy;
      y2 = y1 + h;
      if (y1 < 0 || y2 > opt.height) {
        y1 = 0;
        y2 = opt.height;
        const srcAspect = src.width / src.height;
        const w = Math.trunc(opt.height * srcAspect);
        const dx = Math.trunc((opt.width - w) / 2);
        x1 = dx;
        x2 = x1 + w;
      }
    } else {
      maintainAspect = false;
    }

    const height =
      opt.height === undefined || opt.height <= 0
        ? Math.round(opt.width! * (src.height / src.width))
        : opt.height;

    const width =
      opt.width === undefined || opt.width <= 0
        ? Math.round(opt.height! * (src.width / src.height))
        : opt.width;

    const w = maintainAspect! ? x2 - x1 : width;
    const h = maintainAspect ? y2 - y1 : height;

    if (!maintainAspect) {
      x1 = 0;
      x2 = width;
      y1 = 0;
      y2 = height;
    }

    if (width === src.width && height === src.height) {
      return src.clone();
    }

    const scaleX = new Int32Array(w);
    const dx = src.width / w;
    for (let x = 0; x < w; ++x) {
      scaleX[x] = Math.trunc(x * dx);
    }

    let firstFrame: MemoryImage | undefined = undefined;
    const numFrames = src.numFrames;
    for (let i = 0; i < numFrames; ++i) {
      const frame = src.frames[i];
      const dst = MemoryImage.fromResized(frame, width, height, true);
      firstFrame?.addFrame(dst);
      firstFrame ??= dst;

      const dy = frame.height / h;
      const dx = frame.width / w;

      if (maintainAspect && opt.backgroundColor !== undefined) {
        dst.clear(opt.backgroundColor);
      }

      if (interpolation === Interpolation.average) {
        for (let y = 0; y < h; ++y) {
          const ay1 = Math.trunc(y * dy);
          let ay2 = Math.trunc((y + 1) * dy);
          if (ay2 === ay1) {
            ay2++;
          }

          for (let x = 0; x < w; ++x) {
            const ax1 = Math.trunc(x * dx);
            let ax2 = Math.trunc((x + 1) * dx);
            if (ax2 === ax1) {
              ax2++;
            }

            let r = 0;
            let g = 0;
            let b = 0;
            let a = 0;
            let np = 0;
            for (let sy = ay1; sy < ay2; ++sy) {
              for (let sx = ax1; sx < ax2; ++sx, ++np) {
                const s = frame.getPixel(sx, sy);
                r += s.r;
                g += s.g;
                b += s.b;
                a += s.a;
              }
            }
            dst.setPixel(
              x1 + x,
              y1 + y,
              dst.getColor(r / np, g / np, b / np, a / np)
            );
          }
        }
      } else if (interpolation === Interpolation.nearest) {
        if (frame.hasPalette) {
          for (let y = 0; y < h; ++y) {
            const y2 = Math.trunc(y * dy);
            for (let x = 0; x < w; ++x) {
              dst.setPixelIndex(
                x1 + x,
                y1 + y,
                frame.getPixelIndex(scaleX[x], y2)
              );
            }
          }
        } else {
          for (let y = 0; y < h; ++y) {
            const y2 = Math.trunc(y * dy);
            for (let x = 0; x < w; ++x) {
              dst.setPixel(x1 + x, y1 + y, frame.getPixel(scaleX[x], y2));
            }
          }
        }
      } else {
        // Copy the pixels from this image to the new image.
        for (let y = 0; y < h; ++y) {
          const sy2 = y * dy;
          for (let x = 0; x < w; ++x) {
            const sx2 = x * dx;
            dst.setPixel(
              x,
              y,
              frame.getPixelInterpolate(x1 + sx2, y1 + sy2, interpolation)
            );
          }
        }
      }
    }

    return firstFrame!;
  }

  /**
   * Returns a resized and square cropped copy of the image of size size.
   *
   * @param {CopyResizeCropSquareOptions} opt - The options for resizing and cropping.
   * @param {MemoryImage} opt.image - The source image to be resized and cropped.
   * @param {number} opt.size - The size to which the image should be resized and cropped.
   * @param {Interpolation} [opt.interpolation] - The interpolation method to be used.
   * @param {number} [opt.radius] - The radius for rounded corners.
   * @param {boolean} [opt.antialias] - Whether to apply antialiasing.
   * @returns {MemoryImage} The resized and cropped image.
   * @throws {LibError} If the size is less than or equal to 0.
   */
  public static copyResizeCropSquare(
    opt: CopyResizeCropSquareOptions
  ): MemoryImage {
    const src = opt.image;
    let interpolation = opt.interpolation ?? Interpolation.nearest;
    const radius = opt.radius ?? 0;
    const antialias = opt.antialias ?? true;

    if (opt.size <= 0) {
      throw new LibError('Invalid size.');
    }

    // You can't interpolate index pixels
    if (src.hasPalette) {
      interpolation = Interpolation.nearest;
    }

    let height = opt.size;
    let width = opt.size;
    if (src.width < src.height) {
      height = Math.trunc(opt.size * (src.height / src.width));
    } else if (src.width > src.height) {
      width = Math.trunc(opt.size * (src.width / src.height));
    }

    const dy = src.height / height;
    const dx = src.width / width;

    const xOffset = Math.trunc((width - opt.size) / 2);
    const yOffset = Math.trunc((height - opt.size) / 2);

    const scaleX =
      interpolation === Interpolation.nearest
        ? new Int32Array(opt.size)
        : undefined;

    if (scaleX !== undefined) {
      for (let x = 0; x < opt.size; ++x) {
        scaleX[x] = Math.trunc((x + xOffset) * dx);
      }
    }

    let firstFrame: MemoryImage | undefined = undefined;
    for (const frame of src.frames) {
      const dst: MemoryImage =
        firstFrame?.addFrame() ??
        MemoryImage.fromResized(frame, opt.size, opt.size, true);
      firstFrame ??= dst;

      // Rounded corners
      if (radius > 0) {
        const rad = Math.round(radius);
        const rad2 = rad * rad;
        const x1 = 0;
        const y1 = 0;
        const x2 = opt.size - 1;
        const y2 = opt.size - 1;
        const c1x = x1 + rad - 1;
        const c1y = y1 + rad - 1;
        const c2x = x2 - rad + 1;
        const c2y = y1 + rad - 1;
        const c3x = x2 - rad + 1;
        const c3y = y2 - rad + 1;
        const c4x = x1 + rad - 1;
        const c4y = y2 - rad + 1;

        const iter = dst.getRange(x1, y1, width, height);
        let iterRes: IteratorResult<Pixel> | undefined = undefined;
        while (((iterRes = iter.next()), !iterRes.done)) {
          const p = iterRes.value;
          const px = p.x;
          const py = p.y;

          let a = 1;
          if (px < c1x && py < c1y) {
            a = ImageUtils.circleTest(p, new Point(c1x, c1y), rad2, antialias);
            if (a === 0) {
              p.setRgba(0, 0, 0, 0);
              continue;
            }
          } else if (px > c2x && py < c2y) {
            a = ImageUtils.circleTest(p, new Point(c2x, c2y), rad2, antialias);
            if (a === 0) {
              p.setRgba(0, 0, 0, 0);
              continue;
            }
          } else if (px > c3x && py > c3y) {
            a = ImageUtils.circleTest(p, new Point(c3x, c3y), rad2, antialias);
            if (a === 0) {
              p.setRgba(0, 0, 0, 0);
              continue;
            }
          } else if (px < c4x && py > c4y) {
            a = ImageUtils.circleTest(p, new Point(c4x, c4y), rad2, antialias);
            if (a === 0) {
              p.setRgba(0, 0, 0, 0);
              continue;
            }
          }

          if (interpolation === Interpolation.nearest) {
            const sy = Math.trunc((p.y + yOffset) * dy);
            const sp = frame.getPixel(scaleX![p.x], sy);
            p.setRgba(sp.r, sp.g, sp.b, sp.a * a);
          } else {
            const x = p.x * dx;
            const y = p.y * dy;
            const sp = frame.getPixelInterpolate(x, y, interpolation);
            const spa = sp.a * a;
            p.setRgba(sp.r, sp.g, sp.b, spa);
          }
        }

        return dst;
      }

      if (interpolation === Interpolation.nearest) {
        for (let y = 0; y < opt.size; ++y) {
          const y2 = Math.trunc((y + yOffset) * dy);
          for (let x = 0; x < opt.size; ++x) {
            dst.setPixel(x, y, frame.getPixel(scaleX![x], y2));
          }
        }
      } else {
        for (const p of dst) {
          const x = p.x * dx;
          const y = p.y * dy;
          p.set(frame.getPixelInterpolate(x, y, interpolation));
        }
      }
    }

    return firstFrame!;
  }

  /**
   * Returns a copy of the image, rotated by the specified angle in degrees.
   * @param {CopyRotateOptions} opt - The options for the rotation.
   * @param {MemoryImage} opt.image - The image to be rotated.
   * @param {number} opt.angle - The angle in degrees to rotate the image.
   * @param {Interpolation} [opt.interpolation] - The interpolation method to use for rotation.
   * @returns {MemoryImage} A new MemoryImage instance with the rotated image.
   */
  public static copyRotate(opt: CopyRotateOptions): MemoryImage {
    const src = opt.image;
    let interpolation = opt.interpolation ?? Interpolation.nearest;

    const nAngle = opt.angle % 360;

    // You can't interpolate index pixels
    if (src.hasPalette) {
      interpolation = Interpolation.nearest;
    }

    // Optimized version for orthogonal angles.
    if (nAngle % 90 === 0) {
      const iAngle = Math.trunc(nAngle / 90);
      switch (iAngle) {
        case 1:
          // 90 deg.
          return Transform.rotate90(src);
        case 2:
          // 180 deg.
          return Transform.rotate180(src);
        case 3:
          // 270 deg.
          return Transform.rotate270(src);
        default:
          // 0 deg.
          return MemoryImage.from(src);
      }
    }

    // Generic angle.
    const rad = (nAngle * Math.PI) / 180;
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

    let firstFrame: MemoryImage | undefined = undefined;
    const numFrames = src.numFrames;
    for (let i = 0; i < numFrames; ++i) {
      const frame = src.frames[i];
      const dst: MemoryImage =
        firstFrame?.addFrame() ??
        MemoryImage.fromResized(
          src,
          Math.trunc(ux + vx),
          Math.trunc(uy + vy),
          true
        );
      firstFrame ??= dst;
      const bg = frame.backgroundColor ?? src.backgroundColor;
      if (bg !== undefined) {
        dst.clear(bg);
      }

      for (const p of dst) {
        const x = p.x;
        const y = p.y;
        const x2 = w2 + (x - dw2) * ca + (y - dh2) * sa;
        const y2 = h2 - (x - dw2) * sa + (y - dh2) * ca;
        if (frame.isBoundsSafe(x2, y2)) {
          const c = frame.getPixelInterpolate(x2, y2, interpolation);
          dst.setPixel(x, y, c);
        }
      }
    }

    return firstFrame!;
  }

  /**
   * Flips the image using the given direction.
   *
   * @param {FlipOptions} opt - The options for the flip operation.
   * @param {MemoryImage} opt.image - The image to be flipped.
   * @param {FlipDirection} opt.direction - The direction in which to flip the image. Can be one of: FlipDirection.horizontal, FlipDirection.vertical, or FlipDirection.both.
   * @returns {MemoryImage} The flipped image.
   */
  public static flip(opt: FlipOptions): MemoryImage {
    switch (opt.direction) {
      case FlipDirection.horizontal:
        Transform.flipHorizontal(opt);
        break;
      case FlipDirection.vertical:
        Transform.flipVertical(opt);
        break;
      case FlipDirection.both:
        Transform.flipHorizontalVertical(opt);
        break;
    }

    return opt.image;
  }

  /**
   * Flips the image vertically.
   *
   * @param {TransformOptions} opt - The options for transforming the image.
   * @param {MemoryImage} opt.image - The image to be transformed.
   * @returns {MemoryImage} The transformed image.
   */
  public static flipVertical(opt: TransformOptions): MemoryImage {
    const numFrames = opt.image.numFrames;
    for (let i = 0; i < numFrames; ++i) {
      const frame = opt.image.frames[i];
      const w = frame.width;
      const h = frame.height;
      const h2 = Math.trunc(h / 2);
      if (opt.image.hasPalette) {
        for (let y = 0, y2 = h - 1; y < h2; ++y, --y2) {
          for (let x = 0; x < w; ++x) {
            const p1 = frame.getPixel(x, y);
            const p2 = frame.getPixel(x, y2);
            const t = p1.index;
            p1.index = p2.index;
            p2.index = t;
          }
        }
      } else {
        for (let y = 0, y2 = h - 1; y < h2; ++y, --y2) {
          for (let x = 0; x < w; ++x) {
            const p1 = frame.getPixel(x, y);
            const p2 = frame.getPixel(x, y2);
            let t = p1.r;
            p1.r = p2.r;
            p2.r = t;

            t = p1.g;
            p1.g = p2.g;
            p2.g = t;

            t = p1.b;
            p1.b = p2.b;
            p2.b = t;

            t = p1.a;
            p1.a = p2.a;
            p2.a = t;
          }
        }
      }
    }
    return opt.image;
  }

  /**
   * Flips the image horizontally.
   *
   * @param {TransformOptions} opt - The options for the transformation.
   * @param {MemoryImage} opt.image - The image to be flipped.
   * @returns {MemoryImage} The flipped image.
   */
  public static flipHorizontal(opt: TransformOptions): MemoryImage {
    const numFrames = opt.image.numFrames;
    for (let i = 0; i < numFrames; ++i) {
      const frame = opt.image.frames[i];
      const w = frame.width;
      const h = frame.height;
      const w2 = Math.trunc(w / 2);
      if (opt.image.hasPalette) {
        for (let y = 0; y < h; ++y) {
          for (let x = 0, x2 = w - 1; x < w2; ++x, --x2) {
            const p1 = frame.getPixel(x, y);
            const p2 = frame.getPixel(x2, y);
            const t = p1.index;
            p1.index = p2.index;
            p2.index = t;
          }
        }
      } else {
        for (let y = 0; y < h; ++y) {
          for (let x = 0, x2 = w - 1; x < w2; ++x, --x2) {
            const p1 = frame.getPixel(x, y);
            const p2 = frame.getPixel(x2, y);
            let t = p1.r;
            p1.r = p2.r;
            p2.r = t;

            t = p1.g;
            p1.g = p2.g;
            p2.g = t;

            t = p1.b;
            p1.b = p2.b;
            p2.b = t;

            t = p1.a;
            p1.a = p2.a;
            p2.a = t;
          }
        }
      }
    }
    return opt.image;
  }

  /**
   * Flip the image horizontally and vertically.
   *
   * @param {TransformOptions} opt - The transformation options.
   * @param {MemoryImage} opt.image - The image to be transformed.
   * @returns {MemoryImage} The transformed image.
   */
  public static flipHorizontalVertical(opt: TransformOptions): MemoryImage {
    const numFrames = opt.image.numFrames;
    for (let i = 0; i < numFrames; ++i) {
      const frame = opt.image.frames[i];
      const w = frame.width;
      const h = frame.height;
      const h2 = Math.trunc(h / 2);
      if (frame.hasPalette) {
        for (let y = 0, y2 = h - 1; y < h2; ++y, --y2) {
          for (let x = 0, x2 = w - 1; x < w; ++x, --x2) {
            const p1 = frame.getPixel(x, y);
            const p2 = frame.getPixel(x2, y2);
            const t = p1.index;
            p1.index = p2.index;
            p2.index = t;
          }
        }
      } else {
        for (let y = 0, y2 = h - 1; y < h2; ++y, --y2) {
          for (let x = 0, x2 = w - 1; x < w; ++x, --x2) {
            const p1 = frame.getPixel(x, y);
            const p2 = frame.getPixel(x2, y2);
            let t = p1.r;
            p1.r = p2.r;
            p2.r = t;

            t = p1.g;
            p1.g = p2.g;
            p2.g = t;

            t = p1.b;
            p1.b = p2.b;
            p2.b = t;

            t = p1.a;
            p1.a = p2.a;
            p2.a = t;
          }
        }
      }
    }
    return opt.image;
  }

  /**
   * Automatically crops the image by finding the corners of the image that
   * meet the **mode** criteria (not transparent or a different color).
   *
   * **mode** can be either _TrimMode.transparent_, _TrimMode.topLeftColor_ or
   * _TrimMode.bottomRightColor_.
   *
   * **sides** can be used to control which sides of the image get trimmed,
   * and can be any combination of _TrimSide.top_, _TrimSide.bottom_, _TrimSide.left_,
   * and _TrimSide.right_.
   *
   * @param {TrimOptions} opt - The options for trimming the image.
   * @param {MemoryImage} opt.image - The image to be trimmed.
   * @param {TrimMode} opt.mode - The mode to use for trimming.
   * @param {TrimSide} opt.sides - The sides of the image to trim.
   * @returns {MemoryImage} The trimmed image.
   */
  public static trim(opt: TrimOptions): MemoryImage {
    const mode = opt.mode ?? TrimMode.topLeftColor;
    const sides = opt.sides ?? TrimSide.all;

    if (mode === TrimMode.transparent && opt.image.numChannels === 3) {
      return MemoryImage.from(opt.image);
    }

    const crop = Transform.findTrim({
      image: opt.image,
      mode: mode,
      sides: sides,
    });

    let firstFrame: MemoryImage | undefined = undefined;
    for (const frame of opt.image.frames) {
      const dst: MemoryImage =
        firstFrame?.addFrame() ??
        MemoryImage.fromResized(frame, crop.width, crop.height, true);
      firstFrame ??= dst;

      Draw.compositeImage({
        dst: dst,
        src: opt.image,
        srcX: crop.left,
        srcY: crop.top,
        srcW: crop.width,
        srcH: crop.height,
        blend: BlendMode.direct,
      });
    }

    return firstFrame!;
  }

  /**
   * Resizes the image to the specified width and height.
   *
   * @param {ResizeOptions} opt - The options for resizing the image.
   * @param {MemoryImage} opt.image - The image to be resized.
   * @param {number} opt.width - The desired width of the resized image.
   * @param {number} opt.height - The desired height of the resized image.
   * @param {boolean} [opt.maintainAspect] - Whether to maintain the aspect ratio.
   * @param {Interpolation} [opt.interpolation] - The interpolation method to use.
   * @param {Color} [opt.backgroundColor] - The background color to use if maintaining aspect ratio.
   * @returns {MemoryImage} The resized image.
   * @throws {LibError} If both width and height are undefined.
   */
  public static resize(opt: ResizeOptions): MemoryImage {
    let src = opt.image;
    let width = opt.width;
    let height = opt.height;
    let maintainAspect = opt.maintainAspect;
    let interpolation = opt.interpolation ?? Interpolation.nearest;

    if (width === undefined && height === undefined) {
      throw new LibError('Invalid size');
    }

    // You can't interpolate index pixels
    if (src.hasPalette) {
      interpolation = Interpolation.nearest;
    }

    if (
      src.exifData.imageIfd.hasOrientation &&
      src.exifData.imageIfd.orientation !== 1
    ) {
      src = Transform.bakeOrientation({
        image: src,
      });
    }

    let x1 = 0;
    let y1 = 0;
    let x2 = 0;
    let y2 = 0;

    // this block sets [width] and [height] if null or negative.
    if (
      width !== undefined &&
      height !== undefined &&
      maintainAspect === true
    ) {
      x1 = 0;
      x2 = width;
      const srcAspect = src.height / src.width;
      const h = Math.trunc(width * srcAspect);
      const dy = Math.trunc((height - h) / 2);
      y1 = dy;
      y2 = y1 + h;
      if (y1 < 0 || y2 > height) {
        y1 = 0;
        y2 = height;
        const srcAspect = src.width / src.height;
        const w = Math.trunc(height * srcAspect);
        const dx = Math.trunc((width - w) / 2);
        x1 = dx;
        x2 = x1 + w;
      }
    } else {
      maintainAspect = false;
    }

    if (height === undefined || height <= 0) {
      height = Math.round(width! * (src.height / src.width));
    }
    if (width === undefined || width <= 0) {
      width = Math.round(height * (src.width / src.height));
    }

    const w = maintainAspect ? x2 - x1 : width;
    const h = maintainAspect ? y2 - y1 : height;

    if (!maintainAspect) {
      x1 = 0;
      x2 = width;
      y1 = 0;
      y2 = height;
    }

    if (width === src.width && height === src.height) {
      return src;
    }

    if (width * height > src.width * src.height) {
      return Transform.copyResize({
        image: src,
        width: width,
        height: height,
        maintainAspect: maintainAspect,
        backgroundColor: opt.backgroundColor,
        interpolation: interpolation,
      });
    }

    const scaleX = new Int32Array(w);
    const dx = src.width / w;
    for (let x = 0; x < w; ++x) {
      scaleX[x] = Math.trunc(x * dx);
    }

    const origWidth = src.width;
    const origHeight = src.height;

    const numFrames = src.numFrames;
    for (let i = 0; i < numFrames; ++i) {
      const frame = src.frames[i];
      const dst = frame;

      const dy = frame.height / h;
      const dx = frame.width / w;

      if (maintainAspect && opt.backgroundColor !== undefined) {
        dst.clear(opt.backgroundColor);
      }

      if (interpolation === Interpolation.average) {
        for (let y = 0; y < h; ++y) {
          const ay1 = Math.trunc(y * dy);
          let ay2 = Math.trunc((y + 1) * dy);
          if (ay2 === ay1) {
            ay2++;
          }

          for (let x = 0; x < w; ++x) {
            const ax1 = Math.trunc(x * dx);
            let ax2 = Math.trunc((x + 1) * dx);
            if (ax2 === ax1) {
              ax2++;
            }

            let r: number = 0;
            let g: number = 0;
            let b: number = 0;
            let a: number = 0;
            let np: number = 0;
            for (let sy = ay1; sy < ay2; ++sy) {
              for (let sx = ax1; sx < ax2; ++sx, ++np) {
                const s = frame.getPixel(sx, sy);
                r += s.r;
                g += s.g;
                b += s.b;
                a += s.a;
              }
            }
            const c = dst.getColor(r / np, g / np, b / np, a / np);

            dst.data!.width = width;
            dst.data!.height = height;
            dst.setPixel(x1 + x, y1 + y, c);
            dst.data!.width = origWidth;
            dst.data!.height = origHeight;
          }
        }
      } else if (interpolation === Interpolation.nearest) {
        if (frame.hasPalette) {
          for (let y = 0; y < h; ++y) {
            const y2 = Math.trunc(y * dy);
            for (let x = 0; x < w; ++x) {
              const p = frame.getPixelIndex(scaleX[x], y2);
              dst.data!.width = width;
              dst.data!.height = height;
              dst.setPixelIndex(x1 + x, y1 + y, p);
              dst.data!.width = origWidth;
              dst.data!.height = origHeight;
            }
          }
        } else {
          for (let y = 0; y < h; ++y) {
            const y2 = Math.trunc(y * dy);
            for (let x = 0; x < w; ++x) {
              const p = frame.getPixel(scaleX[x], y2);
              dst.data!.width = width;
              dst.data!.height = height;
              dst.setPixel(x1 + x, y1 + y, p);
              dst.data!.width = origWidth;
              dst.data!.height = origHeight;
            }
          }
        }
      } else {
        // Copy the pixels from this image to the new image.
        for (let y = 0; y < h; ++y) {
          const sy2 = y * dy;
          for (let x = 0; x < w; ++x) {
            const sx2 = x * dx;
            const p = frame.getPixelInterpolate(
              x1 + sx2,
              y1 + sy2,
              interpolation
            );
            dst.data!.width = width;
            dst.data!.height = height;
            dst.setPixel(x, y, p);
            dst.data!.width = origWidth;
            dst.data!.height = origHeight;
          }
        }
      }

      dst.data!.width = width;
      dst.data!.height = height;
    }

    return src;
  }
}
