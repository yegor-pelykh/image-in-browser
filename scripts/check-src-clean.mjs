#!/usr/bin/env node
/** @format */
/* eslint-disable no-console */

// Fails when src/ has staged, unstaged, or untracked changes.
//
// Run from anywhere: npm run check:src-clean
//
// `git status --porcelain` is used instead of `git diff --exit-code` because it
// also catches staged and untracked files.

import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

try {
  const status = execFileSync('git', ['status', '--porcelain', '--', 'src/'], {
    cwd: root,
    encoding: 'utf8',
  });

  if (status.trim()) {
    console.error('src/ has staged, unstaged, or untracked changes:');
    console.error(status.trimEnd());
    console.error('Commit or revert them before continuing.');
    process.exitCode = 1;
  } else {
    console.info('src/ is clean.');
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Unable to check src/ with git:', message);
  process.exitCode = 1;
}
