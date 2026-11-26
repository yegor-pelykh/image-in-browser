#!/usr/bin/env node
/** @format */
/* eslint-disable no-console */

// Removes the generated lib directory before a build.
//
// Run from anywhere: npm run clean:lib

import { rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const libDir = join(root, 'lib');

await rm(libDir, { recursive: true, force: true });
console.info('Cleaned lib/');
