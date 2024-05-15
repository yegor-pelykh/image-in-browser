import fs from 'fs';
import path from 'path';

const srcDirectory = 'src';

/**
 * Returns a list of files in a folder (with recursive traversal).
 */
function getFiles(dir) {
  const results = [];
  const files = fs.readdirSync(dir, {
    recursive: true,
  });
  for (const filePath of files) {
    const fullPath = path.join(dir, filePath);
    const stat = fs.statSync(fullPath);
    if (stat.isFile()) {
      results.push(fullPath);
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
    const currentContent = fs.readFileSync(file, {
      encoding: 'utf8',
    });
    const newContent = currentContent.replace(regexpForImport, stringToReplace);
    fs.writeFileSync(file, newContent, {
      encoding: 'utf8',
    });
  }
  console.info('Import normalization has been completed.');
};

function runPreBuildTasks() {
  console.info('Starting pre-build tasks...');
  normalizeImports();
  console.info('Pre-build tasks are completed.');
}

runPreBuildTasks();