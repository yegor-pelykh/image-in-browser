#!/usr/bin/env node
/** @format */
/* eslint-disable no-console */

// Regenerates the donation QR codes and keeps DONATE.md/README.md in sync
// with the addresses in docs/donate/index.html.
//
// Run from anywhere: npm run donate:qr
//
// The COINS block in index.html is the single source of truth for addresses
// and wallet URIs. This script has no platform-specific code and works on
// Windows, Linux, and macOS.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = join(root, 'docs', 'donate');
const pagePath = join(docsDir, 'index.html');

const html = await readFile(pagePath, 'utf8');
const match = html.match(
  /\/\* COINS:START \*\/\s*const COINS = (\[[\s\S]*?\]);\s*\/\* COINS:END \*\//
);

if (!match) {
  throw new Error('Could not find the COINS block in docs/donate/index.html.');
}

const coins = JSON.parse(match[1]);

if (!Array.isArray(coins) || coins.length === 0) {
  throw new Error('The COINS block is empty or is not an array.');
}

const missingAddresses = coins.filter(
  (coin) => !coin.address || coin.address.startsWith('YOUR_')
);
const placeholderUris = coins.filter(
  (coin) => coin.uri && coin.uri.includes('YOUR_')
);

const walletUri = (coin) => {
  if (!coin.uri) {
    return '';
  }

  return coin.address
    ? coin.uri.replaceAll('{address}', coin.address)
    : coin.uri;
};

let generated = 0;

for (const coin of coins) {
  const payload = coin.qrMode === 'uri' ? walletUri(coin) : coin.address;

  if (!payload) {
    console.warn(`Skipping ${coin.id}: no address or URI to encode.`);
    continue;
  }

  const target = join(docsDir, coin.qr);
  const svg = await QRCode.toString(payload, {
    type: 'svg',
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'M',
  });

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, svg, 'utf8');
  console.log(`QR  ${String(coin.name).padEnd(14)} -> ${coin.qr}`);
  generated++;
}

const docs = new Map();

for (const file of ['DONATE.md', 'README.md']) {
  docs.set(file, await readFile(join(root, file), 'utf8'));
}

for (const coin of coins) {
  if (!coin.placeholder || !coin.address || coin.address.startsWith('YOUR_')) {
    continue;
  }

  for (const [file, text] of docs) {
    docs.set(file, text.replaceAll(coin.placeholder, coin.address));
  }
}

for (const [file, text] of docs) {
  await writeFile(join(root, file), text, 'utf8');
}

console.log(`\nGenerated ${generated} QR code(s).`);

for (const [file, text] of docs) {
  const left = [...text.matchAll(/YOUR_[A-Z0-9_]+/g)].length;

  if (left > 0) {
    console.warn(`${file} still has ${left} placeholder(s).`);
  }
}

if (missingAddresses.length > 0 || placeholderUris.length > 0) {
  if (missingAddresses.length > 0) {
    console.error(
      `\n${missingAddresses.length} address(es) in docs/donate/index.html still start with YOUR_.`
    );
  }

  if (placeholderUris.length > 0) {
    console.error(
      `${placeholderUris.length} wallet URI(s) in docs/donate/index.html still contain YOUR_.`
    );
  }

  console.error(
    'Fix them in docs/donate/index.html and run `npm run donate:qr` again.'
  );
  process.exitCode = 1;
} else {
  console.log(
    '\nAll addresses look filled in. Scan a few QR codes with your phone before publishing.'
  );
}
