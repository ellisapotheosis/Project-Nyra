#!/usr/bin/env node

/**
 * Script to copy TinyMCE files from node_modules to public directory
 * This is needed for self-hosted TinyMCE (not using CDN)
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../node_modules/tinymce');
const targetDir = path.join(__dirname, '../public/tinymce');

// Check if source directory exists
if (!fs.existsSync(sourceDir)) {
  console.error('Error: TinyMCE not found in node_modules. Run npm install first.');
  process.exit(1);
}

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Function to copy directory recursively
function copyDir(src, dest) {
  // Create destination directory
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying TinyMCE files to public directory...');
try {
  copyDir(sourceDir, targetDir);
  console.log('✓ TinyMCE files copied successfully!');
} catch (error) {
  console.error('Error copying TinyMCE files:', error);
  process.exit(1);
}
