/** @format */

import { ExifData } from '../common/exif_data';
import { MemoryImage } from '../common/memory-image';
import { CopyRotateTransform } from './copy-rotate';
import { FlipTransform } from './flip';
import { FlipDirection } from './flip-direction';

export abstract class BakeOrientationTransform {
  /**
   * If [image] has an orientation value in its exif data, this will rotate the
   * image so that it physically matches its orientation. This can be used to
   * bake the orientation of the image for image formats that don't support exif
   * data.
   */
  public static bakeOrientation(image: MemoryImage): MemoryImage {
    const bakedImage = MemoryImage.from(image);
    if (!image.exifData.hasOrientation || image.exifData.orientation === 1) {
      return bakedImage;
    }

    // Remove exif data for orientation
    bakedImage.exifData.data.delete(ExifData.ORIENTATION);

    switch (image.exifData.orientation) {
      case 2:
        return FlipTransform.flipHorizontal(bakedImage);
      case 3:
        return FlipTransform.flip(bakedImage, FlipDirection.both);
      case 4: {
        const rotated = CopyRotateTransform.copyRotate(bakedImage, 180);
        return FlipTransform.flipHorizontal(rotated);
      }
      case 5: {
        const rotated = CopyRotateTransform.copyRotate(bakedImage, 90);
        return FlipTransform.flipHorizontal(rotated);
      }
      case 6:
        return CopyRotateTransform.copyRotate(bakedImage, 90);
      case 7: {
        const rotated = CopyRotateTransform.copyRotate(bakedImage, -90);
        return FlipTransform.flipHorizontal(rotated);
      }
      case 8:
        return CopyRotateTransform.copyRotate(bakedImage, -90);
    }
    return bakedImage;
  }
}
