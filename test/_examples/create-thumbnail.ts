/** @format */

import { readFileSync, writeFileSync } from 'fs';
import { decodePng, encodeIco, Filter, Transform } from '../../src';

function createThumbnail() {
  const input = readFileSync('test.png');

  // decoding PNG bytes to MemoryImage
  const image = decodePng({
    data: input,
  });

  if (image === undefined) return;

  // making resized thumbnail
  const thumbnail = Transform.copyResize({
    image: image,
    width: 150,
  });

  // applying vignette filter
  Filter.vignette({
    image: thumbnail,
  });

  // encoding MemoryImage to ICO bytes
  const output = encodeIco({
    image: thumbnail,
  });

  writeFileSync('thumbnail.ico', output);
}

createThumbnail();
