#!/usr/bin/env node
/**
 * ================================
 * COMPOSABLE BRAIN BUILDER
 * ================================
 * Stacks atomic template modules to create custom CLAUDE.md files
 *
 * Usage:
 *   node build-brains.js --config=nyra-structure.json
 *   node build-brains.js --config=nyra-structure.json --dry-run
 *   node build-brains.js --single ./apps/myapp --modules=base/enterprise-foundation,stack/react-nextjs
 */

import { existsSync, promises as fs } from 'fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODULES_DIR = join(__dirname, 'templates/modules');
const WIKI_DIR = join(__dirname, '../../../docs/references/archon-os-wiki');

// ========================================
// CONFIGURATION
// ========================================

const config = {
  verbose: false,
  dryRun: false,
  singleMode: false,
  targetPath: null,
  modules: [],
  configFile: 'nyra-structure.json'
};

// ========================================
// MODULE LOADER
// ========================================

/**
 * Load a template module with fallback to wiki templates
 * Priority: Local modules → Wiki templates → Error
 */
async function loadModule(moduleName) {
  // Try local modular template first
  const localPath = join(MODULES_DIR, `${moduleName}.md`);

  if (existsSync(localPath)) {
    const content = await fs.readFile(localPath, 'utf8');
    if (config.verbose) {
      console.log(`   ✓ Loaded module: ${moduleName}`);
    }
    return {
      name: moduleName,
      content,
      source: 'local'
    };
  }

  // Try wiki template as fallback
  const wikiName = moduleName.split('/').pop(); // Get last part (e.g., "react-nextjs" from "stack/react-nextjs")
  const wikiPath = join(WIKI_DIR, `CLAUDE-MD-${wikiName}.md`);

  if (existsSync(wikiPath)) {
    const content = await fs.readFile(wikiPath, 'utf8');
    if (config.verbose) {
      console.log(`   ✓ Loaded from wiki: ${wikiName}`);
    }
    return {
      name: moduleName,
      content,
      source: 'wiki'
    };
  }

  // Module not found
  console.warn(`   ⚠️  Module not found: ${moduleName} (checked local and wiki)`);
  return null;
}

/**
 * List available modules
 */
async function listAvailableModules() {
  console.log('\n📚 Available Template Modules:\n');

  const categories = ['base', 'stack', 'init', 'mode', 'enterprise'];

  for (const category of categories) {
    const categoryPath = join(MODULES_DIR, category);

    if (existsSync(categoryPath)) {
      const files = await fs.readdir(categoryPath);
      const modules = files.filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));

      if (modules.length > 0) {
        console.log(`\n${category.toUpperCase()}/`);
        modules.forEach(m => console.log(`  - ${category}/${m}`));
      }
    }
  }

  // Also show wiki templates
  if (existsSync(WIKI_DIR)) {
    const wikiFiles = await fs.readdir(WIKI_DIR);
    const wikiTemplates = wikiFiles
      .filter(f => f.startsWith('CLAUDE-MD-') && f.endsWith('.md'))
      .map(f => f.replace('CLAUDE-MD-', '').replace('.md', ''));

    if (wikiTemplates.length > 0) {
      console.log(`\nWIKI (fallback)/`);
      wikiTemplates.slice(0, 10).forEach(t => console.log(`  - wiki/${t}`));
      if (wikiTemplates.length > 10) {
        console.log(`  ... and ${wikiTemplates.length - 10} more`);
      }
    }
  }

  console.log('\n');
}

// ========================================
// CONTEXT INJECTION
// ========================================

/**
 * Inject context variables into content
 * Supports: {{variable}}, arrays, objects, nested properties
 */
