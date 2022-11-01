/** @format */

import { decodeTiff, encodePng, encodeTiff } from '../src';
import { HdrToImage } from '../src/hdr/hdr-to-image';
import { TiffDecoder } from '../src/formats/tiff-decoder';
import { TestFolder, TestSection, TestHelpers } from './test-helpers';
import { TiffEntry } from '../src/formats/tiff/tiff-entry';
import { TiffEncoder } from '../src/formats/tiff-encoder';

describe('TIFF', () => {
  const resFiles = TestHelpers.listFiles(
    TestFolder.res,
    TestSection.tiff,
    '.tif'
  );

  for (let file of resFiles) {
    test(`TIFF/getInfo ${file.name}`, () => {
      const input = TestHelpers.readFromFilePath(file.path);
      const info = new TiffDecoder().startDecode(input);
      expect(info).not.toBeUndefined();
      if (info !== undefined) {
        console.log(file.name);
        console.log({
          width: info.width,
          height: info.height,
          bigEndian: info.bigEndian,
          numFrames: info.numFrames,
          images: info.images.map((i) => {
            return {
              width: i.width,
              height: i.height,
              photometricType: i.photometricType,
              compression: i.compression,
              bitsPerSample: i.bitsPerSample,
              samplesPerPixel: i.samplesPerPixel,
              imageType: i.imageType,
              tiled: i.tiled,
              tileWidth: i.tileWidth,
              tileHeight: i.tileHeight,
              predictor: i.predictor,
              colorMap: i.colorMap,
            };
          }),
        });
      }
    });
  }

  for (let file of resFiles) {
    test(`TIFF/decodeImage ${file.name}`, () => {
      const input = TestHelpers.readFromFilePath(file.path);
      const image = decodeTiff(input);
      expect(image).not.toBeUndefined();
      if (image !== undefined) {
        const outputPng = encodePng(image);
        TestHelpers.writeToFile(
          TestFolder.out,
          TestSection.tiff,
          TestHelpers.replaceFileName(file.name, (_ext) => 'png'),
          outputPng
        );

        const outputTiff = encodeTiff(image);
        TestHelpers.writeToFile(
          TestFolder.out,
          TestSection.tiff,
          file.name,
          outputTiff
        );

        const image2 = decodeTiff(outputTiff);
        expect(image2).not.toBeUndefined();
        if (image2 !== undefined) {
          expect(image2.width).toBe(image.width);
          expect(image2.height).toBe(image.height);

          const png2 = encodePng(image);
          TestHelpers.writeToFile(
            TestFolder.out,
            TestSection.tiff,
            TestHelpers.replaceFileName(
              file.name,
              (_ext) => 'png',
              (name) => `${name}-2`
            ),
            png2
          );
        }
      }
    });
  }

  test('TIFF/dtm_test', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.tiff,
      'dtm_test.tif'
    );
    const hdrImage = new TiffDecoder().decodeHdrImage(input);
    expect(hdrImage).not.toBeUndefined();
    if (hdrImage !== undefined) {
      expect(hdrImage.numberOfChannels).toBe(1);
      expect(hdrImage.red!.data[11]).toBe(-9999.0);
      const image = HdrToImage.hdrToImage(hdrImage);
      const output = encodePng(image);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.tiff,
        'dtm_test.hdr.png',
        output
      );
    }
  });

  test('TIFF/tca32int', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.tiff,
      'tca32int.tif'
    );
    const decoder = new TiffDecoder();
    const image = decoder.decodeHdrImage(input);
    expect(image).not.toBeUndefined();
    if (image !== undefined) {
      expect(image.numberOfChannels).toBe(1);
      const tags = decoder.info!.images[0].tags;
      for (let [tag, tagValue] of tags) {
        if (tagValue.type == TiffEntry.TYPE_ASCII) {
          console.log(`tca32int TAG ${tag}: ${tagValue.readString()}`);
        } else {
          console.log(`tca32int TAG ${tag}: ${tagValue.read()}`);
        }
      }

      const outputHdr = new TiffEncoder().encodeHdrImage(image);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.tiff,
        'tca32int.tif',
        outputHdr
      );

      const memImage = HdrToImage.hdrToImage(image);
      const output = encodePng(memImage);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.tiff,
        'tca32int.hdr.png',
        output
      );
    }
  });

  test('TIFF/dtm64float', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.tiff,
      'dtm64float.tif'
    );
    const decoder = new TiffDecoder();
    const image = decoder.decodeHdrImage(input);
    expect(image).not.toBeUndefined();
    if (image !== undefined) {
      expect(image.numberOfChannels).toBe(1);
      const tags = decoder.info!.images[0].tags;
      for (let [tag, tagValue] of tags) {
        if (tagValue.type == TiffEntry.TYPE_ASCII) {
          console.log(`dtm64float TAG ${tag}: ${tagValue.readString()}`);
        } else {
          console.log(`dtm64float TAG ${tag}: ${tagValue.read()}`);
        }
      }

      const outputHdr = new TiffEncoder().encodeHdrImage(image);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.tiff,
        'dtm64float.tif',
        outputHdr
      );

      const memImage = HdrToImage.hdrToImage(image);
      const output = encodePng(memImage);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.tiff,
        'dtm64float.hdr.png',
        output
      );
    }
  });

  test('TIFF/startDecode', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.tiff,
      'dtm64float.tif'
    );
    const decoder = new TiffDecoder();
    const image = decoder.startDecode(input);
    expect(image).not.toBeUndefined();
    if (image !== undefined) {
      const tags = decoder.info!.images[0].tags;
      for (let [tag, tagValue] of tags) {
        if (tagValue.type == TiffEntry.TYPE_ASCII) {
          console.log(`dtm64float TAG ${tag}: ${tagValue.readString()}`);
        } else {
          console.log(`dtm64float TAG ${tag}: ${tagValue.read()}`);
        }
      }
    }
  });

  test('TIFF/float1x32', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.tiff,
      'float1x32.tif'
    );
    const decoder = new TiffDecoder();
    const image = decoder.decodeHdrImage(input);
    expect(image).not.toBeUndefined();
    if (image !== undefined) {
      expect(image.numberOfChannels).toBe(1);

      const outputHdr = new TiffEncoder().encodeHdrImage(image);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.tiff,
        'float1x32.tif',
        outputHdr
      );

      const memImage = HdrToImage.hdrToImage(image);
      const outputPng = encodePng(memImage);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.tiff,
        'float1x32.hdr.png',
        outputPng
      );
    }
  });

  test('TIFF/float32', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.tiff,
      'float32.tif'
    );
    const decoder = new TiffDecoder();
    const image = decoder.decodeHdrImage(input);
    expect(image).not.toBeUndefined();
    if (image !== undefined) {
      expect(image.numberOfChannels).toBe(3);

      const outputHdr = new TiffEncoder().encodeHdrImage(image);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.tiff,
        'float32.tif',
        outputHdr
      );

      const memImage = HdrToImage.hdrToImage(image);
      const outputPng = encodePng(memImage);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.tiff,
        'float32.hdr.png',
        outputPng
      );
    }
  });
});
