/** @format */
/* eslint-disable no-console */

// Normalizes relative imports in src/ so they include the .js extension.
//
// Run from anywhere: npm run normalize:src

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDirectory = join(root, 'src');

/**
 * Returns a list of files in a folder (with recursive traversal).
 */
function getFiles(dir) {
  const results = [];
  const files = readdirSync(dir, {
    recursive: true,
  });
  for (const filePath of files) {
    if (typeof filePath === 'string') {
      const fullPath = join(dir, filePath);
      const stat = statSync(fullPath);
      if (stat.isFile()) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

/**
 * Normalize imports to comply with ES-module standards.
 */
function normalizeImports() {
  console.info('Import normalization...');
  const regexpForImport = /(from\s+)(["'])(?!.*\.js)(\.?\.\/.*)(["'])/gm;
  const stringToReplace = '$1$2$3.js$4';
  const files = getFiles(srcDirectory);
  for (const file of files) {
    const currentContent = readFileSync(file, {
      encoding: 'utf8',
    });
    const newContent = currentContent.replace(regexpForImport, stringToReplace);
    writeFileSync(file, newContent, {
      encoding: 'utf8',
    });
  }
  console.info('Import normalization has been completed.');
}

function runNormalizeImports() {
  console.info('Starting import normalization...');
  normalizeImports();
  console.info('Import normalization is complete.');
}

runNormalizeImports();