function injectContext(content, context) {
  let result = content;

  if (!context) return result;

  // Flatten nested context (e.g., context.org.name → context.orgName)
  const flatContext = { ...context };

  Object.keys(context).forEach(key => {
    if (typeof context[key] === 'object' && !Array.isArray(context[key])) {
      Object.keys(context[key]).forEach(subKey => {
        flatContext[`${key}${subKey.charAt(0).toUpperCase()}${subKey.slice(1)}`] = context[key][subKey];
      });
    }
  });

  // Replace all {{variable}} placeholders
  Object.keys(flatContext).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    const value = flatContext[key];

    if (Array.isArray(value)) {
      result = result.replace(regex, value.join(', '));
    } else if (typeof value === 'object') {
      result = result.replace(regex, JSON.stringify(value, null, 2));
    } else {
      result = result.replace(regex, String(value || ''));
    }
  });

  // Remove any remaining unreplaced placeholders
  result = result.replace(/{{[^}]+}}/g, '[not configured]');

  return result;
}

// ========================================
// COMPOSITION ENGINE
// ========================================

/**
 * Compose CLAUDE.md from multiple modules
 * Stack modules in order, inject context, merge content
 */
async function composeClaudeMd(modules, context) {
  let finalContent = '';

  // 1. Generate header
  finalContent += `# CLAUDE.md - ${context.appName || context.name || 'Application'}\n\n`;
  finalContent += `> **Auto-generated** on ${new Date().toISOString().split('T')[0]}\n`;
  finalContent += `> **Modules**: ${modules.join(' → ')}\n`;
  finalContent += `> **Environment**: ${context.environment || 'development'}\n\n`;
  finalContent += `---\n\n`;

  // 2. Load and stack each module
  let loadedCount = 0;

  for (const moduleName of modules) {
    const module = await loadModule(moduleName);

    if (module) {
      let content = module.content;

      // Inject context variables
      content = injectContext(content, context);

      // Add module content with separator
      finalContent += content;
      finalContent += `\n\n---\n\n`;

      loadedCount++;
    }
  }

  // 3. Add footer
  finalContent += `## 🤖 Template System Info\n\n`;
  finalContent += `- **Modules Loaded**: ${loadedCount}/${modules.length}\n`;
  finalContent += `- **Generated**: ${new Date().toISOString()}\n`;
  finalContent += `- **System**: Composable Brain Builder v2.0\n\n`;
  finalContent += `To regenerate:\n\`\`\`bash\nnode build-brains.js --config=nyra-structure.json\n\`\`\`\n`;

  return finalContent;
}

// ========================================
// BATCH PROCESSING
// ========================================

/**
 * Process batch configuration file
 * Generate CLAUDE.md for each directory in the recipe
 */
