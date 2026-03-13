#!/usr/bin/env node
import { copyTemplates } from './batch-template-engine.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    config: null,
    dryRun: false,
    verbose: false,
    single: null,
    profile: null,
    context: {}
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--config') {
      options.config = args[++i];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === 'create' || arg === 'single') {
      options.single = args[++i]; // path
      options.profile = args[++i]; // profile
    } else if (arg.startsWith('--')) {
      // Parse option like --port=3000 or --name="My App"
      const [key, value] = arg.slice(2).split('=');
      options.context[key] = value ? value.replace(/['"]/g, '') : true;
    }
  }

  return options;
}

/**
 * Single directory bootstrap
 */
async function bootstrapSingle(path, profile, context, options) {
  console.log(`\n🚀 Bootstrapping single directory...`);
  console.log(`   Path: ${path}`);
  console.log(`   Profile: ${profile}`);

  if (options.dryRun) {
    console.log(`\n[DRY RUN] Would create:\n   - ${path}/CLAUDE.md\n   - ${path}/memory-bank.md\n   - ${path}/.workflows/\n   - ${path}/.env.template`);
    return;
  }

  const targetDir = join(process.cwd(), path);

  await copyTemplates(targetDir, {
    profile,
    context: {
      appName: context.name || path.split('/').pop(),
      description: context.description || `${profile} application`,
      port: context.port || '3000',
      techStack: [profile],
      ...context
    },
    skipMemory: options.skipMemory,
    skipWorkflows: options.skipWorkflows
  });
}

/**
 * Batch initialization from config file
 */
async function runBatch(configPath, options) {
  console.log("🚀 Starting Project Nyra Batch Initialization...\n");

  try {
    // Read the blueprint
    const layoutPath = configPath || join(process.cwd(), 'nyra-layout.json');
    console.log(`   Loading configuration: ${layoutPath}`);

    const layout = JSON.parse(await readFile(layoutPath, 'utf8'));
    const items = Array.isArray(layout) ? layout : layout.directories;

    console.log(`   Found ${items.length} directories to process\n`);

    if (options.dryRun) {
      console.log(`[DRY RUN] Would process:`);
      items.forEach(item => {
        console.log(`   - ${item.path} [${item.profile}]`);
      });
      return;
    }

    // Execute for each folder
    let successCount = 0;
    let errorCount = 0;

    for (const item of items) {
      try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📂 Processing: ${item.path} [${item.profile}]`);
        console.log('='.repeat(60));

        const targetDir = join(process.cwd(), item.path);

        await copyTemplates(targetDir, {
          profile: item.profile,
          context: item.context,
          skipMemory: options.skipMemory,
          skipWorkflows: options.skipWorkflows
        });

        successCount++;
      } catch (error) {
        console.error(`\n❌ Failed to process ${item.path}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`\n✨ Batch Initialization Complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Your agents are ready to work!\n`);

  } catch (error) {
    console.error("\n💥 Fatal Error:", error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Display usage information
 */
function showUsage() {
  console.log(`
Bootstrap Agent - Project Initialization Tool

USAGE:
  node batch-init.js [command] [options]

COMMANDS:
  create <path> <profile>     Bootstrap a single directory
  batch --config=<file>       Batch bootstrap from config file

OPTIONS:
  --config=<file>             Configuration file (default: nyra-layout.json)
  --dry-run                   Preview without creating files
  --verbose, -v               Verbose output
  --skip-memory               Skip memory-bank.md generation
  --skip-workflows            Skip workflow generation

CONTEXT OPTIONS (for single directory):
  --name="App Name"           Application name
  --description="..."         Application description
  --port=3000                 Service port
  --type="Application"        Application type

EXAMPLES:
  # Bootstrap single directory
  node batch-init.js create ./apps/new-app nextjs-typescript --port=3005

  # Batch bootstrap
  node batch-init.js batch --config=nyra-layout.json

  # Dry run
  node batch-init.js batch --dry-run --verbose

  # With custom context
  node batch-init.js create ./apps/dashboard react-typescript \\
    --name="Analytics Dashboard" \\
    --port=3006 \\
    --description="Real-time analytics"
`);
}

/**
 * Main entry point
 */
async function main() {
  const options = parseArgs();

  // Show usage if no command
  if (!options.single && !options.config && process.argv.length <= 2) {
    showUsage();
    return;
  }

  try {
    if (options.single) {
      // Single directory bootstrap
      await bootstrapSingle(options.single, options.profile, options.context, options);
    } else {
      // Batch bootstrap
      await runBatch(options.config, options);
    }
  } catch (error) {
    console.error('\n💥 Fatal error:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { runBatch, bootstrapSingle };
