#!/usr/bin/env node
/**
 * Batch CLAUDE.md Template Engine
 * Purpose: Generate custom CLAUDE.md for every directory in Project-Nyra
 * Based on template-copier.js approach with context injection
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  projectRoot: path.resolve(__dirname, '../..'),
  manifestPath: path.resolve(__dirname, 'nyra-layout.json'),
  templatesDir: path.resolve(__dirname, 'templates'),
  outputDir: path.resolve(__dirname, '../..'), // Output to repo root
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
};

// Logging utilities
const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
  error: (msg) => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  verbose: (msg) => config.verbose && console.log(`[VERBOSE] ${msg}`),
};

/**
 * Load tech stack specific rules from template files
 */
async function loadStackRules(stackType) {
  const stackTemplatesPath = path.join(config.templatesDir, 'stacks', `${stackType}.md`);

  try {
    const content = await fs.readFile(stackTemplatesPath, 'utf8');
    return content;
  } catch (error) {
    log.warning(`Stack template not found: ${stackType}.md, using defaults`);
    return '';
  }
}

/**
 * Inject context variables into template content
 */
function injectContext(content, context) {
  let result = content;

  // Replace all {{variable}} placeholders
  Object.entries(context).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');

    // Handle arrays (like techStack)
    if (Array.isArray(value)) {
      result = result.replace(regex, value.join(', '));
    }
    // Handle objects (like workflows)
    else if (typeof value === 'object') {
      result = result.replace(regex, JSON.stringify(value, null, 2));
    }
    // Handle strings/numbers
    else {
      result = result.replace(regex, String(value));
    }
  });

  // Remove any remaining un-replaced placeholders
  result = result.replace(/{{[^}]+}}/g, '');

  return result;
}

/**
 * Generate CLAUDE.md from template with context injection
 */
async function generateClaudeMd(directoryConfig) {
  const { path: dirPath, profile, context } = directoryConfig;

  log.verbose(`Generating CLAUDE.md for ${dirPath}`);

  // Load base template
  const baseTemplatePath = path.join(config.templatesDir, 'CLAUDE.md.base');
  let template = await fs.readFile(baseTemplatePath, 'utf8');

  // Load stack-specific rules
  const stackRules = await loadStackRules(profile);

  // Inject stack-specific content
  template = template.replace('{{STACK_SPECIFIC_CONTENT}}', stackRules);

  // Inject context variables
  template = injectContext(template, {
    ...context,
    profile,
    generationDate: new Date().toISOString().split('T')[0],
  });

  // Determine output path
  const outputPath = path.join(config.outputDir, dirPath, 'CLAUDE.md');

  if (config.dryRun) {
    log.info(`[DRY RUN] Would create: ${outputPath}`);
    return { path: outputPath, dryRun: true };
  }

  // Ensure directory exists
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  // Write CLAUDE.md
  await fs.writeFile(outputPath, template, 'utf8');
  log.success(`Created: ${outputPath}`);

  return { path: outputPath, success: true };
}

/**
 * Load layout manifest
 */
async function loadManifest() {
  try {
    const content = await fs.readFile(config.manifestPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log.error(`Failed to load manifest: ${config.manifestPath}`);
    log.error(error.message);
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  log.info('Batch CLAUDE.md Generator Starting...');
  log.info(`Project Root: ${config.projectRoot}`);
  log.info(`Manifest: ${config.manifestPath}`);
  log.info(`Templates: ${config.templatesDir}`);
  log.info(`Dry Run: ${config.dryRun}`);
  console.log('');

  // Load manifest
  const manifest = await loadManifest();
  log.info(`Loaded ${manifest.directories.length} directory configurations`);
  console.log('');

  // Track results
  const results = {
    success: [],
    failed: [],
    skipped: [],
  };

  // Generate CLAUDE.md for each directory
  for (const dirConfig of manifest.directories) {
    try {
      const result = await generateClaudeMd(dirConfig);

      if (result.dryRun) {
        results.skipped.push(dirConfig.path);
      } else if (result.success) {
        results.success.push(dirConfig.path);
      }
    } catch (error) {
      log.error(`Failed to generate CLAUDE.md for ${dirConfig.path}`);
      log.error(error.message);
      results.failed.push(dirConfig.path);
    }
  }

  // Summary
  console.log('');
  log.info('=== GENERATION SUMMARY ===');
  log.success(`Success: ${results.success.length}`);
  log.warning(`Skipped (dry run): ${results.skipped.length}`);
  log.error(`Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('');
    log.error('Failed directories:');
    results.failed.forEach(dir => log.error(`  - ${dir}`));
  }

  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run
main().catch((error) => {
  log.error('Fatal error:');
  log.error(error.message);
  console.error(error.stack);
  process.exit(1);
});
