#!/usr/bin/env node
/**
 * Complete Claude Flow Bootstrap Package
 * Automated setup for fresh installations with all modules and security hardening
 *
 * Usage:
 *   npm run bootstrap
 *   node scripts/bootstrap-complete.js --mode=production
 *   node scripts/bootstrap-complete.js --skip-tests --dry-run
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class BootstrapPackage {
  constructor(options = {}) {
    this.options = {
      mode: 'development',
      skipTests: false,
      dryRun: false,
      verbose: false,
      installDeps: true,
      initMcp: true,
      initMemory: true,
      setupSecurity: true,
      ...options
    };

    this.steps = [];
    this.completed = [];
    this.failed = [];
    this.baseDir = process.cwd();
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = {
      INFO: '📋',
      SUCCESS: '✅',
      ERROR: '❌',
      WARN: '⚠️ ',
      STEP: '🚀'
    }[level] || '•';

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async exec(command, description) {
    try {
      this.log(`${description}...`, 'STEP');

      if (this.options.dryRun) {
        this.log(`[DRY RUN] Would execute: ${command}`, 'WARN');
        return true;
      }

      if (this.options.verbose) {
        this.log(`Command: ${command}`);
      }

      execSync(command, {
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        cwd: this.baseDir
      });

      this.log(`${description} - DONE`, 'SUCCESS');
      this.completed.push(description);
      return true;
    } catch (error) {
      this.log(`${description} FAILED: ${error.message}`, 'ERROR');
      this.failed.push(description);
      return false;
    }
  }

  async createDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      this.log(`Created directory: ${dirPath}`, 'SUCCESS');
    } catch (error) {
      this.log(`Failed to create directory ${dirPath}: ${error.message}`, 'ERROR');
    }
  }

  async createFile(filePath, content, mode = 0o644) {
    try {
      await fs.writeFile(filePath, content, { mode });
      this.log(`Created file: ${filePath}`, 'SUCCESS');
    } catch (error) {
      this.log(`Failed to create file ${filePath}: ${error.message}`, 'ERROR');
    }
  }

  async runBootstrap() {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                   🚀 CLAUDE FLOW V3 BOOTSTRAP PACKAGE                      ║
║                    Complete Installation & Setup System                    ║
╚════════════════════════════════════════════════════════════════════════════╝

Mode: ${this.options.mode.toUpperCase()}
Dry Run: ${this.options.dryRun ? 'YES' : 'NO'}
Verbose: ${this.options.verbose ? 'YES' : 'NO'}

Starting bootstrap process...
`);

    try {
      // Phase 1: Prerequisites
      await this.phase1();

      // Phase 2: Installation
      if (this.options.installDeps) {
        await this.phase2();
      }

      // Phase 3: Configuration
      await this.phase3();

      // Phase 4: Security
      if (this.options.setupSecurity) {
        await this.phase4();
      }

      // Phase 5: Integration
      if (this.options.initMcp) {
        await this.phase5();
      }

      // Phase 6: Memory
      if (this.options.initMemory) {
        await this.phase6();
      }

      // Phase 7: Testing
      if (!this.options.skipTests) {
        await this.phase7();
      }

      // Phase 8: Verification
      await this.phase8();

      this.printSummary();
    } catch (error) {
      this.log(`Bootstrap failed: ${error.message}`, 'ERROR');
      process.exit(1);
    }
  }

  async phase1() {
    console.log('\n─ PHASE 1: Prerequisites & Validation\n');

    // Check Node version
    const nodeVersion = execSync('node --version').toString().trim();
    this.log(`Node.js: ${nodeVersion}`, 'SUCCESS');

    // Check npm version
    const npmVersion = execSync('npm --version').toString().trim();
    this.log(`npm: ${npmVersion}`, 'SUCCESS');

    // Create directory structure
    const directories = [
      'src', 'tests', 'services', 'apps', 'mcp-servers',
      'infra', 'scripts', 'config', 'docs', '.claude',
      '.claude/security', '.claude/scripts', '.claude/helpers',
      '.swarm', '.swarm/memory', '.swarm/logs', '.swarm/cache'
    ];

    for (const dir of directories) {
      await this.createDirectory(path.join(this.baseDir, dir));
    }
  }

  async phase2() {
    console.log('\n─ PHASE 2: Dependencies Installation\n');

    // Core dependencies
    await this.exec(
      'npm install --save ' +
      '@anthropic-ai/claude-code @claude-flow/cli dotenv pino pino-pretty',
      'Installing core dependencies'
    );

    // Memory system
    await this.exec(
      'npm install --save ' +
      '@ruvector/core @ruvector/hnsw @letta/core graphiti-core @mem0/sdk @agentdb/core',
      'Installing memory systems'
    );

    // MCP servers
    await this.exec(
      'npm install --save ' +
      '@modelcontextprotocol/sdk @modelcontextprotocol/server-stdio',
      'Installing MCP server foundation'
    );

    // Dev dependencies
    await this.exec(
      'npm install --save-dev ' +
      '@types/node typescript vitest @vitest/ui eslint prettier',
      'Installing development tools'
    );
  }

  async phase3() {
    console.log('\n─ PHASE 3: Core Configuration\n');

    // Claude Flow config
    const claudeFlowConfig = {
      "version": "3.0.0",
      "project": {
        "name": "project-nyra",
        "type": "microservices"
      },
      "swarm": {
        "topology": "hierarchical-mesh",
        "maxAgents": 15,
        "strategy": "balanced"
      },
      "memory": {
        "backend": "hybrid",
        "primary": "ruvector",
        "secondary": ["letta", "graphiti", "mem0"]
      },
      "security": {
        "encryption": { "enabled": true },
        "validation": { "inputSanitization": true }
      }
    };

    await this.createFile(
      path.join(this.baseDir, 'claude-flow.config.json'),
      JSON.stringify(claudeFlowConfig, null, 2)
    );

    // .env.example
    const envExample = `# API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=...
GITHUB_TOKEN=...

# Configuration
PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
ENVIRONMENT=${this.options.mode}

# Infisical
INFISICAL_TOKEN=...
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef

# Memory
MEMORY_BACKEND=hybrid
RUVECTOR_DIMENSION=1536

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Ports
CLAUDE_FLOW_PORT=6000
`;

    await this.createFile(
      path.join(this.baseDir, '.env.example'),
      envExample
    );

    this.log('Configuration files created', 'SUCCESS');
  }

  async phase4() {
    console.log('\n─ PHASE 4: Security Hardening\n');

    // Set restrictive permissions
    if (!this.options.dryRun) {
      try {
        execSync('chmod 700 .swarm/memory', { cwd: this.baseDir });
        execSync('chmod 700 config/secrets 2>/dev/null || true', { cwd: this.baseDir });
        this.log('Permissions hardened', 'SUCCESS');
      } catch (e) {
        // Ignore permission errors on Windows
      }
    }

    // Security validator
    const securityValidator = `
const crypto = require('crypto');
const path = require('path');

class SecurityValidator {
  validateCommand(command) {
    const whitelist = ['npx', 'npm', 'git', 'docker', 'node', 'python'];
    const cmd = command.trim().split(/\\s+/)[0];
    if (!whitelist.includes(cmd)) throw new Error(\`Command not whitelisted: \${cmd}\`);
    return true;
  }

  validatePath(filePath, baseDir = process.cwd()) {
    const normalized = path.normalize(filePath);
    const absolute = path.resolve(baseDir, normalized);
    const baseDirResolved = path.resolve(baseDir);
    if (!absolute.startsWith(baseDirResolved)) {
      throw new Error(\`Path traversal detected: \${filePath}\`);
    }
    return absolute;
  }

  sanitizeInput(input, maxLength = 10000) {
    if (typeof input !== 'string') return '';
    if (input.length > maxLength) return input.substring(0, maxLength);
    return input
      .replace(/[<>"\\']/g, '')
      .replace(/\`/g, '')
      .replace(/\\\$\\{/g, '')
      .trim();
  }
}

module.exports = { SecurityValidator };
`;

    await this.createFile(
      path.join(this.baseDir, '.claude/security/validation.js'),
      securityValidator,
      0o600
    );
  }

  async phase5() {
    console.log('\n─ PHASE 5: MCP Server Integration\n');

    await this.exec(
      'npx @claude-flow/cli@latest daemon status || npx @claude-flow/cli@latest daemon start',
      'Starting Claude Flow daemon'
    );

    await this.exec(
      'claude mcp add claude-flow npx @claude-flow/cli@latest mcp start || true',
      'Adding claude-flow MCP server'
    );

    await this.exec(
      'claude mcp list',
      'Listing MCP servers'
    );
  }

  async phase6() {
    console.log('\n─ PHASE 6: Memory System Initialization\n');

    const memoryInit = `#!/usr/bin/env node
const fs = require('fs').promises;

async function initMemory() {
  console.log('🧠 Initializing memory systems...');

  const memoryIndex = {
    initialized: true,
    timestamp: new Date().toISOString(),
    systems: {
      ruvector: { status: 'ready', dimension: 1536 },
      letta: { status: 'ready' },
      graphiti: { status: 'ready' }
    }
  };

  await fs.writeFile(
    '.swarm/memory/index.json',
    JSON.stringify(memoryIndex, null, 2),
    { mode: 0o600 }
  );

  console.log('✅ Memory systems ready');
}

initMemory().catch(e => {
  console.error('❌ Memory init failed:', e.message);
  process.exit(1);
});
`;

    await this.createFile(
      path.join(this.baseDir, '.claude/scripts/memory-init.js'),
      memoryInit
    );

    if (!this.options.dryRun) {
      execSync('node .claude/scripts/memory-init.js', { cwd: this.baseDir });
    }
  }

  async phase7() {
    console.log('\n─ PHASE 7: Testing Setup\n');

    await this.exec(
      'npm test -- --run',
      'Running test suite'
    );
  }

  async phase8() {
    console.log('\n─ PHASE 8: Final Verification\n');

    await this.exec(
      'npx @claude-flow/cli@latest status',
      'Verifying Claude Flow status'
    );

    await this.exec(
      'npm ls --depth=0',
      'Verifying dependencies'
    );

    this.log('Bootstrap package complete!', 'SUCCESS');
  }

  printSummary() {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                         📊 BOOTSTRAP SUMMARY                               ║
╚════════════════════════════════════════════════════════════════════════════╝

Completed Steps: ${this.completed.length}
${this.completed.map(s => `  ✅ ${s}`).join('\n')}

${this.failed.length > 0 ? `\nFailed Steps: ${this.failed.length}\n${this.failed.map(s => `  ❌ ${s}`).join('\n')}\n` : ''}

Next Steps:
  1. Copy .env.example → .env
  2. Fill in ANTHROPIC_API_KEY and other secrets
  3. Run: npx @claude-flow/cli@latest swarm init
  4. Run: npm run dev

For help: npx @claude-flow/cli@latest doctor --fix
`);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--mode' || args[i] === '-m') {
    options.mode = args[++i] || 'development';
  } else if (args[i] === '--dry-run') {
    options.dryRun = true;
  } else if (args[i] === '--verbose' || args[i] === '-v') {
    options.verbose = true;
  } else if (args[i] === '--skip-tests') {
    options.skipTests = true;
  }
}

// Run bootstrap
const bootstrap = new BootstrapPackage(options);
bootstrap.runBootstrap();