async function runBatch(configPath) {
  console.log('\n🏭 Starting Composable Brain Factory...\n');

  try {
    // Load configuration
    const fullConfigPath = join(process.cwd(), configPath);

    if (!existsSync(fullConfigPath)) {
      console.error(`❌ Config file not found: ${configPath}`);
      return;
    }

    const configContent = await fs.readFile(fullConfigPath, 'utf8');
    const layout = JSON.parse(configContent);
    const items = Array.isArray(layout) ? layout : layout.directories || [];

    console.log(`📋 Found ${items.length} directories to process\n`);

    if (config.dryRun) {
      console.log(`[DRY RUN] Would process:\n`);
      items.forEach((item, i) => {
        console.log(`${i + 1}. ${item.path}`);
        console.log(`   Modules: ${item.modules.join(' + ')}`);
      });
      return;
    }

    // Process each item
    let successCount = 0;
    let errorCount = 0;

    for (const [index, item] of items.entries()) {
      try {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`📂 [${index + 1}/${items.length}] ${item.path}`);
        console.log(`   Stacking: ${item.modules.join(' → ')}`);
        console.log('='.repeat(70));

        // Compose CLAUDE.md
        const content = await composeClaudeMd(item.modules, item.context || {});

        // Write file
        const targetPath = join(process.cwd(), item.path, 'CLAUDE.md');
        await fs.mkdir(dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, content);

        console.log(`   ✅ Deployed to: ${relative(process.cwd(), targetPath)}`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ Failed: ${error.message}`);
        errorCount++;
      }
    }

    // Summary
    console.log(`\n${'='.repeat(70)}`);
    console.log(`\n✨ Brain Factory Complete!\n`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Total: ${items.length}\n`);

  } catch (error) {
    console.error(`\n💥 Fatal Error: ${error.message}`);
    if (config.verbose) {
      console.error(error.stack);
    }
  }
}

/**
 * Process single directory (quick mode)
 */
async function runSingle(targetPath, modules, context = {}) {
  console.log(`\n🔨 Building single brain for: ${targetPath}\n`);
  console.log(`   Modules: ${modules.join(' + ')}\n`);

  try {
    const content = await composeClaudeMd(modules, context);

    if (config.dryRun) {
      console.log('[DRY RUN] Generated content:\n');
      console.log(content.substring(0, 500) + '...\n');
      return;
    }

    const fullPath = join(process.cwd(), targetPath, 'CLAUDE.md');
    await fs.mkdir(dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);

    console.log(`✅ Deployed to: ${relative(process.cwd(), fullPath)}\n`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (config.verbose) {
      console.error(error.stack);
    }
  }
}

// ========================================
// CLI ARGUMENT PARSING
// ========================================

function parseArgs() {
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      showUsage();
      process.exit(0);
    } else if (arg === '--list' || arg === '-l') {
      listAvailableModules().then(() => process.exit(0));
    } else if (arg === '--verbose' || arg === '-v') {
      config.verbose = true;
    } else if (arg === '--dry-run') {
      config.dryRun = true;
    } else if (arg.startsWith('--config=')) {
      config.configFile = arg.split('=')[1];
    } else if (arg === '--single') {
      config.singleMode = true;
      config.targetPath = args[++i];
    } else if (arg === '--modules' || arg === '-m') {
      config.modules = args[++i].split(',');
    }
  }
}

function showUsage() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Composable Brain Builder - Template Stacking System    ║
╚═══════════════════════════════════════════════════════════╝

USAGE:
  node build-brains.js [command] [options]

COMMANDS:
  --config=<file>             Batch process from config file
  --single <path>             Process single directory
  --list, -l                  List available modules
  --help, -h                  Show this help

OPTIONS:
  --modules=<mod1,mod2>       Modules to stack (comma-separated)
  --dry-run                   Preview without creating files
  --verbose, -v               Verbose output

EXAMPLES:
  # Batch process from config
  node build-brains.js --config=nyra-structure.json

  # Single directory with custom modules
  node build-brains.js --single ./apps/payment \\
    --modules=base/enterprise-foundation,stack/java-spring,init/security-hardened,mode/production-ready

  # Dry run to preview
  node build-brains.js --config=nyra-structure.json --dry-run

  # List available modules
  node build-brains.js --list

MODULE CATEGORIES:
  base/         - Foundation modules (enterprise, project basics)
  stack/        - Tech stack specific (react, java, python, etc.)
  init/         - Initialization modes (security, verification)
  mode/         - Operating modes (production, development, strict)
  enterprise/   - Enterprise features (compliance, audit)
  wiki/         - Fallback to Claude Flow wiki templates

`);
}

// ========================================
// MAIN ENTRY POINT
// ========================================

async function main() {
  parseArgs();

  // Show header
  console.log('\n' + '='.repeat(70));
  console.log('  🧠 COMPOSABLE BRAIN BUILDER v2.0');
  console.log('  Stack atomic templates to create custom CLAUDE.md files');
  console.log('='.repeat(70));

  if (config.singleMode) {
    if (!config.targetPath || config.modules.length === 0) {
      console.error('\n❌ Error: --single requires --modules');
      console.log('Example: --single ./apps/myapp --modules=base/enterprise,stack/react\n');
      process.exit(1);
    }
    await runSingle(config.targetPath, config.modules);
  } else {
    await runBatch(config.configFile);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` ||
    import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main().catch(console.error);
}

export { composeClaudeMd, loadModule, runBatch, runSingle };
